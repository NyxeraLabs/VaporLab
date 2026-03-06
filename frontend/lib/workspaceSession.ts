export const WORKSPACE_AUTH_KEY = 'vaporlab_workspace_auth';
export const WORKSPACE_USER_KEY = 'vaporlab_workspace_user';
export const WORKSPACE_TENANT_KEY = 'vaporlab_workspace_tenant';
const WORKSPACE_CUSTOM_USERS_KEY = 'vaporlab_workspace_custom_users';

export type WorkspaceUser = {
  username: string;
  tenant: string;
};

const users: Array<WorkspaceUser & { password: string }> = [
  { username: 'userA', password: 'vaporlab', tenant: 'tenant-a' },
  { username: 'userB', password: 'vaporlab', tenant: 'tenant-b' },
];

function readCustomUsers(): Array<WorkspaceUser & { password: string }> {
  if (typeof window === 'undefined') {
    return [];
  }
  const raw = window.localStorage.getItem(WORKSPACE_CUSTOM_USERS_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed
      .filter(
        (entry) =>
          typeof entry?.username === 'string' &&
          typeof entry?.password === 'string' &&
          typeof entry?.tenant === 'string',
      )
      .map((entry) => ({ username: entry.username, password: entry.password, tenant: entry.tenant }));
  } catch {
    return [];
  }
}

function writeCustomUsers(custom: Array<WorkspaceUser & { password: string }>) {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.setItem(WORKSPACE_CUSTOM_USERS_KEY, JSON.stringify(custom));
}

export function workspaceAccounts() {
  const merged = [...users, ...readCustomUsers()];
  return merged.map(({ username, tenant }) => ({ username, tenant }));
}

export function authenticateWorkspaceUser(username: string, password: string): WorkspaceUser | null {
  const merged = [...users, ...readCustomUsers()];
  const found = merged.find((user) => user.username === username && user.password === password);
  if (!found) {
    return null;
  }
  return { username: found.username, tenant: found.tenant };
}

export function registerWorkspaceUser(username: string, password: string, tenant: string): { ok: boolean; error?: string } {
  const normalized = username.trim();
  if (normalized.length < 3) {
    return { ok: false, error: 'Username too short' };
  }
  if (password.length < 6) {
    return { ok: false, error: 'Password must be at least 6 chars' };
  }
  if (tenant !== 'tenant-a' && tenant !== 'tenant-b') {
    return { ok: false, error: 'Unsupported tenant' };
  }
  const merged = [...users, ...readCustomUsers()];
  if (merged.some((user) => user.username.toLowerCase() === normalized.toLowerCase())) {
    return { ok: false, error: 'Username already exists' };
  }
  const custom = readCustomUsers();
  custom.push({ username: normalized, password, tenant });
  writeCustomUsers(custom);
  return { ok: true };
}

export function readWorkspaceSession(): WorkspaceUser | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const auth = window.sessionStorage.getItem(WORKSPACE_AUTH_KEY);
  if (auth !== 'true') {
    return null;
  }
  const username = window.sessionStorage.getItem(WORKSPACE_USER_KEY) ?? '';
  const tenant = window.sessionStorage.getItem(WORKSPACE_TENANT_KEY) ?? '';
  if (!username || !tenant) {
    return null;
  }
  return { username, tenant };
}

export function writeWorkspaceSession(user: WorkspaceUser) {
  if (typeof window === 'undefined') {
    return;
  }
  window.sessionStorage.setItem(WORKSPACE_AUTH_KEY, 'true');
  window.sessionStorage.setItem(WORKSPACE_USER_KEY, user.username);
  window.sessionStorage.setItem(WORKSPACE_TENANT_KEY, user.tenant);
}

export function clearWorkspaceSession() {
  if (typeof window === 'undefined') {
    return;
  }
  window.sessionStorage.removeItem(WORKSPACE_AUTH_KEY);
  window.sessionStorage.removeItem(WORKSPACE_USER_KEY);
  window.sessionStorage.removeItem(WORKSPACE_TENANT_KEY);
}
