export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const getAccessToken = () => accessToken;

async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  const config: RequestInit = {
    credentials: "include",
    ...options,
    headers,
  };

  if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  let response = await fetch(url, config);

  if (response.status === 401 && endpoint !== "/auth/refresh" && endpoint !== "/auth/login") {
    // Try to refresh token
    const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include", // Important: send HttpOnly cookie
    });

    if (refreshResponse.ok) {
      const data = await refreshResponse.json();
      setAccessToken(data.accessToken);

      // Retry original request with new token
      headers["Authorization"] = `Bearer ${accessToken}`;
      response = await fetch(url, { ...config, headers });
    } else {
      // Refresh failed, clear token
      setAccessToken(null);
      // Optional: Event dispatcher here to force logout in UI if needed
      if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth:unauthorized"));
      }
    }
  }

  return response;
}

export const api = {
  get: (endpoint: string, options?: RequestInit) => request(endpoint, { ...options, method: "GET" }),
  post: (endpoint: string, data?: any, options?: RequestInit) => request(endpoint, { ...options, method: "POST", body: data }),
  put: (endpoint: string, data?: any, options?: RequestInit) => request(endpoint, { ...options, method: "PUT", body: data }),
  delete: (endpoint: string, options?: RequestInit) => request(endpoint, { ...options, method: "DELETE" }),
};
