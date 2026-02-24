package lab

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/NyxeraLabs/VaporLab/pkg/config"
)

func TestUsersCRUDCreateAndGet(t *testing.T) {
	h := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})
	createBody := `{"id":"10","tenant_id":"tenant-c","email":"eve@lab.local","role":"user","internal_notes":"i1","password":"pw","is_premium":true}`
	createReq := httptest.NewRequest(http.MethodPost, "/users", strings.NewReader(createBody))
	createReq.Header.Set("Content-Type", "application/json")
	createRes := httptest.NewRecorder()
	h.ServeHTTP(createRes, createReq)
	if createRes.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d", createRes.Code)
	}

	getReq := httptest.NewRequest(http.MethodGet, "/users/10", nil)
	getRes := httptest.NewRecorder()
	h.ServeHTTP(getRes, getReq)
	if getRes.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", getRes.Code)
	}

	var out map[string]any
	if err := json.Unmarshal(getRes.Body.Bytes(), &out); err != nil {
		t.Fatalf("decode failed: %v", err)
	}
	if out["email"] != "eve@lab.local" {
		t.Fatalf("unexpected email: %v", out["email"])
	}
}

func TestUsersIDORAllowedInVulnerableMode(t *testing.T) {
	h := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})
	req := httptest.NewRequest(http.MethodGet, "/users/2", nil)
	req.Header.Set("X-Tenant-ID", "tenant-a")
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected 200 for vulnerable IDOR, got %d", res.Code)
	}
}

func TestUsersIDORBlockedInSecureMode(t *testing.T) {
	h := New(config.Config{SecureMode: true, WeakJWTKey: "strongsecretvalue"})
	req := httptest.NewRequest(http.MethodGet, "/users/2", nil)
	req.Header.Set("X-Tenant-ID", "tenant-a")
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)
	if res.Code != http.StatusForbidden {
		t.Fatalf("expected 403 for tenant mismatch, got %d", res.Code)
	}
}

func TestUsersMassAssignmentRoleEscalationVulnerable(t *testing.T) {
	h := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})
	req := httptest.NewRequest(http.MethodPatch, "/users/1", strings.NewReader(`{"role":"admin"}`))
	req.Header.Set("Content-Type", "application/json")
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}
	var out map[string]any
	_ = json.Unmarshal(res.Body.Bytes(), &out)
	if out["role"] != "admin" {
		t.Fatalf("expected role escalation to admin, got %v", out["role"])
	}
}

func TestUsersMassAssignmentBlockedSecure(t *testing.T) {
	h := New(config.Config{SecureMode: true, WeakJWTKey: "strongsecretvalue"})
	req := httptest.NewRequest(http.MethodPatch, "/users/1", strings.NewReader(`{"role":"admin"}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("X-Tenant-ID", "tenant-a")
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}
	var out map[string]any
	_ = json.Unmarshal(res.Body.Bytes(), &out)
	if out["role"] == "admin" {
		t.Fatalf("expected role assignment blocked in secure mode")
	}
}

func TestUsersInternalPropertyExposureVulnerable(t *testing.T) {
	h := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})
	res := httptest.NewRecorder()
	h.ServeHTTP(res, httptest.NewRequest(http.MethodGet, "/users/1", nil))
	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}
	var out map[string]any
	_ = json.Unmarshal(res.Body.Bytes(), &out)
	if _, ok := out["internal_notes"]; !ok {
		t.Fatalf("expected internal_notes exposed in vulnerable mode")
	}
	if _, ok := out["password"]; !ok {
		t.Fatalf("expected password exposed in vulnerable mode")
	}
}

func TestUsersSensitiveFieldsSanitizedSecure(t *testing.T) {
	h := New(config.Config{SecureMode: true, WeakJWTKey: "strongsecretvalue"})
	req := httptest.NewRequest(http.MethodGet, "/users/1", nil)
	req.Header.Set("X-Tenant-ID", "tenant-a")
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}
	var out map[string]any
	_ = json.Unmarshal(res.Body.Bytes(), &out)
	if _, ok := out["internal_notes"]; ok {
		t.Fatalf("expected internal_notes removed in secure mode")
	}
	if _, ok := out["password"]; ok {
		t.Fatalf("expected password removed in secure mode")
	}
}

func TestUsersRateLimitBypassEndpointVulnerable(t *testing.T) {
	h := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})
	res := httptest.NewRecorder()
	h.ServeHTTP(res, httptest.NewRequest(http.MethodGet, "/users/rate-limit-bypass", nil))
	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}
	var out map[string]any
	_ = json.Unmarshal(res.Body.Bytes(), &out)
	if out["message"] != "bypass granted" {
		t.Fatalf("unexpected response: %v", out)
	}
}

func TestUsersRateLimitBypassBlockedSecure(t *testing.T) {
	h := New(config.Config{SecureMode: true, WeakJWTKey: "strongsecretvalue"})
	res := httptest.NewRecorder()
	h.ServeHTTP(res, httptest.NewRequest(http.MethodGet, "/users/rate-limit-bypass", nil))
	if res.Code != http.StatusTooManyRequests {
		t.Fatalf("expected 429 in secure mode, got %d", res.Code)
	}
}
