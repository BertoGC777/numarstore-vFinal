const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

interface ApiError {
  error?: string;
  message?: string;
}

async function request(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem("numar.token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options.headers) {
    Object.assign(headers, options.headers);
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  if (endpoint.includes('/admin/') && !token) {
    return null;
  }

  let res = await fetch(url, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401) {
    console.log("Request failed with 401, attempting token refresh");
    const refreshToken = localStorage.getItem("numar.refreshToken");
    if (refreshToken) {
      try {
        const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        console.log("Refresh response status:", refreshRes.status);
        if (refreshRes.ok) {
          const { token: newToken, refreshToken: newRefresh } = await refreshRes.json();
          localStorage.setItem("numar.token", newToken);
          if (newRefresh) localStorage.setItem("numar.refreshToken", newRefresh);
          console.log("Token refreshed in API client, retrying request");
          // Retry original request
          const retryHeaders: Record<string, string> = { "Content-Type": "application/json" };
          if (options.headers) {
            Object.assign(retryHeaders, options.headers);
          }
          retryHeaders["Authorization"] = `Bearer ${newToken}`;
          res = await fetch(url, { ...options, headers: retryHeaders });
        } else {
          console.log("Refresh failed, clearing session");
          // Refresh failed — clear session
          localStorage.removeItem("numar.token");
          localStorage.removeItem("numar.refreshToken");
          localStorage.removeItem("numar.user");
          return null;
        }
      } catch (err) {
        console.error("Refresh error:", err);
        localStorage.removeItem("numar.token");
        localStorage.removeItem("numar.refreshToken");
        return null;
      }
    } else {
      console.log("No refresh token available, clearing session");
      localStorage.removeItem("numar.token");
      localStorage.removeItem("numar.refreshToken");
      localStorage.removeItem("numar.user");
      return null;
    }
  }

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({}));
    throw new Error(err.error || err.message || `Erro ${res.status}`);
  }
  return res.json();
}

export const api = {
  get: (endpoint: string) => request(endpoint),
  post: (endpoint: string, data: unknown) => request(endpoint, { method: "POST", body: JSON.stringify(data) }),
  put: (endpoint: string, data: unknown) => request(endpoint, { method: "PUT", body: JSON.stringify(data) }),
  delete: (endpoint: string) => request(endpoint, { method: "DELETE" }),

  auth: {
    register: (data: { name: string; email: string; phone?: string; password: string }) => api.post("/auth/register", data),
    login: (data: { email: string; password: string }) => api.post("/auth/login", data),
    profile: () => api.get("/auth/profile"),
    update: (data: { name?: string; phone?: string }) => api.put("/auth/profile", data),
  },
  products: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return api.get(`/products/${qs}`);
    },
    get: (slug: string) => api.get(`/products/${slug}`),
    related: (slug: string) => api.get(`/products/${slug}/related`),
    search: (q: string) => api.get(`/products/search?q=${encodeURIComponent(q)}`),
    stock: (slug: string, color: string, size: string) => api.get(`/products/${slug}/stock?color=${color}&size=${size}`),
  },
  cart: {
    list: () => api.get("/cart"),
    add: (data: { productId: string; color: string; size: string; quantity?: number }) => api.post("/cart", data),
    update: (id: number, data: { quantity: number }) => api.put(`/cart/${id}`, data),
    remove: (id: number) => api.delete(`/cart/${id}`),
    clear: () => api.delete("/cart/clear"),
    total: () => api.get("/cart/total"),
  },
  orders: {
    create: (data: unknown) => api.post("/orders", data),
    list: () => api.get("/orders"),
    get: (id: string) => api.get(`/orders/${id}`),
  },
  cep: (cep: string) => api.get(`/cep/${cep}`),
  payments: {
    create: (data: unknown) => api.post("/payments", data),
    status: (id: string) => api.get(`/payments/${id}/status`),
    confirm: (id: string) => api.post(`/payments/${id}/confirm`, {}),
  },
};