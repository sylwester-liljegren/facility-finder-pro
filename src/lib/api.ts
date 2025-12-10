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

// Auth API response from backend
interface AuthApiResponse {
  success: boolean;
  data: {
    access_token: string;
    user: AuthUser;
  };
}

// Auth API
export const authApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiRequest<AuthApiResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const { access_token, user } = response.data;
    setToken(access_token);
    setStoredUser(user);
    return { token: access_token, user };
  },

  register: async (email: string, password: string, fullName?: string): Promise<AuthResponse> => {
    const response = await apiRequest<AuthApiResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    const { access_token, user } = response.data;
    setToken(access_token);
    setStoredUser(user);
    return { token: access_token, user };
  },

  logout: (): void => {
    removeToken();
  },
};

// API response wrapper type
interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  timestamp?: string;
}

// Public API
export const publicApi = {
  getFacilities: async (kommunId?: number) => {
    const params = kommunId ? `?kommun_id=${kommunId}` : "";
    const response = await apiRequest<ApiResponse<any[]>>(`/api/public/facilities${params}`);
    return response.data;
  },

  getFacility: async (id: number) => {
    // Backend uses query param, not path param
    const response = await apiRequest<ApiResponse<any[]>>(`/api/public/facilities?id=${id}`);
    return response.data?.[0] || null;
  },

  getMunicipalities: async () => {
    const response = await apiRequest<ApiResponse<any[]>>("/api/public/municipalities");
    return response.data;
  },

  getFacilityTypes: async () => {
    const response = await apiRequest<ApiResponse<any[]>>("/api/public/facility-types");
    return response.data;
  },
};

// Admin API (requires authentication)
export const adminApi = {
  getMyFacilities: async () => {
    const response = await apiRequest<ApiResponse<any[]>>("/api/admin/facilities");
    return response.data;
  },

  createFacility: async (data: any) => {
    const response = await apiRequest<ApiResponse<any>>("/api/admin/facilities", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  },

  updateFacility: async (id: number, data: any) => {
    const response = await apiRequest<ApiResponse<any>>(`/api/admin/facilities/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
    return response.data;
  },

  deleteFacility: async (id: number) => {
    const response = await apiRequest<ApiResponse<any>>(`/api/admin/facilities/${id}`, {
      method: "DELETE",
    });
    return response.data;
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
