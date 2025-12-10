// API configuration for Azure Container Apps backend

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://cif-container-app.politeflower-f7763a04.swedencentral.azurecontainerapps.io";

// Token management
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export interface AuthUser {
  id: string;
  email: string;
  full_name?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): AuthUser | null {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

// API request helper
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${response.status}`);
  }

  return response.json();
}

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const data = await apiRequest<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setToken(data.token);
    setStoredUser(data.user);
    return data;
  },

  register: async (email: string, password: string, fullName?: string): Promise<AuthResponse> => {
    const data = await apiRequest<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    setToken(data.token);
    setStoredUser(data.user);
    return data;
  },

  logout: (): void => {
    removeToken();
  },
};

// Public API
export const publicApi = {
  getFacilities: async (kommunId?: number) => {
    const params = kommunId ? `?kommun_id=${kommunId}` : "";
    return apiRequest<any[]>(`/api/public/facilities${params}`);
  },

  getFacility: async (id: number) => {
    return apiRequest<any>(`/api/public/facilities/${id}`);
  },

  getMunicipalities: async () => {
    return apiRequest<any[]>("/api/public/municipalities");
  },

  getFacilityTypes: async () => {
    return apiRequest<any[]>("/api/public/facility-types");
  },
};

// Admin API (requires authentication)
export const adminApi = {
  getMyFacilities: async () => {
    return apiRequest<any[]>("/api/admin/facilities");
  },

  createFacility: async (data: any) => {
    return apiRequest<any>("/api/admin/facilities", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateFacility: async (id: number, data: any) => {
    return apiRequest<any>(`/api/admin/facilities/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteFacility: async (id: number) => {
    return apiRequest<any>(`/api/admin/facilities/${id}`, {
      method: "DELETE",
    });
  },
};

// Geocode API
export const geocodeApi = {
  geocode: async (data: {
    address?: string;
    postalCode?: string;
    city?: string;
    kommun?: string;
  }) => {
    return apiRequest<{
      success: boolean;
      latitude?: number;
      longitude?: number;
      displayName?: string;
      error?: string;
    }>("/api/geocode", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};
