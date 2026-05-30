import { getToken } from './auth.js';

const API_BASE = window.API_BASE || '';

export async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Prefix local API routes with API_BASE when starting with /api
  let url = endpoint;
  if (typeof endpoint === 'string' && endpoint.startsWith('/api')) {
    url = `${API_BASE}${endpoint}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Erreur API: ${response.status}`);
  }

  return response.json();
}
