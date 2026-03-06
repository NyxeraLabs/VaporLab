const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:18080';

export type HealthResponse = {
  status: string;
  secure_mode: boolean;
  hardening_enabled?: boolean;
  effective_secure_mode?: boolean;
};

export type AuthConfigResponse = {
  secure_mode: boolean;
  weak_secret: boolean;
  jwt_secret?: string;
};

export type ModuleControlResponse = {
  modules: Record<string, boolean>;
  vulnerabilities?: Record<string, boolean>;
  secure_mode: boolean;
  hardening_enabled?: boolean;
  effective_secure_mode?: boolean;
};

export type ApiResult<T> = {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
};

export type TelemetryEvent = {
  timestamp: string;
  method: string;
  path: string;
  trace_id?: string;
  blindspot: boolean;
};

type APIErrorBody = {
  error?: string;
  [key: string]: unknown;
};

async function apiRequest<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    cache: 'no-store',
    ...init,
  });

  let payload: unknown = null;
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    payload = await res.json();
  } else {
    const text = await res.text();
    payload = text ? { message: text } : null;
  }

  if (res.ok) {
    return { ok: true, status: res.status, data: payload as T };
  }

  let error = `request failed (${res.status})`;
  if (payload && typeof payload === 'object') {
    const maybeError = (payload as APIErrorBody).error;
    if (typeof maybeError === 'string' && maybeError.trim() !== '') {
      error = maybeError;
    }
  }
  return { ok: false, status: res.status, error, data: (payload as T) ?? undefined };
}

export async function fetchHealth(): Promise<HealthResponse> {
  const result = await apiRequest<HealthResponse>('/healthz');
  if (!result.ok || !result.data) {
    throw new Error(`Health check failed: ${result.status}`);
  }
  return result.data;
}

export async function runAuthIssue(userId: string) {
  const result = await apiRequest<{ token: string }>('/auth/jwt/issue', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!result.ok || !result.data) {
    throw new Error(`JWT issue failed: ${result.status}`);
  }
  return result.data;
}

export async function fetchUsers(tenantId?: string) {
  const headers: HeadersInit = {};
  if (tenantId) {
    headers['X-Tenant-ID'] = tenantId;
  }
  const result = await apiRequest<Array<Record<string, unknown>>>('/users', { headers });
  if (!result.ok || !result.data) {
    throw new Error(`Users fetch failed: ${result.status}`);
  }
  return result.data;
}

export function fetchAuthConfig() {
  return apiRequest<AuthConfigResponse>('/auth/config');
}

export function fetchAuthMode() {
  return apiRequest<{ secure_mode: boolean }>('/auth/mode');
}

export function setAuthMode(secureMode: boolean) {
  return apiRequest<{ secure_mode: boolean }>('/auth/mode', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ secure_mode: secureMode }),
  });
}

export async function probeChain() {
  return apiRequest<{ chain: string }>('/chain/run');
}

export function fetchUserByID(userId: string, tenantId?: string) {
  const headers: HeadersInit = {};
  if (tenantId) {
    headers['X-Tenant-ID'] = tenantId;
  }
  return apiRequest<Record<string, unknown>>(`/users/${encodeURIComponent(userId)}`, { headers });
}

export function updateUserByID(
  userId: string,
  payload: Record<string, unknown>,
  tenantId?: string,
) {
  const headers: HeadersInit = { 'content-type': 'application/json' };
  if (tenantId) {
    headers['X-Tenant-ID'] = tenantId;
  }
  return apiRequest<Record<string, unknown>>(`/users/${encodeURIComponent(userId)}`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify(payload),
  });
}

export function applyCoupon(code: string, amount: number) {
  return apiRequest<{ total: number; coupon: string; reuse_count: number }>('/billing/coupon/apply', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ code, amount }),
  });
}

export function runBillingExport(format: string) {
  return apiRequest<{ output: string }>(`/billing/export?format=${encodeURIComponent(format)}`);
}

export function sendBillingWebhook(url: string, signature?: string) {
  return apiRequest<{ status: string; forwarded: string }>('/billing/webhook', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url, signature }),
  });
}

export function promoteUser(userId: string, includeAdminHeader: boolean) {
  const headers: HeadersInit = {};
  if (includeAdminHeader) {
    headers['X-Admin'] = 'true';
  }
  return apiRequest<Record<string, unknown>>(`/admin/promote?user_id=${encodeURIComponent(userId)}`, {
    method: 'POST',
    headers,
  });
}

export function fetchTenantManagement() {
  return apiRequest<{ tenants: string[]; unsafe: boolean }>('/admin/tenant');
}

export function fetchModuleControls() {
  return apiRequest<ModuleControlResponse>('/operator/modules');
}

export function setModuleControl(module: string, enabled: boolean) {
  return apiRequest<ModuleControlResponse>('/operator/modules', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ module, enabled }),
  });
}

export function setVulnerabilityControl(vulnerability: string, enabled: boolean) {
  return apiRequest<ModuleControlResponse>('/operator/modules', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ vulnerability, enabled }),
  });
}

export function setVulnerabilityControls(vulnerabilities: Record<string, boolean>) {
  return apiRequest<ModuleControlResponse>('/operator/modules', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ vulnerabilities }),
  });
}

export function fetchAdminDebug() {
  return apiRequest<{ env: string; token: string }>('/admin/debug');
}

export function runAIQuery(query: string) {
  return apiRequest<{ answer: string; system_prompt: string; query: string }>('/ai/query', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query }),
  });
}

export function fetchOIDCAuthorizeProbe(clientId: string, redirectUri: string, state = 'demo') {
  return fetchOIDCAuthorizeProbeWithNonce(clientId, redirectUri, state, 'nonce-demo');
}

export async function fetchOIDCAuthorizeProbeWithNonce(clientId: string, redirectUri: string, state: string, nonce: string) {
  const query = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    nonce,
  });
  const res = await fetch(`${API_BASE}/oidc/authorize?${query.toString()}`, {
    cache: 'no-store',
    redirect: 'manual',
  });
  return {
    ok: res.ok,
    status: res.status,
    location: res.headers.get('location') ?? '',
  };
}

export function fetchOIDCUserInfo(token?: string) {
  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return apiRequest<{ sub: string; email: string }>('/oidc/userinfo', { headers });
}

export function fetchOIDCToken(form?: {
  grant_type: string;
  client_id: string;
  client_secret: string;
  redirect_uri: string;
  code: string;
}) {
  let body: string | undefined;
  let headers: HeadersInit | undefined;
  if (form) {
    const encoded = new URLSearchParams(form);
    body = encoded.toString();
    headers = { 'content-type': 'application/x-www-form-urlencoded' };
  }
  return apiRequest<{ access_token: string; id_token: string; token_type: string }>('/oidc/token', {
    method: 'POST',
    headers,
    body,
  });
}

export function fetchURL(target: string) {
  return apiRequest<{ status: number; body: string }>(`/ssrf/fetch?url=${encodeURIComponent(target)}`);
}

export function runGraphQLProbe(query: string) {
  return apiRequest<{ depth: number; result: string }>('/graphql', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: query,
  });
}

export function fetchAPIVersion(version: 'v1' | 'v2' | 'beta' | 'internal') {
  const pathMap: Record<'v1' | 'v2' | 'beta' | 'internal', string> = {
    v1: '/v1/status',
    v2: '/v2/status',
    beta: '/beta/status',
    internal: '/internal/status',
  };
  return apiRequest<Record<string, unknown>>(pathMap[version]);
}

export function fetchOpenAPI() {
  return apiRequest<Record<string, unknown>>('/openapi.json');
}

export function fetchKBSearch(query: string) {
  return apiRequest<{ matches: string[] }>(`/kb/search?q=${encodeURIComponent(query)}`);
}

export function runEmbed(text: string) {
  return apiRequest<{ embedded: boolean; count: number }>('/ai/embed', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ text }),
  });
}

export function fetchAIConfig() {
  return apiRequest<Record<string, unknown>>('/ai/config');
}

export function runAIChain(targetUserID: string) {
  return apiRequest<{ chain: string; secure_mode: boolean; steps: Array<{ step: string; endpoint: string; result: string }> }>(
    '/ai/chain/run',
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ target_user_id: targetUserID }),
    },
  );
}

export async function fetchMetricsText() {
  const res = await fetch(`${API_BASE}/metrics`, { cache: 'no-store' });
  const text = await res.text();
  return { ok: res.ok, status: res.status, text };
}

export function fetchTelemetryEvents(limit = 30) {
  return apiRequest<{ events: TelemetryEvent[]; count: number }>(`/telemetry/events?limit=${encodeURIComponent(String(limit))}`);
}
