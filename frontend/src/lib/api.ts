/**
 * ShopSense AI - API Client
 *
 * TypeScript API client for ShopSense AI backend.
 * Provides type-safe access to all API endpoints.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// ============================================================================
// Type Definitions
// ============================================================================

export interface User {
  id: string;
  username: string;
  email: string;
  role: "user" | "admin" | "viewer";
  company_name?: string;
  preferences?: {
    theme: "light" | "dark";
    timezone: string;
    currency: string;
  };
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
  user: User;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  company_name?: string;
}

export interface UploadSession {
  _id: string;
  upload_id: string;
  user_id: string;
  filename: string;
  file_type: "csv" | "excel" | "api" | "manual";
  status: "pending" | "processing" | "completed" | "failed";
  row_count?: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
  results?: {
    rows_processed: number;
    products: number;
    date_range: {
      start: string;
      end: string;
    };
  };
}

export interface ProductData {
  product_name: string;
  units_sold: number;
  price: number;
  revenue: number;
}

export interface TrendData {
  date: string;
  units_sold: number;
  revenue: number;
}

export interface ForecastPrediction {
  date: string;
  predicted_revenue: number;
  lower_bound: number | null;
  upper_bound: number | null;
  trend: number;
  weekly_effect: number;
}

export interface KPIData {
  total_revenue: number;
  total_units: number;
  total_products: number;
  avg_order_value: number;
  avg_price: number;
}

export interface ProductAnalysis {
  summary: {
    total_products: number;
    total_revenue: number;
    total_units: number;
    avg_price: number;
    avg_units_per_product: number;
  };
  top_performers: {
    by_units: {
      product_name: string;
      units_sold: number;
      price: number;
    };
    by_revenue: {
      product_name: string;
      revenue: number;
    };
  };
  bottom_performers: {
    product_name: string;
    units_sold: number;
    price: number;
  };
}

export interface TrendAnalysis {
  trend_direction: "increasing" | "decreasing" | "insufficient_data";
  avg_daily_growth: number;
  avg_daily_revenue: number;
  data_points: number;
}

export interface Recommendation {
  priority: "high" | "medium" | "low";
  category: "inventory" | "pricing" | "growth" | "marketing" | "data";
  recommendation: string;
}

export interface AIInsights {
  performance_analysis: {
    title: string;
    content: string;
  };
  market_insights: {
    title: string;
    content: string;
  };
  strategic_recommendations: {
    immediate_actions: string[];
    short_term_strategies: string[];
    long_term_initiatives: string[];
  };
  financial_insights: {
    title: string;
    content: string;
  };
  executive_summary: {
    title: string;
    content: string;
  };
}

export interface DashboardData {
  has_data: boolean;
  kpis?: KPIData;
  charts?: {
    top_products: ProductData[];
    low_products: ProductData[];
    price_volume: ProductData[];
    time_series: TrendData[];
    forecast: ForecastPrediction[];
  };
  analysis?: {
    product_analysis: ProductAnalysis;
    trend_analysis: TrendAnalysis;
    recommendations: Recommendation[];
  };
  uploads?: UploadSession[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
  meta?: {
    request_id?: string;
    timestamp?: string;
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

// ============================================================================
// API Error Classes
// ============================================================================

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
    public details?: Array<{ field: string; message: string }>,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string, status = 401) {
    super("AUTHENTICATION_ERROR", message, status);
    this.name = "AuthenticationError";
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    details?: Array<{ field: string; message: string }>,
  ) {
    super("VALIDATION_ERROR", message, 400, details);
    this.name = "ValidationError";
  }
}

// ============================================================================
// API Client Class
// ============================================================================

class ShopSenseAPI {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  // -------------------------------------------------------------------------
  // Token Management
  // -------------------------------------------------------------------------

  private loadToken(): void {
    if (typeof localStorage !== "undefined") {
      this.token = localStorage.getItem("shopsense_token") || null;
    }
  }

  private saveToken(token: string): void {
    this.token = token;
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("shopsense_token", token);
    }
  }

  private clearToken(): void {
    this.token = null;
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem("shopsense_token");
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // -------------------------------------------------------------------------
  // Request Helper
  // -------------------------------------------------------------------------

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        if (data.error) {
          if (response.status === 401) {
            throw new AuthenticationError(data.error.message);
          }
          if (
            response.status === 400 &&
            data.error.code === "VALIDATION_ERROR"
          ) {
            throw new ValidationError(data.error.message, data.error.details);
          }
          throw new ApiError(
            data.error.code,
            data.error.message,
            response.status,
            data.error.details,
          );
        }
        throw new ApiError(
          "UNKNOWN_ERROR",
          "An unexpected error occurred",
          response.status,
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new ApiError("NETWORK_ERROR", "Unable to connect to server", 0);
      }
      throw error;
    }
  }

  // -------------------------------------------------------------------------
  // Authentication Endpoints
  // -------------------------------------------------------------------------

  async register(data: RegisterRequest): Promise<ApiResponse<AuthTokens>> {
    const response = await this.request<AuthTokens>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (response.data) {
      this.saveToken(response.data.access_token);
    }

    return response;
  }

  async login(data: LoginRequest): Promise<ApiResponse<AuthTokens>> {
    const response = await this.request<AuthTokens>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        identifier: data.identifier || (data as any).username_or_email || '',
        password: data.password,
      }),
    });

    if (response.data) {
      this.saveToken(response.data.access_token);
    }

    return response;
  }

  async logout(): Promise<ApiResponse<void>> {
    this.clearToken();
    return this.request("/auth/logout", { method: "POST" });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    if (!this.token) {
      // Don't throw error if no token - this is normal when logged out
      return { success: false, error: { code: 'TOKEN_MISSING', message: 'Not authenticated' } };
    }
    return this.request<User>("/auth/me");
  }

  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>("/auth/me", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<ApiResponse<void>> {
    return this.request("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    const response = await this.request<AuthTokens>("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.data) {
      this.saveToken(response.data.access_token);
    }

    return response;
  }

  // -------------------------------------------------------------------------
  // Upload Endpoints
  // -------------------------------------------------------------------------

  async upload(file: File): Promise<
    ApiResponse<{
      upload_id: string;
      filename: string;
      rows_processed: number;
      products_count: number;
      analysis: ProductAnalysis;
      recommendations: Recommendation[];
    }>
  > {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${this.baseURL}/uploads`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.error) {
        throw new ApiError(
          data.error.code,
          data.error.message,
          response.status,
        );
      }
      throw new ApiError("UPLOAD_ERROR", "Upload failed", response.status);
    }

    return data;
  }

  async getUploads(
    limit = 50,
    status?: string,
  ): Promise<ApiResponse<UploadSession[]>> {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (status) params.append("status", status);
    return this.request<UploadSession[]>(`/uploads?${params}`);
  }

  async getUpload(uploadId: string): Promise<ApiResponse<UploadSession>> {
    return this.request<UploadSession>(`/uploads/${uploadId}`);
  }

  async deleteUpload(uploadId: string): Promise<ApiResponse<void>> {
    return this.request(`/uploads/${uploadId}`, { method: "DELETE" });
  }

  async getUploadData(uploadId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/uploads/${uploadId}/data`);
  }

  // -------------------------------------------------------------------------
  // Analytics Endpoints
  // -------------------------------------------------------------------------

  async getSummary(params?: {
    upload_id?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<
    ApiResponse<{
      product_analysis: ProductAnalysis;
      trend_analysis: TrendAnalysis;
      recommendations: Recommendation[];
    }>
  > {
    const queryString = params ? new URLSearchParams(params).toString() : "";
    return this.request(
      `/analytics/summary${queryString ? `?${queryString}` : ""}`,
    );
  }

  async getProducts(
    uploadId?: string,
    limit = 100,
  ): Promise<
    ApiResponse<{
      products: ProductData[];
      total_products: number;
    }>
  > {
    const params = new URLSearchParams();
    if (uploadId) params.append("upload_id", uploadId);
    params.append("limit", limit.toString());
    return this.request(`/analytics/products?${params}`);
  }

  async getTrends(uploadId?: string): Promise<
    ApiResponse<{
      trends: TrendData[];
      data_points: number;
    }>
  > {
    const params = new URLSearchParams();
    if (uploadId) params.append("upload_id", uploadId);
    return this.request(`/analytics/trends?${params}`);
  }

  async getForecast(
    uploadId?: string,
    periods = 30,
  ): Promise<
    ApiResponse<{
      success: boolean;
      forecast_period_days: number;
      total_predicted_revenue: number;
      avg_daily_revenue: number;
      predictions: ForecastPrediction[];
      model_info: {
        algorithm: string;
        trained_on: string;
        trained_to: string;
      };
    }>
  > {
    const params = new URLSearchParams({ periods: periods.toString() });
    if (uploadId) params.append("upload_id", uploadId);
    return this.request(`/analytics/forecast?${params}`);
  }

  async getAIInsights(uploadId?: string): Promise<ApiResponse<AIInsights>> {
    return this.request<AIInsights>("/analytics/insights", {
      method: "POST",
      body: JSON.stringify({ upload_id: uploadId }),
    });
  }

  // -------------------------------------------------------------------------
  // Dashboard Endpoints
  // -------------------------------------------------------------------------

  async getDashboard(uploadId?: string): Promise<ApiResponse<DashboardData>> {
    const params = uploadId ? `?upload_id=${uploadId}` : "";
    return this.request<DashboardData>(`/dashboard${params}`);
  }

  async getKPIs(uploadId?: string): Promise<ApiResponse<KPIData>> {
    const params = uploadId ? `?upload_id=${uploadId}` : "";
    return this.request<KPIData>(`/dashboard/kpis${params}`);
  }

  async getCharts(uploadId?: string): Promise<
    ApiResponse<{
      top_products: ProductData[];
      low_products: ProductData[];
      time_series: TrendData[];
    }>
  > {
    const params = uploadId ? `?upload_id=${uploadId}` : "";
    return this.request(`/dashboard/charts${params}`);
  }

  // -------------------------------------------------------------------------
  // Utility Methods
  // -------------------------------------------------------------------------

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getToken(): string | null {
    return this.token;
  }

  clearAuth(): void {
    this.clearToken();
  }
}

// ============================================================================
// Export Singleton Instance
// ============================================================================

export const api = new ShopSenseAPI();
export default api;
