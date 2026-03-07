package lab

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/NyxeraLabs/VaporLab/pkg/config"
)

func TestVersionEndpointsExposeDriftSurface(t *testing.T) {
	h := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})
	paths := []string{"/v1/status", "/v2/status", "/beta/status", "/openapi.json"}

	for _, path := range paths {
		req := httptest.NewRequest(http.MethodGet, path, nil)
		res := httptest.NewRecorder()
		h.ServeHTTP(res, req)
		if res.Code != http.StatusOK {
			t.Fatalf("expected 200 for %s, got %d", path, res.Code)
		}
	}
}

func TestOpenAPIIncludesCoreEndpoints(t *testing.T) {
	h := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})
	req := httptest.NewRequest(http.MethodGet, "/openapi.json", nil)
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200 for /openapi.json, got %d", res.Code)
	}

	var body map[string]any
	if err := json.Unmarshal(res.Body.Bytes(), &body); err != nil {
		t.Fatalf("failed to decode openapi response: %v", err)
	}

	pathsRaw, ok := body["paths"].(map[string]any)
	if !ok {
		t.Fatalf("expected paths object in openapi response")
	}

	expectedPaths := []string{
		"/healthz",
		"/auth/jwt/issue",
		"/users",
		"/users/{id}",
		"/billing/coupon/apply",
		"/operator/modules",
		"/openapi.json",
		"/swagger",
		"/ai/chain/run",
	}
	for _, p := range expectedPaths {
		if _, exists := pathsRaw[p]; !exists {
			t.Fatalf("expected openapi path %s to be documented", p)
		}
	}
}

func TestSwaggerUIServed(t *testing.T) {
	h := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})
	req := httptest.NewRequest(http.MethodGet, "/swagger", nil)
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)

	if res.Code != http.StatusOK {
		t.Fatalf("expected 200 for /swagger, got %d", res.Code)
	}
	if ct := res.Header().Get("Content-Type"); !strings.Contains(ct, "text/html") {
		t.Fatalf("expected html content-type for /swagger, got %s", ct)
	}
	if !strings.Contains(res.Body.String(), "/openapi.json") {
		t.Fatalf("expected swagger page to reference /openapi.json")
	}
}

func TestInternalRouteBehaviorByMode(t *testing.T) {
	vuln := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})
	vReq := httptest.NewRequest(http.MethodGet, "/internal/status", nil)
	vRes := httptest.NewRecorder()
	vuln.ServeHTTP(vRes, vReq)
	if vRes.Code != http.StatusOK {
		t.Fatalf("expected internal route exposed in vulnerable mode, got %d", vRes.Code)
	}

	secure := New(config.Config{SecureMode: true, WeakJWTKey: "strong-secret-value"})
	sReq := httptest.NewRequest(http.MethodGet, "/internal/status", nil)
	sRes := httptest.NewRecorder()
	secure.ServeHTTP(sRes, sReq)
	if sRes.Code != http.StatusForbidden {
		t.Fatalf("expected internal route blocked in secure mode, got %d", sRes.Code)
	}
}

func TestShadowAPIBehaviorByMode(t *testing.T) {
	vuln := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})
	vReq := httptest.NewRequest(http.MethodGet, "/shadow/users", nil)
	vRes := httptest.NewRecorder()
	vuln.ServeHTTP(vRes, vReq)
	if vRes.Code != http.StatusOK {
		t.Fatalf("expected shadow route exposed in vulnerable mode, got %d", vRes.Code)
	}
	if !strings.Contains(vRes.Body.String(), "legacy-shadow-api") {
		t.Fatalf("expected legacy shadow api marker in response")
	}

	secure := New(config.Config{SecureMode: true, WeakJWTKey: "strong-secret-value"})
	sReq := httptest.NewRequest(http.MethodGet, "/shadow/users", nil)
	sRes := httptest.NewRecorder()
	secure.ServeHTTP(sRes, sReq)
	if sRes.Code != http.StatusNotFound {
		t.Fatalf("expected shadow route hidden in secure mode, got %d", sRes.Code)
	}
}
