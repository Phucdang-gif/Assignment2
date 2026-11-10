const rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/+$/, '');
export const API_URL = rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`;

export async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || errorData?.error || `Lỗi kết nối tới server: HTTP ${response.status}`;
    throw new Error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }
  const text = await response.text();
  return (text ? JSON.parse(text) : {}) as T;
}

export function assetUrl(path: string): string {
  return `${API_URL}${path}`;
}
