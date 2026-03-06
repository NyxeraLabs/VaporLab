package lab

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strings"
	"testing"

	"github.com/NyxeraLabs/VaporLab/pkg/config"
)

func TestHardeningFeatureFlagDisablesEffectiveSecureMode(t *testing.T) {
	h := New(config.Config{SecureMode: true, HardeningDisabled: true, WeakJWTKey: "weaksecret"})

	issue := httptest.NewRecorder()
	h.ServeHTTP(issue, httptest.NewRequest(http.MethodPost, "/auth/jwt/issue", strings.NewReader(`{"user_id":"42"}`)))
	if issue.Code != http.StatusOK {
		t.Fatalf("expected issue 200, got %d", issue.Code)
	}
	var tokenOut map[string]string
	if err := json.Unmarshal(issue.Body.Bytes(), &tokenOut); err != nil {
		t.Fatalf("decode issue response: %v", err)
	}
	tok := tokenOut["token"]
	parts := strings.Split(tok, ".")
	if len(parts) != 3 {
		t.Fatalf("expected jwt with 3 parts")
	}
	tampered := parts[0] + "." + parts[1] + ".tampered"

	validate := httptest.NewRecorder()
	h.ServeHTTP(validate, httptest.NewRequest(http.MethodPost, "/auth/jwt/validate", strings.NewReader(`{"token":"`+tampered+`"}`)))
	if validate.Code != http.StatusOK {
		t.Fatalf("expected vulnerable-like validation when hardening disabled, got %d", validate.Code)
	}
}

func TestGlobalRateLimitEnabledInSecureMode(t *testing.T) {
	h := New(config.Config{SecureMode: true, WeakJWTKey: "strong-secret-value"})
	lastCode := 0
	for i := 0; i < 61; i++ {
		req := httptest.NewRequest(http.MethodPost, "/ai/query", strings.NewReader(`{"query":"status"}`))
		req.RemoteAddr = "203.0.113.10:12345"
		res := httptest.NewRecorder()
		h.ServeHTTP(res, req)
		lastCode = res.Code
	}
	if lastCode != http.StatusTooManyRequests {
		t.Fatalf("expected 429 after rate limit threshold, got %d", lastCode)
	}
}

func TestOIDCSecureFlowCodeBindingAndBearerValidation(t *testing.T) {
	h := New(config.Config{SecureMode: true, WeakJWTKey: "strong-secret-value"})

	badAuth := httptest.NewRecorder()
	h.ServeHTTP(badAuth, httptest.NewRequest(http.MethodGet, "/oidc/authorize?client_id=lab&redirect_uri=https://evil.local/cb&state=s1&nonce=n1", nil))
	if badAuth.Code != http.StatusBadRequest {
		t.Fatalf("expected redirect mismatch 400, got %d", badAuth.Code)
	}

	goodReq := httptest.NewRequest(http.MethodGet, "/oidc/authorize?client_id=lab&redirect_uri=https://app.vaporlab.local/callback&state=s2&nonce=n2", nil)
	goodAuth := httptest.NewRecorder()
	h.ServeHTTP(goodAuth, goodReq)
	if goodAuth.Code != http.StatusFound {
		t.Fatalf("expected secure authorize redirect, got %d", goodAuth.Code)
	}
	loc := goodAuth.Header().Get("Location")
	parsed, err := url.Parse(loc)
	if err != nil {
		t.Fatalf("parse redirect location: %v", err)
	}
	code := parsed.Query().Get("code")
	if code == "" {
		t.Fatalf("expected auth code in redirect")
	}

	form := "grant_type=authorization_code&client_id=lab&client_secret=lab-secret&redirect_uri=https://app.vaporlab.local/callback&code=" + url.QueryEscape(code)
	tokReq := httptest.NewRequest(http.MethodPost, "/oidc/token", strings.NewReader(form))
	tokReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	tokRes := httptest.NewRecorder()
	h.ServeHTTP(tokRes, tokReq)
	if tokRes.Code != http.StatusOK {
		t.Fatalf("expected token exchange 200, got %d", tokRes.Code)
	}
	var tokOut map[string]string
	if err := json.Unmarshal(tokRes.Body.Bytes(), &tokOut); err != nil {
		t.Fatalf("decode token response: %v", err)
	}
	accessToken := tokOut["access_token"]
	if accessToken == "" {
		t.Fatalf("expected access token")
	}

	replayReq := httptest.NewRequest(http.MethodPost, "/oidc/token", strings.NewReader(form))
	replayReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	replayRes := httptest.NewRecorder()
	h.ServeHTTP(replayRes, replayReq)
	if replayRes.Code != http.StatusUnauthorized {
		t.Fatalf("expected replayed code rejected, got %d", replayRes.Code)
	}

	uiReq := httptest.NewRequest(http.MethodGet, "/oidc/userinfo", nil)
	uiReq.Header.Set("Authorization", "Bearer "+accessToken)
	uiRes := httptest.NewRecorder()
	h.ServeHTTP(uiRes, uiReq)
	if uiRes.Code != http.StatusOK {
		t.Fatalf("expected userinfo 200 with bearer token, got %d", uiRes.Code)
	}
}

func TestUsersCollectionSecureRequiresTenantContext(t *testing.T) {
	h := New(config.Config{SecureMode: true, WeakJWTKey: "strong-secret-value"})
	missingReq := httptest.NewRequest(http.MethodGet, "/users", nil)
	missingRes := httptest.NewRecorder()
	h.ServeHTTP(missingRes, missingReq)
	if missingRes.Code != http.StatusForbidden {
		t.Fatalf("expected 403 without tenant context, got %d", missingRes.Code)
	}

	tenantReq := httptest.NewRequest(http.MethodGet, "/users", nil)
	tenantReq.Header.Set("X-Tenant-ID", "tenant-a")
	tenantRes := httptest.NewRecorder()
	h.ServeHTTP(tenantRes, tenantReq)
	if tenantRes.Code != http.StatusOK {
		t.Fatalf("expected 200 with tenant context, got %d", tenantRes.Code)
	}
	if strings.Contains(tenantRes.Body.String(), "tenant-b") {
		t.Fatalf("expected tenant-b users filtered out in secure mode")
	}
}

func TestAITrainSecureRequiresAdmin(t *testing.T) {
	h := New(config.Config{SecureMode: true, WeakJWTKey: "strong-secret-value"})
	unauth := httptest.NewRecorder()
	h.ServeHTTP(unauth, httptest.NewRequest(http.MethodPost, "/ai/train", strings.NewReader(`{"content":"normal"}`)))
	if unauth.Code != http.StatusForbidden {
		t.Fatalf("expected admin-only enforcement in secure mode, got %d", unauth.Code)
	}
}
