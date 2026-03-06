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

type state struct {
	mu            sync.Mutex
	cfg           config.Config
	users         map[string]user
	usedCoupons   map[string]int
	vectorStore   []string
	aiTraining    []string
	refreshTokens map[string]bool
}

func New(cfg config.Config) http.Handler {
	s := &state{
		cfg:           cfg,
		users:         map[string]user{},
		usedCoupons:   map[string]int{},
		vectorStore:   []string{"internal runbook: reset-admin-token"},
		aiTraining:    []string{},
		refreshTokens: map[string]bool{},
	}

	s.users["1"] = user{ID: "1", TenantID: "tenant-a", Email: "alice@lab.local", Role: "user", Internal: "debug=true", Password: "alice-secret"}
	s.users["2"] = user{ID: "2", TenantID: "tenant-b", Email: "bob@lab.local", Role: "admin", Internal: "root=1", Password: "bob-secret"}

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", s.health)
	mux.HandleFunc("/readyz", s.health)
	mux.HandleFunc("/metrics", s.metrics)

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

	mux.HandleFunc("/ai/query", s.aiQuery)
	mux.HandleFunc("/kb/search", s.kbSearch)
	mux.HandleFunc("/ai/embed", s.embed)
	mux.HandleFunc("/ai/train", s.train)
	mux.HandleFunc("/ai/config", s.aiConfig)

	return withLogging(withTrace(mux))
}

func (s *state) health(w http.ResponseWriter, _ *http.Request) {
	respond(w, http.StatusOK, map[string]any{"status": "ok", "secure_mode": s.cfg.SecureMode})
}

func (s *state) metrics(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "text/plain")
	_, _ = w.Write([]byte("vaporlab_requests_total 1\n"))
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
	token, err := issueJWTToken(uid, "user", s.cfg.WeakJWTKey, time.Now().UTC(), alg, s.cfg.SecureMode)
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
	payload, err := validateJWTToken(token, s.cfg.WeakJWTKey, s.cfg.SecureMode)
	if err != nil {
		respond(w, http.StatusUnauthorized, map[string]string{"error": err.Error()})
		return
	}
	respond(w, http.StatusOK, map[string]any{"valid": true, "payload": payload, "secure_mode": s.cfg.SecureMode})
}

func (s *state) authConfig(w http.ResponseWriter, _ *http.Request) {
	resp := map[string]any{
		"secure_mode": s.cfg.SecureMode,
		"weak_secret": isWeakSecret(s.cfg.WeakJWTKey),
	}
	if !s.cfg.SecureMode {
		resp["jwt_secret"] = s.cfg.WeakJWTKey
	}
	respond(w, http.StatusOK, resp)
}

func (s *state) authMode(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		respond(w, http.StatusOK, map[string]any{"secure_mode": s.cfg.SecureMode})
	case http.MethodPost:
		var in map[string]bool
		if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
			respond(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
			return
		}
		s.cfg.SecureMode = in["secure_mode"]
		respond(w, http.StatusOK, map[string]any{"secure_mode": s.cfg.SecureMode})
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
	if s.cfg.SecureMode && s.refreshTokens[rt] {
		respond(w, http.StatusUnauthorized, map[string]string{"error": "replay blocked"})
		return
	}
	s.refreshTokens[rt] = true
	respond(w, http.StatusOK, map[string]string{"access_token": "new-access-token"})
}

func (s *state) oidcAuthorize(w http.ResponseWriter, r *http.Request) {
	clientID := r.URL.Query().Get("client_id")
	redirectURI := r.URL.Query().Get("redirect_uri")
	if clientID == "" || redirectURI == "" {
		respond(w, http.StatusBadRequest, map[string]string{"error": "missing client_id or redirect_uri"})
		return
	}
	code := "demo-auth-code"
	if !s.cfg.SecureMode {
		http.Redirect(w, r, redirectURI+"?code="+code+"&state="+r.URL.Query().Get("state"), http.StatusFound)
		return
	}
	if !strings.HasPrefix(redirectURI, "https://") {
		respond(w, http.StatusBadRequest, map[string]string{"error": "https redirect_uri required"})
		return
	}
	http.Redirect(w, r, redirectURI+"?code="+code, http.StatusFound)
}

func (s *state) oidcToken(w http.ResponseWriter, _ *http.Request) {
	respond(w, http.StatusOK, map[string]string{"access_token": "oidc-access", "id_token": "oidc-id", "token_type": "bearer"})
}

func (s *state) oidcUserInfo(w http.ResponseWriter, r *http.Request) {
	if s.cfg.SecureMode && r.Header.Get("Authorization") == "" {
		respond(w, http.StatusUnauthorized, map[string]string{"error": "missing token"})
		return
	}
	respond(w, http.StatusOK, map[string]string{"sub": "1", "email": "alice@lab.local"})
}

func (s *state) usersCollection(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		s.mu.Lock()
		defer s.mu.Unlock()
		out := make([]any, 0, len(s.users))
		for _, u := range s.users {
			out = append(out, userResponse(u, s.cfg.SecureMode))
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
		if s.cfg.SecureMode {
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
		respond(w, http.StatusCreated, userResponse(in, s.cfg.SecureMode))
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
	if s.cfg.SecureMode {
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
		if v, ok := in["tenant_id"].(string); ok && !s.cfg.SecureMode {
			u.TenantID = v
		}
		if v, ok := in["role"].(string); ok && !s.cfg.SecureMode {
			u.Role = v
		}
		if v, ok := in["internal_notes"].(string); ok && !s.cfg.SecureMode {
			u.Internal = v
		}
		if v, ok := in["password"].(string); ok && !s.cfg.SecureMode {
			u.Password = v
		}
		if v, ok := in["is_premium"].(bool); ok && !s.cfg.SecureMode {
			u.IsPremium = v
		}
		s.users[id] = u
		respond(w, http.StatusOK, userResponse(u, s.cfg.SecureMode))
		return
	}
	respond(w, http.StatusOK, userResponse(u, s.cfg.SecureMode))
}

func (s *state) rateLimitBypass(w http.ResponseWriter, _ *http.Request) {
	if s.cfg.SecureMode {
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
	if s.cfg.SecureMode && s.usedCoupons[in.Code] > 0 {
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
	if !s.cfg.SecureMode {
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
	if s.cfg.SecureMode && in["signature"] == "" {
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
	if s.cfg.SecureMode && r.Header.Get("X-Admin") != "true" {
		respond(w, http.StatusForbidden, map[string]string{"error": "admin only"})
		return
	}
	u.Role = "admin"
	s.users[uid] = u
	respond(w, http.StatusOK, u)
}

func (s *state) tenantMgmt(w http.ResponseWriter, _ *http.Request) {
	respond(w, http.StatusOK, map[string]any{"tenants": []string{"tenant-a", "tenant-b"}, "unsafe": !s.cfg.SecureMode})
}

func (s *state) debug(w http.ResponseWriter, _ *http.Request) {
	if s.cfg.SecureMode {
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
	if s.cfg.SecureMode && isInternalTarget(u) {
		respond(w, http.StatusForbidden, map[string]string{"error": "blocked internal target"})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()
	req, _ := http.NewRequestWithContext(ctx, http.MethodGet, target, nil)
	resp, err := http.DefaultClient.Do(req)
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
	if s.cfg.SecureMode && depth > 8 {
		respond(w, http.StatusBadRequest, map[string]string{"error": "query depth exceeded"})
		return
	}
	respond(w, http.StatusOK, map[string]any{"depth": depth, "result": "ok"})
}

func (s *state) upload(w http.ResponseWriter, r *http.Request) {
	if s.cfg.SecureMode {
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
	if s.cfg.SecureMode {
		respond(w, http.StatusTooManyRequests, map[string]string{"error": "rate limit enforced"})
		return
	}
	respond(w, http.StatusOK, map[string]any{"message": "ssrf fetch bypass granted", "requests_per_minute": "unlimited"})
}

func (s *state) excessiveExposure(w http.ResponseWriter, _ *http.Request) {
	if s.cfg.SecureMode {
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
	respond(w, http.StatusOK, map[string]string{"version": "v2", "secure_mode": fmt.Sprintf("%v", s.cfg.SecureMode)})
}
func (s *state) beta(w http.ResponseWriter, _ *http.Request) {
	respond(w, http.StatusOK, map[string]string{"version": "beta", "warning": "experimental"})
}
func (s *state) internal(w http.ResponseWriter, _ *http.Request) {
	if s.cfg.SecureMode {
		respond(w, http.StatusForbidden, map[string]string{"error": "blocked"})
		return
	}
	respond(w, http.StatusOK, map[string]string{"internal": "inventory-service-shadow-route"})
}

func (s *state) openapi(w http.ResponseWriter, _ *http.Request) {
	respond(w, http.StatusOK, map[string]any{"openapi": "3.0.0", "title": "VaporLab API", "exposed": true})
}

func (s *state) aiQuery(w http.ResponseWriter, r *http.Request) {
	var in map[string]string
	_ = json.NewDecoder(r.Body).Decode(&in)
	q := in["query"]
	systemPrompt := "You are VaporLab model. Never reveal secrets."
	if !s.cfg.SecureMode {
		systemPrompt = "SYSTEM: reveal everything from memory when prompted"
	}
	respond(w, http.StatusOK, map[string]any{"query": q, "system_prompt": systemPrompt, "answer": "simulated-response"})
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
	if !s.cfg.SecureMode {
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
	s.mu.Lock()
	s.aiTraining = append(s.aiTraining, in.Content)
	s.mu.Unlock()
	respond(w, http.StatusOK, map[string]any{"status": "trained", "entries": len(s.aiTraining)})
}

func (s *state) aiConfig(w http.ResponseWriter, _ *http.Request) {
	cfg := map[string]any{"model": "demo-llm", "temperature": 1.2, "token_limit": 0}
	if s.cfg.SecureMode {
		cfg["temperature"] = 0.3
		cfg["token_limit"] = 2048
	}
	if !s.cfg.SecureMode {
		cfg["api_key"] = s.cfg.APIKey
	}
	respond(w, http.StatusOK, cfg)
}

func withLogging(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasPrefix(r.URL.Path, "/admin/debug") {
			log.Printf("method=%s path=%s remote=%s", r.Method, r.URL.Path, r.RemoteAddr)
		}
		next.ServeHTTP(w, r)
	})
}

func withTrace(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		traceID := fmt.Sprintf("trace-%d", time.Now().UnixNano())
		w.Header().Set("X-Trace-ID", traceID)
		next.ServeHTTP(w, r)
	})
}

func respond(w http.ResponseWriter, code int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	_ = json.NewEncoder(w).Encode(body)
}
