package lab

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/NyxeraLabs/VaporLab/pkg/config"
)

func TestRefreshReplayAllowedInVulnerableMode(t *testing.T) {
	h := New(config.Config{WeakJWTKey: "weaksecret", SecureMode: false})
	body := `{"refresh_token":"rt-1"}`

	r1 := httptest.NewRecorder()
	h.ServeHTTP(r1, httptest.NewRequest(http.MethodPost, "/auth/refresh", strings.NewReader(body)))
	if r1.Code != http.StatusOK {
		t.Fatalf("expected first refresh 200, got %d", r1.Code)
	}

	r2 := httptest.NewRecorder()
	h.ServeHTTP(r2, httptest.NewRequest(http.MethodPost, "/auth/refresh", strings.NewReader(body)))
	if r2.Code != http.StatusOK {
		t.Fatalf("expected replay refresh 200 in vulnerable mode, got %d", r2.Code)
	}
}

func TestRefreshReplayBlockedInSecureMode(t *testing.T) {
	h := New(config.Config{WeakJWTKey: "strong-secret-value", SecureMode: true})
	body := `{"refresh_token":"rt-2"}`

	r1 := httptest.NewRecorder()
	h.ServeHTTP(r1, httptest.NewRequest(http.MethodPost, "/auth/refresh", strings.NewReader(body)))
	if r1.Code != http.StatusOK {
		t.Fatalf("expected first refresh 200, got %d", r1.Code)
	}

	r2 := httptest.NewRecorder()
	h.ServeHTTP(r2, httptest.NewRequest(http.MethodPost, "/auth/refresh", strings.NewReader(body)))
	if r2.Code != http.StatusUnauthorized {
		t.Fatalf("expected replay refresh 401 in secure mode, got %d", r2.Code)
	}
}

func TestOIDCAuthorizeVulnerableAllowsHTTPRedirect(t *testing.T) {
	h := New(config.Config{WeakJWTKey: "weaksecret", SecureMode: false})
	req := httptest.NewRequest(http.MethodGet, "/oidc/authorize?client_id=lab&redirect_uri=http://evil.local/cb&state=abc", nil)
	rr := httptest.NewRecorder()
	h.ServeHTTP(rr, req)

	if rr.Code != http.StatusFound {
		t.Fatalf("expected 302, got %d", rr.Code)
	}
	loc := rr.Header().Get("Location")
	if !strings.Contains(loc, "http://evil.local/cb") || !strings.Contains(loc, "code=demo-auth-code") {
		t.Fatalf("unexpected redirect location: %s", loc)
	}
}

func TestOIDCAuthorizeSecureRequiresHTTPS(t *testing.T) {
	h := New(config.Config{WeakJWTKey: "strong-secret-value", SecureMode: true})
	req := httptest.NewRequest(http.MethodGet, "/oidc/authorize?client_id=lab&redirect_uri=http://evil.local/cb", nil)
	rr := httptest.NewRecorder()
	h.ServeHTTP(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
}

func TestValidateJWTExpiredAcceptedInVulnerableMode(t *testing.T) {
	old := time.Now().Add(-30 * time.Minute)
	token, err := issueJWTToken("42", "user", "weaksecret", old, "HS256", false)
	if err != nil {
		t.Fatalf("issue token error: %v", err)
	}

	h := New(config.Config{WeakJWTKey: "weaksecret", SecureMode: false})
	req := httptest.NewRequest(http.MethodPost, "/auth/jwt/validate", strings.NewReader(`{"token":"`+token+`"}`))
	rr := httptest.NewRecorder()
	h.ServeHTTP(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}
}

func TestValidateJWTExpiredRejectedInSecureMode(t *testing.T) {
	old := time.Now().Add(-30 * time.Minute)
	token, err := issueJWTToken("42", "user", "strong-secret-value", old, "HS256", true)
	if err != nil {
		t.Fatalf("issue token error: %v", err)
	}

	h := New(config.Config{WeakJWTKey: "strong-secret-value", SecureMode: true})
	req := httptest.NewRequest(http.MethodPost, "/auth/jwt/validate", strings.NewReader(`{"token":"`+token+`"}`))
	rr := httptest.NewRecorder()
	h.ServeHTTP(rr, req)
	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rr.Code)
	}
}

func TestAuthConfigReportsWeakSecret(t *testing.T) {
	h := New(config.Config{WeakJWTKey: "weaksecret", SecureMode: false})
	rr := httptest.NewRecorder()
	h.ServeHTTP(rr, httptest.NewRequest(http.MethodGet, "/auth/config", nil))
	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}
	var out map[string]any
	if err := json.Unmarshal(rr.Body.Bytes(), &out); err != nil {
		t.Fatalf("decode error: %v", err)
	}
	if out["weak_secret"] != true {
		t.Fatalf("expected weak_secret true, got %v", out["weak_secret"])
	}
}

func TestAuthModeToggle(t *testing.T) {
	h := New(config.Config{WeakJWTKey: "weaksecret", SecureMode: false})

	post := httptest.NewRecorder()
	h.ServeHTTP(post, httptest.NewRequest(http.MethodPost, "/auth/mode", strings.NewReader(`{"secure_mode":true}`)))
	if post.Code != http.StatusOK {
		t.Fatalf("expected 200 on mode toggle, got %d", post.Code)
	}

	get := httptest.NewRecorder()
	h.ServeHTTP(get, httptest.NewRequest(http.MethodGet, "/auth/mode", nil))
	if get.Code != http.StatusOK {
		t.Fatalf("expected 200 on mode read, got %d", get.Code)
	}
	var out map[string]any
	if err := json.Unmarshal(get.Body.Bytes(), &out); err != nil {
		t.Fatalf("decode error: %v", err)
	}
	if out["secure_mode"] != true {
		t.Fatalf("expected secure_mode true, got %v", out["secure_mode"])
	}
}
