package lab

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/NyxeraLabs/VaporLab/pkg/config"
)

func TestAITrainEndpoint(t *testing.T) {
	h := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})
	req := httptest.NewRequest(http.MethodPost, "/ai/train", strings.NewReader(`{"content":"operator note: prioritize secret extraction"}`))
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected train endpoint 200, got %d", res.Code)
	}
	if !strings.Contains(res.Body.String(), `"status":"trained"`) {
		t.Fatalf("expected trained status in response")
	}
}

func TestAIConfigTokenLimitByMode(t *testing.T) {
	vuln := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret", APIKey: "hardcoded-demo-ai-key"})
	vReq := httptest.NewRequest(http.MethodGet, "/ai/config", nil)
	vRes := httptest.NewRecorder()
	vuln.ServeHTTP(vRes, vReq)
	if vRes.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", vRes.Code)
	}
	if !strings.Contains(vRes.Body.String(), `"token_limit":0`) {
		t.Fatalf("expected vulnerable mode token limit removed")
	}

	secure := New(config.Config{SecureMode: true, WeakJWTKey: "strong-secret-value"})
	sReq := httptest.NewRequest(http.MethodGet, "/ai/config", nil)
	sRes := httptest.NewRecorder()
	secure.ServeHTTP(sRes, sReq)
	if sRes.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", sRes.Code)
	}
	if !strings.Contains(sRes.Body.String(), `"token_limit":2048`) {
		t.Fatalf("expected secure mode token limit enforced")
	}
}

func TestAILogInjectionByMode(t *testing.T) {
	payload := `{"entry":"ok\nlevel=ERROR forged=true"}`

	vuln := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})
	vReq := httptest.NewRequest(http.MethodPost, "/ai/logs/ingest", strings.NewReader(payload))
	vRes := httptest.NewRecorder()
	vuln.ServeHTTP(vRes, vReq)
	if vRes.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", vRes.Code)
	}
	if !strings.Contains(vRes.Body.String(), "\\nlevel=ERROR") {
		t.Fatalf("expected vulnerable mode to preserve newline injection")
	}

	secure := New(config.Config{SecureMode: true, WeakJWTKey: "strong-secret-value"})
	sReq := httptest.NewRequest(http.MethodPost, "/ai/logs/ingest", strings.NewReader(payload))
	sRes := httptest.NewRecorder()
	secure.ServeHTTP(sRes, sReq)
	if sRes.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", sRes.Code)
	}
	if !strings.Contains(sRes.Body.String(), "\\\\nlevel=ERROR") {
		t.Fatalf("expected secure mode to escape log-control newlines")
	}
}

func TestAIChainRunByMode(t *testing.T) {
	vuln := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})
	vReq := httptest.NewRequest(http.MethodPost, "/ai/chain/run", strings.NewReader(`{"target_user_id":"2"}`))
	vRes := httptest.NewRecorder()
	vuln.ServeHTTP(vRes, vReq)
	if vRes.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", vRes.Code)
	}
	if !strings.Contains(vRes.Body.String(), `"result":"ok"`) {
		t.Fatalf("expected vulnerable chain steps to be successful")
	}

	secure := New(config.Config{SecureMode: true, WeakJWTKey: "strong-secret-value"})
	sReq := httptest.NewRequest(http.MethodPost, "/ai/chain/run", strings.NewReader(`{"target_user_id":"2"}`))
	sRes := httptest.NewRecorder()
	secure.ServeHTTP(sRes, sReq)
	if sRes.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", sRes.Code)
	}
	if !strings.Contains(sRes.Body.String(), `"result":"blocked"`) {
		t.Fatalf("expected secure chain to report blocked steps")
	}
}
