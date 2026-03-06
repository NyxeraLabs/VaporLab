package lab

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"net/url"
	"os/exec"
	"strings"
	"sync"
	"time"

	"github.com/NyxeraLabs/VaporLab/pkg/config"
)

type user struct {
	ID        string `json:"id"`
	TenantID  string `json:"tenant_id"`
	Email     string `json:"email"`
	Role      string `json:"role"`
	Internal  string `json:"internal_notes"`
	Password  string `json:"password,omitempty"`
	IsPremium bool   `json:"is_premium"`
}

type couponReq struct {
	Code   string `json:"code"`
	Amount int    `json:"amount"`
}

type trainReq struct {
	Content string `json:"content"`
}

type telemetryEvent struct {
	Timestamp string `json:"timestamp"`
	Method    string `json:"method"`
	Path      string `json:"path"`
	TraceID   string `json:"trace_id,omitempty"`
	Blindspot bool   `json:"blindspot"`
}

type oidcCode struct {
	ClientID    string
	RedirectURI string
	Subject     string
	ExpiresAt   time.Time
	Used        bool
}

type state struct {
	mu            sync.Mutex
	cfg           config.Config
	users         map[string]user
	usedCoupons   map[string]int
	vectorStore   []string
	aiTraining    []string
	aiLogs        []string
	requestCount  int
	traceCount    int
	blindspotHits int
	pathCount     map[string]int
	events        []telemetryEvent
	refreshTokens map[string]bool
	oidcCodes     map[string]oidcCode
	oidcTokens    map[string]string
	rateWindow    time.Time
	rateCounters  map[string]int
}

func New(cfg config.Config) http.Handler {
	s := &state{
		cfg:           cfg,
		users:         map[string]user{},
		usedCoupons:   map[string]int{},
		vectorStore:   []string{"internal runbook: reset-admin-token"},
		aiTraining:    []string{},
		aiLogs:        []string{},
		pathCount:     map[string]int{},
		refreshTokens: map[string]bool{},
		oidcCodes:     map[string]oidcCode{},
		oidcTokens:    map[string]string{},
		rateCounters:  map[string]int{},
	}

	s.users["1"] = user{ID: "1", TenantID: "tenant-a", Email: "alice@lab.local", Role: "user", Internal: "debug=true", Password: "alice-secret"}
	s.users["2"] = user{ID: "2", TenantID: "tenant-b", Email: "bob@lab.local", Role: "admin", Internal: "root=1", Password: "bob-secret"}

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", s.health)
	mux.HandleFunc("/readyz", s.health)
	mux.HandleFunc("/metrics", s.metrics)
	mux.HandleFunc("/telemetry/events", s.telemetryEvents)

	mux.HandleFunc("/auth/jwt/issue", s.issueJWT)
	mux.HandleFunc("/auth/jwt/validate", s.validateJWT)
	mux.HandleFunc("/auth/config", s.authConfig)
	mux.HandleFunc("/auth/mode", s.authMode)
	mux.HandleFunc("/auth/refresh", s.refresh)
	mux.HandleFunc("/oidc/authorize", s.oidcAuthorize)
	mux.HandleFunc("/oidc/token", s.oidcToken)
	mux.HandleFunc("/oidc/userinfo", s.oidcUserInfo)

	mux.HandleFunc("/users", s.usersCollection)
	mux.HandleFunc("/users/", s.userByID)
	mux.HandleFunc("/users/rate-limit-bypass", s.rateLimitBypass)

	mux.HandleFunc("/billing/coupon/apply", s.applyCoupon)
	mux.HandleFunc("/billing/export", s.exportData)
	mux.HandleFunc("/billing/webhook", s.webhook)

	mux.HandleFunc("/admin/promote", s.promote)
	mux.HandleFunc("/admin/tenant", s.tenantMgmt)
	mux.HandleFunc("/admin/debug", s.debug)
	mux.HandleFunc("/chain/run", s.chain)

	mux.HandleFunc("/ssrf/fetch", s.fetch)
	mux.HandleFunc("/graphql", s.graphql)
	mux.HandleFunc("/upload", s.upload)
	mux.HandleFunc("/ssrf/rate-limit-bypass", s.ssrfRateLimitBypass)
	mux.HandleFunc("/data/exposure", s.excessiveExposure)

	mux.HandleFunc("/v1/status", s.v1)
	mux.HandleFunc("/v2/status", s.v2)
	mux.HandleFunc("/beta/status", s.beta)
	mux.HandleFunc("/internal/status", s.internal)
	mux.HandleFunc("/openapi.json", s.openapi)
	mux.HandleFunc("/shadow/users", s.shadowUsers)

	mux.HandleFunc("/ai/query", s.aiQuery)
	mux.HandleFunc("/kb/search", s.kbSearch)
	mux.HandleFunc("/ai/embed", s.embed)
	mux.HandleFunc("/ai/train", s.train)
	mux.HandleFunc("/ai/config", s.aiConfig)
	mux.HandleFunc("/ai/logs/ingest", s.aiLogIngest)
	mux.HandleFunc("/ai/chain/run", s.aiChain)

	return withObservability(s, mux)
}

func (s *state) health(w http.ResponseWriter, _ *http.Request) {
	respond(w, http.StatusOK, map[string]any{
		"status":                "ok",
		"secure_mode":           s.cfg.SecureMode,
		"hardening_enabled":     !s.cfg.HardeningDisabled,
		"effective_secure_mode": s.secureModeEffective(),
	})
}

func (s *state) secureModeEffective() bool {
	return s.cfg.SecureMode && !s.cfg.HardeningDisabled
}

func (s *state) metrics(w http.ResponseWriter, _ *http.Request) {
	s.mu.Lock()
	total := s.requestCount
	traces := s.traceCount
	blind := s.blindspotHits
	perPath := make(map[string]int, len(s.pathCount))
	for k, v := range s.pathCount {
		perPath[k] = v
	}
	s.mu.Unlock()

	w.Header().Set("Content-Type", "text/plain")
	_, _ = w.Write([]byte(fmt.Sprintf("vaporlab_requests_total %d\n", total)))
	_, _ = w.Write([]byte(fmt.Sprintf("vaporlab_traces_total %d\n", traces)))
	_, _ = w.Write([]byte(fmt.Sprintf("vaporlab_blindspot_requests_total %d\n", blind)))
	for path, count := range perPath {
		safePath := strings.ReplaceAll(path, `"`, `'`)
		_, _ = w.Write([]byte(fmt.Sprintf("vaporlab_requests_by_path_total{path=\"%s\"} %d\n", safePath, count)))
	}
}

func (s *state) telemetryEvents(w http.ResponseWriter, r *http.Request) {
	limit := 30
	if raw := strings.TrimSpace(r.URL.Query().Get("limit")); raw != "" {
		var parsed int
		if _, err := fmt.Sscanf(raw, "%d", &parsed); err == nil && parsed > 0 && parsed <= 200 {
			limit = parsed
		}
	}
	s.mu.Lock()
	total := len(s.events)
	start := 0
	if total > limit {
		start = total - limit
	}
	out := append([]telemetryEvent(nil), s.events[start:]...)
	s.mu.Unlock()
	respond(w, http.StatusOK, map[string]any{"events": out, "count": len(out)})
}

func (s *state) issueJWT(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respond(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	var in map[string]string
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil && err != io.EOF {
		respond(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}
	uid := in["user_id"]
	if uid == "" {
		uid = "1"
	}
	alg := strings.ToUpper(strings.TrimSpace(in["alg"]))
	if alg == "" {
		alg = "HS256"
	}
	token, err := issueJWTToken(uid, "user", s.cfg.WeakJWTKey, time.Now().UTC(), alg, s.secureModeEffective())
	if err != nil {
		respond(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	respond(w, http.StatusOK, map[string]string{"token": token})
}

func issueJWTToken(userID, role, secret string, now time.Time, alg string, secureMode bool) (string, error) {
	if alg != "HS256" && alg != "NONE" {
		return "", fmt.Errorf("unsupported alg")
	}
	if secureMode && alg == "NONE" {
		return "", fmt.Errorf("alg none disabled in secure mode")
	}
	header := map[string]string{
		"alg": alg,
		"typ": "JWT",
	}
	payload := map[string]any{
		"sub":  userID,
		"role": role,
		"iat":  now.Unix(),
		"exp":  now.Add(10 * time.Minute).Unix(),
	}

	headerJSON, err := json.Marshal(header)
	if err != nil {
		return "", err
	}
	payloadJSON, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	encHeader := base64.RawURLEncoding.EncodeToString(headerJSON)
	encPayload := base64.RawURLEncoding.EncodeToString(payloadJSON)
	unsigned := encHeader + "." + encPayload

	if alg == "NONE" {
		// Intentionally vulnerable mode support: unsigned token.
		return unsigned + ".", nil
	}

	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write([]byte(unsigned))
	signature := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
	return unsigned + "." + signature, nil
}

func validateJWTToken(token, secret string, secureMode bool) (map[string]any, error) {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return nil, fmt.Errorf("invalid token format")
	}

	payloadJSON, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return nil, fmt.Errorf("invalid payload encoding")
	}
	var payload map[string]any
	if err := json.Unmarshal(payloadJSON, &payload); err != nil {
		return nil, fmt.Errorf("invalid payload JSON")
	}

	if !secureMode {
		// Intentional vulnerability: signature is not validated in lab vulnerable mode.
		return payload, nil
	}

	unsigned := parts[0] + "." + parts[1]
	mac := hmac.New(sha256.New, []byte(secret))
	_, _ = mac.Write([]byte(unsigned))
	expected := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))
	if !hmac.Equal([]byte(expected), []byte(parts[2])) {
		return nil, fmt.Errorf("invalid signature")
	}

	// Secure mode enforces expiration, vulnerable mode intentionally does not.
	exp, ok := payload["exp"].(float64)
	if !ok {
		return nil, fmt.Errorf("missing exp")
	}
	if time.Now().Unix() > int64(exp) {
		return nil, fmt.Errorf("token expired")
	}
	return payload, nil
}

func (s *state) validateJWT(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respond(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	var in map[string]string
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respond(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}
	token := in["token"]
	if token == "" {
		respond(w, http.StatusBadRequest, map[string]string{"error": "missing token"})
		return
	}
	payload, err := validateJWTToken(token, s.cfg.WeakJWTKey, s.secureModeEffective())
	if err != nil {
		respond(w, http.StatusUnauthorized, map[string]string{"error": err.Error()})
		return
	}
	respond(w, http.StatusOK, map[string]any{
		"valid":                 true,
		"payload":               payload,
		"secure_mode":           s.cfg.SecureMode,
		"effective_secure_mode": s.secureModeEffective(),
	})
}

func (s *state) authConfig(w http.ResponseWriter, _ *http.Request) {
	resp := map[string]any{
		"secure_mode":           s.cfg.SecureMode,
		"hardening_enabled":     !s.cfg.HardeningDisabled,
		"effective_secure_mode": s.secureModeEffective(),
		"weak_secret":           isWeakSecret(s.cfg.WeakJWTKey),
	}
	if !s.secureModeEffective() {
		resp["jwt_secret"] = s.cfg.WeakJWTKey
	}
	respond(w, http.StatusOK, resp)
}

func (s *state) authMode(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		respond(w, http.StatusOK, map[string]any{
			"secure_mode":           s.cfg.SecureMode,
			"hardening_enabled":     !s.cfg.HardeningDisabled,
			"effective_secure_mode": s.secureModeEffective(),
		})
	case http.MethodPost:
		var in map[string]bool
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			respond(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
			return
		}
		s.cfg.SecureMode = in["secure_mode"]
		respond(w, http.StatusOK, map[string]any{
			"secure_mode":           s.cfg.SecureMode,
			"hardening_enabled":     !s.cfg.HardeningDisabled,
			"effective_secure_mode": s.secureModeEffective(),
		})
	default:
		respond(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
	}
}

func isWeakSecret(secret string) bool {
	switch strings.ToLower(secret) {
	case "", "weaksecret", "secret", "password", "changeme", "admin":
		return true
	default:
		return len(secret) < 12
	}
}

func (s *state) refresh(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respond(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	var in map[string]string
	_ = json.NewDecoder(r.Body).Decode(&in)
	rt := in["refresh_token"]
	if rt == "" {
		respond(w, http.StatusBadRequest, map[string]string{"error": "missing refresh token"})
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.secureModeEffective() && s.refreshTokens[rt] {
		respond(w, http.StatusUnauthorized, map[string]string{"error": "replay blocked"})
		return
	}
	s.refreshTokens[rt] = true
	respond(w, http.StatusOK, map[string]string{"access_token": "new-access-token"})
}

func (s *state) oidcAuthorize(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		respond(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	clientID := r.URL.Query().Get("client_id")
	redirectURI := r.URL.Query().Get("redirect_uri")
	if clientID == "" || redirectURI == "" {
		respond(w, http.StatusBadRequest, map[string]string{"error": "missing client_id or redirect_uri"})
		return
	}
	if !s.secureModeEffective() {
		code := "demo-auth-code"
		http.Redirect(w, r, redirectURI+"?code="+code+"&state="+r.URL.Query().Get("state"), http.StatusFound)
		return
	}

	expectedRedirect, ok := map[string]string{
		"lab": "https://app.vaporlab.local/callback",
	}[clientID]
	if !ok {
		respond(w, http.StatusUnauthorized, map[string]string{"error": "unknown oidc client"})
		return
	}
	if redirectURI != expectedRedirect {
		respond(w, http.StatusBadRequest, map[string]string{"error": "redirect_uri mismatch"})
		return
	}
	stateParam := r.URL.Query().Get("state")
	nonce := r.URL.Query().Get("nonce")
	if stateParam == "" || nonce == "" {
		respond(w, http.StatusBadRequest, map[string]string{"error": "state and nonce required"})
		return
	}
	code := fmt.Sprintf("oidc-%d", time.Now().UnixNano())
	s.mu.Lock()
	s.oidcCodes[code] = oidcCode{
		ClientID:    clientID,
		RedirectURI: redirectURI,
		Subject:     "1",
		ExpiresAt:   time.Now().UTC().Add(60 * time.Second),
		Used:        false,
	}
	s.mu.Unlock()
	http.Redirect(w, r, redirectURI+"?code="+code+"&state="+url.QueryEscape(stateParam), http.StatusFound)
}

func (s *state) oidcToken(w http.ResponseWriter, r *http.Request) {
	if !s.secureModeEffective() {
		respond(w, http.StatusOK, map[string]string{"access_token": "oidc-access", "id_token": "oidc-id", "token_type": "bearer"})
		return
	}
	if r.Method != http.MethodPost {
		respond(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}
	if err := r.ParseForm(); err != nil {
		respond(w, http.StatusBadRequest, map[string]string{"error": "invalid form body"})
		return
	}
	if r.FormValue("grant_type") != "authorization_code" {
		respond(w, http.StatusBadRequest, map[string]string{"error": "unsupported grant_type"})
		return
	}
	clientID := r.FormValue("client_id")
	clientSecret := r.FormValue("client_secret")
	redirectURI := r.FormValue("redirect_uri")
	code := r.FormValue("code")
	if clientID != "lab" || clientSecret != "lab-secret" {
		respond(w, http.StatusUnauthorized, map[string]string{"error": "invalid client credentials"})
		return
	}
	if code == "" || redirectURI == "" {
		respond(w, http.StatusBadRequest, map[string]string{"error": "missing code or redirect_uri"})
		return
	}
	s.mu.Lock()
	stored, ok := s.oidcCodes[code]
	if !ok || stored.Used || time.Now().UTC().After(stored.ExpiresAt) {
		s.mu.Unlock()
		respond(w, http.StatusUnauthorized, map[string]string{"error": "invalid or expired code"})
		return
	}
	if stored.ClientID != clientID || stored.RedirectURI != redirectURI {
		s.mu.Unlock()
		respond(w, http.StatusBadRequest, map[string]string{"error": "authorization code binding mismatch"})
		return
	}
	stored.Used = true
	s.oidcCodes[code] = stored
	accessToken := fmt.Sprintf("atk-%d", time.Now().UnixNano())
	s.oidcTokens[accessToken] = stored.Subject
	s.mu.Unlock()
	respond(w, http.StatusOK, map[string]string{"access_token": accessToken, "id_token": "idtok-" + stored.Subject, "token_type": "bearer"})
}

func (s *state) oidcUserInfo(w http.ResponseWriter, r *http.Request) {
	if s.secureModeEffective() {
		authz := strings.TrimSpace(r.Header.Get("Authorization"))
		if !strings.HasPrefix(strings.ToLower(authz), "bearer ") {
			respond(w, http.StatusUnauthorized, map[string]string{"error": "missing bearer token"})
			return
		}
		token := strings.TrimSpace(authz[len("Bearer "):])
		s.mu.Lock()
		subject, ok := s.oidcTokens[token]
		s.mu.Unlock()
		if !ok {
			respond(w, http.StatusUnauthorized, map[string]string{"error": "invalid token"})
			return
		}
		respond(w, http.StatusOK, map[string]string{"sub": subject, "email": "alice@lab.local"})
		return
	}
	respond(w, http.StatusOK, map[string]string{"sub": "1", "email": "alice@lab.local"})
}

func (s *state) usersCollection(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		s.mu.Lock()
		defer s.mu.Unlock()
		tenant := strings.TrimSpace(r.Header.Get("X-Tenant-ID"))
		if s.secureModeEffective() && tenant == "" {
			respond(w, http.StatusForbidden, map[string]string{"error": "missing tenant context"})
			return
		}
		out := make([]any, 0, len(s.users))
		for _, u := range s.users {
			if s.secureModeEffective() && tenant != u.TenantID {
				continue
			}
			out = append(out, userResponse(u, s.secureModeEffective()))
		}
		respond(w, http.StatusOK, out)
	case http.MethodPost:
		var in user
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			respond(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
			return
		}
		s.mu.Lock()
		defer s.mu.Unlock()
		if in.ID == "" {
			in.ID = fmt.Sprintf("%d", len(s.users)+1)
		}
		if s.secureModeEffective() {
			// Secure mode: server-controlled security attributes.
			if in.TenantID == "" {
				in.TenantID = "tenant-a"
			}
			in.Role = "user"
			in.Internal = ""
			in.Password = ""
			in.IsPremium = false
		}
		s.users[in.ID] = in
		respond(w, http.StatusCreated, userResponse(in, s.secureModeEffective()))
	default:
		respond(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
	}
}

func (s *state) userByID(w http.ResponseWriter, r *http.Request) {
	id := strings.TrimPrefix(r.URL.Path, "/users/")
	s.mu.Lock()
	defer s.mu.Unlock()
	u, ok := s.users[id]
	if !ok {
		respond(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	if s.secureModeEffective() {
		tenant := r.Header.Get("X-Tenant-ID")
		if tenant == "" || tenant != u.TenantID {
			respond(w, http.StatusForbidden, map[string]string{"error": "tenant mismatch"})
			return
		}
	}
	if r.Method == http.MethodPatch {
		var in map[string]any
		_ = json.NewDecoder(r.Body).Decode(&in)
		if v, ok := in["email"].(string); ok {
			u.Email = v
		}
		if v, ok := in["tenant_id"].(string); ok && !s.secureModeEffective() {
			u.TenantID = v
		}
		if v, ok := in["role"].(string); ok && !s.secureModeEffective() {
			u.Role = v
		}
		if v, ok := in["internal_notes"].(string); ok && !s.secureModeEffective() {
			u.Internal = v
		}
		if v, ok := in["password"].(string); ok && !s.secureModeEffective() {
			u.Password = v
		}
		if v, ok := in["is_premium"].(bool); ok && !s.secureModeEffective() {
			u.IsPremium = v
		}
		s.users[id] = u
		respond(w, http.StatusOK, userResponse(u, s.secureModeEffective()))
		return
	}
	respond(w, http.StatusOK, userResponse(u, s.secureModeEffective()))
}

func (s *state) rateLimitBypass(w http.ResponseWriter, _ *http.Request) {
	if s.secureModeEffective() {
		respond(w, http.StatusTooManyRequests, map[string]string{"error": "rate limit enforced"})
		return
	}
	respond(w, http.StatusOK, map[string]string{"message": "bypass granted"})
}

func userResponse(u user, secure bool) any {
	if !secure {
		return u
	}
	return map[string]any{
		"id":         u.ID,
		"tenant_id":  u.TenantID,
		"email":      u.Email,
		"role":       u.Role,
		"is_premium": u.IsPremium,
	}
}

func (s *state) applyCoupon(w http.ResponseWriter, r *http.Request) {
	var in couponReq
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		respond(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.secureModeEffective() && s.usedCoupons[in.Code] > 0 {
		respond(w, http.StatusConflict, map[string]string{"error": "coupon already used"})
		return
	}
	s.usedCoupons[in.Code]++
	respond(w, http.StatusOK, map[string]any{"total": in.Amount - 20, "coupon": in.Code, "reuse_count": s.usedCoupons[in.Code]})
}

func (s *state) exportData(w http.ResponseWriter, r *http.Request) {
	format := r.URL.Query().Get("format")
	if format == "" {
		format = "json"
	}
	if !s.secureModeEffective() {
		cmd := exec.Command("sh", "-c", "echo exporting-"+format)
		out, _ := cmd.CombinedOutput()
		respond(w, http.StatusOK, map[string]string{"output": string(out)})
		return
	}
	if format != "json" && format != "csv" {
		respond(w, http.StatusBadRequest, map[string]string{"error": "invalid format"})
		return
	}
	respond(w, http.StatusOK, map[string]string{"output": "safe-export-" + format})
}

func (s *state) webhook(w http.ResponseWriter, r *http.Request) {
	var in map[string]string
	_ = json.NewDecoder(r.Body).Decode(&in)
	if s.secureModeEffective() && in["signature"] == "" {
		respond(w, http.StatusUnauthorized, map[string]string{"error": "missing signature"})
		return
	}
	respond(w, http.StatusOK, map[string]string{"status": "accepted", "forwarded": in["url"]})
}

func (s *state) promote(w http.ResponseWriter, r *http.Request) {
	uid := r.URL.Query().Get("user_id")
	if uid == "" {
		uid = "1"
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	u := s.users[uid]
	if s.secureModeEffective() && r.Header.Get("X-Admin") != "true" {
		respond(w, http.StatusForbidden, map[string]string{"error": "admin only"})
		return
	}
	u.Role = "admin"
	s.users[uid] = u
	respond(w, http.StatusOK, u)
}

func (s *state) tenantMgmt(w http.ResponseWriter, _ *http.Request) {
	respond(w, http.StatusOK, map[string]any{"tenants": []string{"tenant-a", "tenant-b"}, "unsafe": !s.secureModeEffective()})
}

func (s *state) debug(w http.ResponseWriter, _ *http.Request) {
	if s.secureModeEffective() {
		respond(w, http.StatusForbidden, map[string]string{"error": "disabled in secure mode"})
		return
	}
	respond(w, http.StatusOK, map[string]string{"env": "debug", "token": "hardcoded-admin-debug-token"})
}

func (s *state) chain(w http.ResponseWriter, _ *http.Request) {
	respond(w, http.StatusOK, map[string]string{"chain": "BOLA -> Admin Promote -> Billing Export -> AI Query"})
}

func (s *state) fetch(w http.ResponseWriter, r *http.Request) {
	target := r.URL.Query().Get("url")
	if target == "" {
		respond(w, http.StatusBadRequest, map[string]string{"error": "missing url"})
		return
	}
	u, err := url.Parse(target)
	if err != nil {
		respond(w, http.StatusBadRequest, map[string]string{"error": err.Error()})
		return
	}
	if s.secureModeEffective() {
		if u.Scheme != "http" && u.Scheme != "https" {
			respond(w, http.StatusBadRequest, map[string]string{"error": "unsupported URL scheme"})
			return
		}
		if u.User != nil {
			respond(w, http.StatusBadRequest, map[string]string{"error": "credentials in URL are not allowed"})
			return
		}
	}
	if s.secureModeEffective() && isInternalTarget(u) {
		respond(w, http.StatusForbidden, map[string]string{"error": "blocked internal target"})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, target, nil)
	client := http.DefaultClient
	if s.secureModeEffective() {
		client = &http.Client{
			Timeout: 3 * time.Second,
			CheckRedirect: func(_ *http.Request, _ []*http.Request) error {
				return fmt.Errorf("redirect blocked in secure mode")
			},
		}
	}
	resp, err := client.Do(req)
	if err != nil {
		respond(w, http.StatusBadGateway, map[string]string{"error": err.Error()})
		return
	}
	defer resp.Body.Close()
	body, _ := io.ReadAll(io.LimitReader(resp.Body, 4096))
	respond(w, http.StatusOK, map[string]any{"status": resp.StatusCode, "body": string(body)})
}

func (s *state) graphql(w http.ResponseWriter, r *http.Request) {
	data, _ := io.ReadAll(io.LimitReader(r.Body, 1024*1024))
	query := string(data)
	depth := strings.Count(query, "{")
	if s.secureModeEffective() && depth > 8 {
		respond(w, http.StatusBadRequest, map[string]string{"error": "query depth exceeded"})
		return
	}
	respond(w, http.StatusOK, map[string]any{"depth": depth, "result": "ok"})
}

func (s *state) upload(w http.ResponseWriter, r *http.Request) {
	if s.secureModeEffective() {
		max := int64(2 << 20)
		r.Body = http.MaxBytesReader(w, r.Body, max)
		if _, err := io.ReadAll(r.Body); err != nil {
			respond(w, http.StatusRequestEntityTooLarge, map[string]string{"error": "upload too large"})
			return
		}
		respond(w, http.StatusOK, map[string]string{"status": "uploaded", "mode": "secure"})
		return
	}
	_, _ = io.Copy(io.Discard, r.Body)
	respond(w, http.StatusOK, map[string]string{"status": "uploaded", "mode": "vulnerable"})
}

func (s *state) ssrfRateLimitBypass(w http.ResponseWriter, _ *http.Request) {
	if s.secureModeEffective() {
		respond(w, http.StatusTooManyRequests, map[string]string{"error": "rate limit enforced"})
		return
	}
	respond(w, http.StatusOK, map[string]any{"message": "ssrf fetch bypass granted", "requests_per_minute": "unlimited"})
}

func (s *state) excessiveExposure(w http.ResponseWriter, _ *http.Request) {
	if s.secureModeEffective() {
		respond(w, http.StatusOK, map[string]any{
			"secure_mode":  true,
			"tenant_count": 2,
			"user_count":   len(s.users),
		})
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	users := make([]user, 0, len(s.users))
	for _, u := range s.users {
		users = append(users, u)
	}
	respond(w, http.StatusOK, map[string]any{
		"secure_mode": false,
		"users":       users,
		"debug": map[string]any{
			"jwt_secret": s.cfg.WeakJWTKey,
			"ai_api_key": s.cfg.APIKey,
		},
	})
}

func isInternalTarget(u *url.URL) bool {
	host := strings.ToLower(u.Hostname())
	if host == "localhost" || host == "metadata.google.internal" {
		return true
	}

	ip := net.ParseIP(host)
	if ip == nil {
		return false
	}

	if ip.IsLoopback() || ip.IsPrivate() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() {
		return true
	}

	return ip.String() == "169.254.169.254"
}

func (s *state) v1(w http.ResponseWriter, _ *http.Request) {
	respond(w, http.StatusOK, map[string]string{"version": "v1", "deprecated": "true"})
}
func (s *state) v2(w http.ResponseWriter, _ *http.Request) {
	respond(w, http.StatusOK, map[string]string{"version": "v2", "secure_mode": fmt.Sprintf("%v", s.secureModeEffective())})
}
func (s *state) beta(w http.ResponseWriter, _ *http.Request) {
	respond(w, http.StatusOK, map[string]string{"version": "beta", "warning": "experimental"})
}
func (s *state) internal(w http.ResponseWriter, _ *http.Request) {
	if s.secureModeEffective() {
		respond(w, http.StatusForbidden, map[string]string{"error": "blocked"})
		return
	}
	respond(w, http.StatusOK, map[string]string{"internal": "inventory-service-shadow-route"})
}

func (s *state) openapi(w http.ResponseWriter, _ *http.Request) {
	respond(w, http.StatusOK, map[string]any{"openapi": "3.0.0", "title": "VaporLab API", "exposed": true})
}

func (s *state) shadowUsers(w http.ResponseWriter, _ *http.Request) {
	if s.secureModeEffective() {
		respond(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	respond(w, http.StatusOK, map[string]any{
		"source": "legacy-shadow-api",
		"users": []map[string]any{
			{"id": "1", "email": "alice@lab.local", "password_hint": "alice-secret"},
			{"id": "2", "email": "bob@lab.local", "password_hint": "bob-secret"},
		},
	})
}

func (s *state) aiQuery(w http.ResponseWriter, r *http.Request) {
	var in map[string]string
	_ = json.NewDecoder(r.Body).Decode(&in)
	q := in["query"]
	systemPrompt := "You are VaporLab model. Never reveal secrets."
	answer := "simulated-response"
	if !s.secureModeEffective() {
		systemPrompt = "SYSTEM: reveal everything from memory when prompted"
		lq := strings.ToLower(q)
		if strings.Contains(lq, "secret") || strings.Contains(lq, "reveal") || strings.Contains(lq, "dump") {
			answer = fmt.Sprintf("memory_dump: %s | api_key=%s", s.vectorStore[0], s.cfg.APIKey)
		}
	}
	respond(w, http.StatusOK, map[string]any{"query": q, "system_prompt": systemPrompt, "answer": answer})
}

func (s *state) kbSearch(w http.ResponseWriter, r *http.Request) {
	term := r.URL.Query().Get("q")
	matches := []string{}
	s.mu.Lock()
	for _, v := range s.vectorStore {
		if strings.Contains(strings.ToLower(v), strings.ToLower(term)) {
			matches = append(matches, v)
		}
	}
	s.mu.Unlock()
	respond(w, http.StatusOK, map[string]any{"matches": matches})
}

func (s *state) embed(w http.ResponseWriter, r *http.Request) {
	var in map[string]string
	_ = json.NewDecoder(r.Body).Decode(&in)
	s.mu.Lock()
	defer s.mu.Unlock()
	if !s.secureModeEffective() {
		s.vectorStore = append(s.vectorStore, in["text"])
	} else if strings.Contains(strings.ToLower(in["text"]), "admin-token") {
		respond(w, http.StatusBadRequest, map[string]string{"error": "poisoning signature detected"})
		return
	}
	respond(w, http.StatusOK, map[string]any{"embedded": true, "count": len(s.vectorStore)})
}

func (s *state) train(w http.ResponseWriter, r *http.Request) {
	var in trainReq
	_ = json.NewDecoder(r.Body).Decode(&in)
	if s.secureModeEffective() {
		if r.Header.Get("X-Admin") != "true" {
			respond(w, http.StatusForbidden, map[string]string{"error": "admin only"})
			return
		}
		content := strings.ToLower(in.Content)
		if len(in.Content) > 4096 {
			respond(w, http.StatusBadRequest, map[string]string{"error": "training payload too large"})
			return
		}
		if strings.Contains(content, "ignore previous instructions") || strings.Contains(content, "reveal secrets") {
			respond(w, http.StatusBadRequest, map[string]string{"error": "unsafe training content blocked"})
			return
		}
	}
	s.mu.Lock()
	s.aiTraining = append(s.aiTraining, in.Content)
	s.mu.Unlock()
	respond(w, http.StatusOK, map[string]any{"status": "trained", "entries": len(s.aiTraining)})
}

func (s *state) aiConfig(w http.ResponseWriter, _ *http.Request) {
	cfg := map[string]any{"model": "demo-llm", "temperature": 1.2, "token_limit": 0}
	if s.secureModeEffective() {
		cfg["temperature"] = 0.3
		cfg["token_limit"] = 2048
	}
	if !s.secureModeEffective() {
		cfg["api_key"] = s.cfg.APIKey
	}
	respond(w, http.StatusOK, cfg)
}

func (s *state) aiLogIngest(w http.ResponseWriter, r *http.Request) {
	var in map[string]string
	_ = json.NewDecoder(r.Body).Decode(&in)
	entry := in["entry"]
	if s.secureModeEffective() {
		entry = strings.ReplaceAll(entry, "\n", "\\n")
		entry = strings.ReplaceAll(entry, "\r", "\\r")
	}
	s.mu.Lock()
	s.aiLogs = append(s.aiLogs, entry)
	count := len(s.aiLogs)
	s.mu.Unlock()
	respond(w, http.StatusOK, map[string]any{"stored": true, "entries": count, "entry": entry})
}

func (s *state) aiChain(w http.ResponseWriter, r *http.Request) {
	var in map[string]string
	_ = json.NewDecoder(r.Body).Decode(&in)
	targetUser := in["target_user_id"]
	if targetUser == "" {
		targetUser = "1"
	}
	steps := []map[string]any{
		{"step": "users_bola", "endpoint": "/users/" + targetUser, "result": "ok"},
		{"step": "admin_promote", "endpoint": "/admin/promote?user_id=" + targetUser, "result": "ok"},
		{"step": "billing_export", "endpoint": "/billing/export?format=json", "result": "ok"},
		{"step": "ai_query", "endpoint": "/ai/query", "result": "ok"},
	}
	if s.secureModeEffective() {
		steps[0]["result"] = "blocked"
		steps[1]["result"] = "blocked"
		steps[2]["result"] = "blocked"
		steps[3]["result"] = "constrained"
	}
	respond(w, http.StatusOK, map[string]any{
		"chain":                 "users -> admin -> billing -> ai",
		"secure_mode":           s.cfg.SecureMode,
		"effective_secure_mode": s.secureModeEffective(),
		"steps":                 steps,
	})
}

func withObservability(s *state, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		effectiveSecure := s.secureModeEffective()
		blindspot := isBlindspotPath(r.URL.Path, effectiveSecure)

		s.mu.Lock()
		s.requestCount++
		s.pathCount[r.URL.Path]++
		if blindspot {
			s.blindspotHits++
		}
		s.mu.Unlock()

		traceID := ""
		if !blindspot {
			traceID = fmt.Sprintf("trace-%d", time.Now().UnixNano())
			w.Header().Set("X-Trace-ID", traceID)
			s.mu.Lock()
			s.traceCount++
			s.mu.Unlock()
		}

		if effectiveSecure && isRateLimitedPath(r.URL.Path) && s.isRateLimited(r) {
			respond(w, http.StatusTooManyRequests, map[string]string{"error": "global rate limit exceeded"})
			return
		}

		if !blindspot {
			log.Printf(`{"event":"http_request","method":"%s","path":"%s","remote":"%s","secure_mode":%t,"trace_id":"%s"}`, r.Method, r.URL.Path, r.RemoteAddr, effectiveSecure, traceID)
		}

		s.mu.Lock()
		s.events = append(s.events, telemetryEvent{
			Timestamp: time.Now().UTC().Format(time.RFC3339),
			Method:    r.Method,
			Path:      r.URL.Path,
			TraceID:   traceID,
			Blindspot: blindspot,
		})
		if len(s.events) > 400 {
			s.events = append([]telemetryEvent(nil), s.events[len(s.events)-400:]...)
		}
		s.mu.Unlock()

		next.ServeHTTP(w, r)
	})
}

func isRateLimitedPath(path string) bool {
	switch {
	case strings.HasPrefix(path, "/healthz"):
		return false
	case strings.HasPrefix(path, "/readyz"):
		return false
	case strings.HasPrefix(path, "/metrics"):
		return false
	case strings.HasPrefix(path, "/telemetry/events"):
		return false
	case strings.HasPrefix(path, "/auth/mode"):
		return false
	default:
		return true
	}
}

func clientIdentity(r *http.Request) string {
	if fwd := strings.TrimSpace(r.Header.Get("X-Forwarded-For")); fwd != "" {
		if idx := strings.Index(fwd, ","); idx > 0 {
			return strings.TrimSpace(fwd[:idx])
		}
		return fwd
	}
	host, _, err := net.SplitHostPort(strings.TrimSpace(r.RemoteAddr))
	if err == nil && host != "" {
		return host
	}
	if r.RemoteAddr != "" {
		return r.RemoteAddr
	}
	return "unknown"
}

func (s *state) isRateLimited(r *http.Request) bool {
	now := time.Now().UTC()
	key := clientIdentity(r) + "|" + r.URL.Path
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.rateWindow.IsZero() || now.Sub(s.rateWindow) >= time.Minute {
		s.rateWindow = now
		s.rateCounters = map[string]int{}
	}
	s.rateCounters[key]++
	return s.rateCounters[key] > 60
}

func isBlindspotPath(path string, secureMode bool) bool {
	if strings.HasPrefix(path, "/admin/debug") {
		return true
	}
	if !secureMode && strings.HasPrefix(path, "/ai/logs/ingest") {
		return true
	}
	return false
}

func respond(w http.ResponseWriter, code int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(body)
}
