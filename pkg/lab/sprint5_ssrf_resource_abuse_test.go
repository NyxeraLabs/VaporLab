package lab

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/NyxeraLabs/VaporLab/pkg/config"
)

func TestSSRFFetchAllowsLocalhostInVulnerableMode(t *testing.T) {
	internal := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		_, _ = w.Write([]byte("internal-ok"))
	}))
	defer internal.Close()

	h := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})
	req := httptest.NewRequest(http.MethodGet, "/ssrf/fetch?url="+internal.URL, nil)
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200 in vulnerable mode, got %d", res.Code)
	}
	if !strings.Contains(res.Body.String(), "internal-ok") {
		t.Fatalf("expected SSRF body to include internal response")
	}
}

func TestSSRFFetchBlocksLocalhostInSecureMode(t *testing.T) {
	h := New(config.Config{SecureMode: true, WeakJWTKey: "strong-secret-value"})
	req := httptest.NewRequest(http.MethodGet, "/ssrf/fetch?url=http://127.0.0.1:18080/healthz", nil)
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)

	if res.Code != http.StatusForbidden {
		t.Fatalf("expected 403 in secure mode for internal SSRF target, got %d", res.Code)
	}
}

func TestGraphQLDeepNestingBehaviorByMode(t *testing.T) {
	query := `{"query":"query { a { b { c { d { e { f { g { h { i { j { k } } } } } } } } } } }"}`

	vuln := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})
	vReq := httptest.NewRequest(http.MethodPost, "/graphql", strings.NewReader(query))
	vRes := httptest.NewRecorder()
	vuln.ServeHTTP(vRes, vReq)
	if vRes.Code != http.StatusOK {
		t.Fatalf("expected vulnerable mode to accept deep nesting, got %d", vRes.Code)
	}

	secure := New(config.Config{SecureMode: true, WeakJWTKey: "strong-secret-value"})
	sReq := httptest.NewRequest(http.MethodPost, "/graphql", strings.NewReader(query))
	sRes := httptest.NewRecorder()
	secure.ServeHTTP(sRes, sReq)
	if sRes.Code != http.StatusBadRequest {
		t.Fatalf("expected secure mode to reject deep nesting, got %d", sRes.Code)
	}
}

func TestSSRFRateLimitBypassBehaviorByMode(t *testing.T) {
	vuln := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})
	vReq := httptest.NewRequest(http.MethodGet, "/ssrf/rate-limit-bypass", nil)
	vRes := httptest.NewRecorder()
	vuln.ServeHTTP(vRes, vReq)
	if vRes.Code != http.StatusOK {
		t.Fatalf("expected bypass endpoint to succeed in vulnerable mode, got %d", vRes.Code)
	}

	secure := New(config.Config{SecureMode: true, WeakJWTKey: "strong-secret-value"})
	sReq := httptest.NewRequest(http.MethodGet, "/ssrf/rate-limit-bypass", nil)
	sRes := httptest.NewRecorder()
	secure.ServeHTTP(sRes, sReq)
	if sRes.Code != http.StatusTooManyRequests {
		t.Fatalf("expected secure mode to enforce rate limit, got %d", sRes.Code)
	}
}

func TestExcessiveDataExposureBehaviorByMode(t *testing.T) {
	vuln := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret", APIKey: "hardcoded-demo-ai-key"})
	vReq := httptest.NewRequest(http.MethodGet, "/data/exposure", nil)
	vRes := httptest.NewRecorder()
	vuln.ServeHTTP(vRes, vReq)
	if vRes.Code != http.StatusOK {
		t.Fatalf("expected 200 for vulnerable data exposure endpoint, got %d", vRes.Code)
	}

	var vulnOut map[string]any
	if err := json.Unmarshal(vRes.Body.Bytes(), &vulnOut); err != nil {
		t.Fatalf("decode failed: %v", err)
	}
	debug, ok := vulnOut["debug"].(map[string]any)
	if !ok || debug["jwt_secret"] == nil {
		t.Fatalf("expected vulnerable response to expose debug secrets")
	}

	secure := New(config.Config{SecureMode: true, WeakJWTKey: "strong-secret-value", APIKey: "real-key"})
	sReq := httptest.NewRequest(http.MethodGet, "/data/exposure", nil)
	sRes := httptest.NewRecorder()
	secure.ServeHTTP(sRes, sReq)
	if sRes.Code != http.StatusOK {
		t.Fatalf("expected 200 for secure exposure endpoint, got %d", sRes.Code)
	}
	if strings.Contains(sRes.Body.String(), "jwt_secret") {
		t.Fatalf("expected secure response to avoid secret exposure")
	}
}

func TestUploadSizeLimitBehaviorByMode(t *testing.T) {
	payload := bytes.Repeat([]byte("A"), 3<<20) // 3MB

	vuln := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})
	vReq := httptest.NewRequest(http.MethodPost, "/upload", bytes.NewReader(payload))
	vRes := httptest.NewRecorder()
	vuln.ServeHTTP(vRes, vReq)
	if vRes.Code != http.StatusOK {
		t.Fatalf("expected vulnerable mode upload to allow oversized payload, got %d", vRes.Code)
	}

	secure := New(config.Config{SecureMode: true, WeakJWTKey: "strong-secret-value"})
	sReq := httptest.NewRequest(http.MethodPost, "/upload", bytes.NewReader(payload))
	sRes := httptest.NewRecorder()
	secure.ServeHTTP(sRes, sReq)
	if sRes.Code != http.StatusRequestEntityTooLarge {
		t.Fatalf("expected secure mode upload to reject >2MB payload, got %d", sRes.Code)
	}
}
