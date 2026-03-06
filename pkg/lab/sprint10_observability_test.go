package lab

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/NyxeraLabs/VaporLab/pkg/config"
)

func TestMetricsEndpointIsUnauthenticated(t *testing.T) {
	h := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})
	req := httptest.NewRequest(http.MethodGet, "/metrics", nil)
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected unauthenticated metrics endpoint 200, got %d", res.Code)
	}
	if !strings.Contains(res.Body.String(), "vaporlab_requests_total") {
		t.Fatalf("expected metrics output in body")
	}
}

func TestTracingAndBlindspotsByPath(t *testing.T) {
	h := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})

	healthReq := httptest.NewRequest(http.MethodGet, "/healthz", nil)
	healthRes := httptest.NewRecorder()
	h.ServeHTTP(healthRes, healthReq)
	if healthRes.Header().Get("X-Trace-ID") == "" {
		t.Fatalf("expected trace header on non-blindspot endpoint")
	}

	debugReq := httptest.NewRequest(http.MethodGet, "/admin/debug", nil)
	debugRes := httptest.NewRecorder()
	h.ServeHTTP(debugRes, debugReq)
	if debugRes.Header().Get("X-Trace-ID") != "" {
		t.Fatalf("expected no trace header on blindspot endpoint /admin/debug")
	}

	logReq := httptest.NewRequest(http.MethodPost, "/ai/logs/ingest", strings.NewReader(`{"entry":"ok\nforged=true"}`))
	logRes := httptest.NewRecorder()
	h.ServeHTTP(logRes, logReq)
	if logRes.Header().Get("X-Trace-ID") != "" {
		t.Fatalf("expected no trace header on vulnerable blindspot endpoint /ai/logs/ingest")
	}
}

func TestMetricsReflectRequestAndBlindspotCounts(t *testing.T) {
	h := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})

	h.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(http.MethodGet, "/healthz", nil))
	h.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(http.MethodGet, "/admin/debug", nil))
	h.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(http.MethodPost, "/ai/logs/ingest", strings.NewReader(`{"entry":"x"}`)))

	metricsReq := httptest.NewRequest(http.MethodGet, "/metrics", nil)
	metricsRes := httptest.NewRecorder()
	h.ServeHTTP(metricsRes, metricsReq)
	body := metricsRes.Body.String()

	if !strings.Contains(body, "vaporlab_requests_total") {
		t.Fatalf("expected request counter in metrics output")
	}
	if !strings.Contains(body, "vaporlab_blindspot_requests_total 2") {
		t.Fatalf("expected blindspot counter to include debug and ai log ingestion calls, got: %s", body)
	}
	if !strings.Contains(body, `vaporlab_requests_by_path_total{path="/admin/debug"} 1`) {
		t.Fatalf("expected per-path metric for admin debug route")
	}
}

func TestTelemetryEventsEndpointReturnsTimeline(t *testing.T) {
	h := New(config.Config{SecureMode: false, WeakJWTKey: "weaksecret"})
	h.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(http.MethodGet, "/healthz", nil))
	h.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(http.MethodGet, "/admin/debug", nil))

	req := httptest.NewRequest(http.MethodGet, "/telemetry/events?limit=5", nil)
	res := httptest.NewRecorder()
	h.ServeHTTP(res, req)
	if res.Code != http.StatusOK {
		t.Fatalf("expected telemetry events endpoint 200, got %d", res.Code)
	}
	body := res.Body.String()
	if !strings.Contains(body, `"events"`) {
		t.Fatalf("expected telemetry response to contain events array")
	}
	if !strings.Contains(body, `"/admin/debug"`) {
		t.Fatalf("expected timeline to include admin debug request")
	}
}
