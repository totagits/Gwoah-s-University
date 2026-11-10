// CSRF tokens are held in memory; the HttpOnly session cookie never enters JavaScript.
let csrfToken = '';
export function setMediaCsrf(value: string) {
  csrfToken = /^[0-9a-f]{64}$/.test(value) ? value : '';
}
export function clearMediaCsrf() { csrfToken = ''; }
export function mediaAdminHeaders(extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  if (csrfToken) headers.set('X-HIAU-CSRF', csrfToken);
  return headers;
}
export async function restoreMediaSession(): Promise<{ success: boolean; user?: any; csrf?: string }> {
  const response = await fetch('/api/auth/session', { credentials: 'same-origin', cache: 'no-store' });
  if (!response.ok) { clearMediaCsrf(); return { success: false }; }
  const data = await response.json();
  setMediaCsrf(data.csrf);
  return data;
}
export async function logoutMediaSession(): Promise<void> {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST', credentials: 'same-origin',
      headers: mediaAdminHeaders(),
    });
  } finally { clearMediaCsrf(); }
}
