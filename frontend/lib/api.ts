const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:18080';

export type HealthResponse = {
  status: string;
  secure_mode: boolean;
};

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/healthz`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }
  return res.json();
}

export async function runAuthIssue(userId: string) {
  const res = await fetch(`${API_BASE}/auth/jwt/issue`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!res.ok) {
    throw new Error(`JWT issue failed: ${res.status}`);
  }
  return res.json();
}

export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/users`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Users fetch failed: ${res.status}`);
  }
  return res.json();
}

export async function probeChain() {
  const res = await fetch(`${API_BASE}/chain/run`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`Chain probe failed: ${res.status}`);
  }
  return res.json();
}
