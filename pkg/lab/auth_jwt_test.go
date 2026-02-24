package lab

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/NyxeraLabs/VaporLab/pkg/config"
)

func TestIssueJWTEndpoint(t *testing.T) {
	h := New(config.Config{WeakJWTKey: "test-secret", SecureMode: false})
	req := httptest.NewRequest(http.MethodPost, "/auth/jwt/issue", strings.NewReader(`{"user_id":"42"}`))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()

	h.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rr.Code)
	}

	var resp map[string]string
	if err := json.Unmarshal(rr.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	token := resp["token"]
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		t.Fatalf("expected JWT to have 3 parts, got %d", len(parts))
	}

	headerJSON, err := base64.RawURLEncoding.DecodeString(parts[0])
	if err != nil {
		t.Fatalf("invalid header encoding: %v", err)
	}
	payloadJSON, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		t.Fatalf("invalid payload encoding: %v", err)
	}

	var header map[string]any
	if err := json.Unmarshal(headerJSON, &header); err != nil {
		t.Fatalf("invalid header JSON: %v", err)
	}
	if header["alg"] != "HS256" {
		t.Fatalf("expected alg HS256, got %v", header["alg"])
	}

	var payload map[string]any
	if err := json.Unmarshal(payloadJSON, &payload); err != nil {
		t.Fatalf("invalid payload JSON: %v", err)
	}
	if payload["sub"] != "42" {
		t.Fatalf("expected sub 42, got %v", payload["sub"])
	}
	if payload["role"] != "user" {
		t.Fatalf("expected role user, got %v", payload["role"])
	}
}

func TestIssueJWTTokenExpirationWindow(t *testing.T) {
	now := time.Unix(1700000000, 0).UTC()
	token, err := issueJWTToken("7", "user", "secret", now)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	parts := strings.Split(token, ".")
	payloadJSON, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		t.Fatalf("invalid payload encoding: %v", err)
	}
	var payload map[string]any
	if err := json.Unmarshal(payloadJSON, &payload); err != nil {
		t.Fatalf("invalid payload JSON: %v", err)
	}
	if int64(payload["iat"].(float64)) != now.Unix() {
		t.Fatalf("unexpected iat: %v", payload["iat"])
	}
	if int64(payload["exp"].(float64)) != now.Add(10*time.Minute).Unix() {
		t.Fatalf("unexpected exp: %v", payload["exp"])
	}
}
