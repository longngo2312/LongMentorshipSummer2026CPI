const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

//custom error class
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const isFormData = init.body instanceof FormData;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(isFormData
        ? {}
        : {
            "Content-Type": "application/json",
          }) /* Handle both json data and upload data */,
      ...authHeaders(),
      ...init.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    // Most routes return { error }; auth returns { success:false, message }.
    throw new ApiError(
      body?.error ?? body?.message ?? res.statusText,
      res.status,
    );
  }

  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}
