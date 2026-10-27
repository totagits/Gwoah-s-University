let csrf = '';
export const setSessionCsrf = (value: string) => {
  csrf = value;
};
const originalFetch = window.fetch.bind(window);
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = new URL(
    input instanceof Request ? input.url : String(input),
    window.location.href,
  );
  if (
    url.origin !== window.location.origin ||
    !url.pathname.startsWith('/api/')
  )
    return originalFetch(input, init);
  const method = (
    init?.method || (input instanceof Request ? input.method : 'GET')
  ).toUpperCase();
  const headers = new Headers(
    input instanceof Request ? input.headers : undefined,
  );
  new Headers(init?.headers).forEach((value, key) => headers.set(key, value));
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && csrf)
    headers.set('X-CSRF-Token', csrf);
  const response = await originalFetch(input, {
    ...init,
    headers,
    credentials: 'same-origin',
  });
  if (
    response.status === 401 &&
    !/^\/api\/auth\/(login|me|activate)/.test(url.pathname)
  )
    window.dispatchEvent(new Event('gu:session-expired'));
  return response;
};
