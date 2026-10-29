const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

let inMemoryCsrfToken = null;

function getCookieValue(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export function setCsrfToken(token) {
  if (token) {
    inMemoryCsrfToken = token;
  }
}

export function getCsrfToken() {
  return inMemoryCsrfToken || getCookieValue('nexora_csrf_token');
}

export async function apiRequest(endpoint, { method = 'GET', body, headers = {} } = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const upperMethod = method.toUpperCase();

  const requestHeaders = {
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  if (!['GET', 'HEAD', 'OPTIONS'].includes(upperMethod)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      requestHeaders['X-CSRF-Token'] = csrfToken;
    }
  }

  let response;
  try {
    response = await fetch(url, {
      method: upperMethod,
      headers: requestHeaders,
      credentials: 'include',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (_networkErr) {
    const error = new Error(
      'Unable to reach the Nexora API server. Please ensure the backend service is running.'
    );
    error.status = 0;
    error.isNetworkError = true;
    throw error;
  }

  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (_parseErr) {
      data = null;
    }
  }

  if (data && data.csrfToken) {
    setCsrfToken(data.csrfToken);
  }

  if (!response.ok) {
    const error = new Error(
      (data && data.message) || `Request failed with status ${response.status}`
    );
    error.status = response.status;
    error.errors = (data && data.errors) || null;
    error.code = (data && data.code) || null;
    throw error;
  }

  return data;
}
