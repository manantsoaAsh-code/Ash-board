export function saveToken(token) {
  if (!token) {
    throw new Error('Token manquant');
  }

  localStorage.setItem('ashboard_token', token);
}

export function getToken() {
  return localStorage.getItem('ashboard_token');
}

export function clearToken() {
  localStorage.removeItem('ashboard_token');
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export async function login(credentials) {
  return {
    ok: true,
    credentials,
  };
}

export async function register(userData) {
  return {
    ok: true,
    userData,
  };
}

export function logout() {
  clearToken();
}
