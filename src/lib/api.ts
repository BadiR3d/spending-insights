export class ApiError extends Error {
  constructor(public status: number) {
    super(`Request failed (${status})`);
    this.name = 'ApiError';
  }
}
export async function getJson<T>(
  path: string,
  params: Record<string, string | number | undefined> = {},
  signal?: AbortSignal,
): Promise<T> {
  const base = import.meta.env.VITE_API_BASE_URL || window.location.origin;
  const url = new URL(path, base);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '')
      url.searchParams.set(key, String(value));
  });
  const response = await fetch(url, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new ApiError(response.status);
  return response.json() as Promise<T>;
}
