const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:18080';

export type HealthResponse = {
  status: string;
  secure_mode: boolean;
};

export type ApiResult<T> = {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
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

export async function fetchUsers() {
  const result = await apiRequest<Array<Record<string, unknown>>>('/users');
  if (!result.ok || !result.data) {
    throw new Error(`Users fetch failed: ${result.status}`);
  }
  return result.data;
}

export async function probeChain() {
  return apiRequest<{ chain: string }>('/chain/run');
}

export function fetchUserByID(userId: string) {
  return apiRequest<Record<string, unknown>>(`/users/${encodeURIComponent(userId)}`);
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
