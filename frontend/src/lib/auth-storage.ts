export interface StoredAuth {
  token: string | null;
  user: Record<string, unknown> | null;
}

const TOKEN_KEY = "token";
const USER_KEY = "user";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getStoredAuth(): StoredAuth {
  if (!isBrowser()) return { token: null, user: null };

  try {
    const token = sessionStorage.getItem(TOKEN_KEY);
    const rawUser = sessionStorage.getItem(USER_KEY);

    return {
      token: token || null,
      user: rawUser ? JSON.parse(rawUser) : null,
    };
  } catch {
    return { token: null, user: null };
  }
}

export function setStoredAuth(token: string | null, user: Record<string, unknown> | null) {
  if (!isBrowser()) return;

  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
  }

  if (user) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(USER_KEY);
  }

  if (localStorage.getItem(TOKEN_KEY)) localStorage.removeItem(TOKEN_KEY);
  if (localStorage.getItem(USER_KEY)) localStorage.removeItem(USER_KEY);
}

export function clearStoredAuth() {
  if (!isBrowser()) return;
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
