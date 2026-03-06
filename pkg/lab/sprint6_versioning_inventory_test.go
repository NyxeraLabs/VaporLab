package lab

import (
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
