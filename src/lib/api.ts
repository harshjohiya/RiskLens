// RiskLens API Client
import type {
  ApplicantInput,
  PredictionResponse,
  PortfolioSummary,
  BatchScoreResponse,
  BatchJobStatus,
  HistoryResponse,
  HistoryFilters,
  ExplainabilityResponse,
  ModelSettings,
  ThresholdSettings,
  HealthStatus,
  ModelType,
} from "@/types/api";
import { authService } from "./auth";

// Base API URL - configure this for your environment
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Get auth token if available
    const token = authService.getToken();
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...authHeaders,
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: "An unexpected error occurred",
      }));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Health Check
  async getHealth(): Promise<HealthStatus> {
    return this.fetch<HealthStatus>("/health");
  }

  // Single Applicant Scoring
  async predict(input: ApplicantInput): Promise<PredictionResponse> {
    return this.fetch<PredictionResponse>("/api/predict", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  // Portfolio Summary
  async getPortfolioSummary(): Promise<PortfolioSummary> {
    return this.fetch<PortfolioSummary>("/api/portfolio/summary");
  }

  // Batch Scoring
  async submitBatchScore(
    file: File,
    modelType: ModelType
  ): Promise<BatchScoreResponse> {
    const formData = new FormData();
    formData.append("file", file);

    // Get auth token if available
    const token = authService.getToken();
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(
      `${this.baseUrl}/api/batch-score?model_type=${modelType}`,
      {
        method: "POST",
        headers: {
          ...authHeaders,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: "Failed to submit batch job",
      }));
      throw new Error(error.detail);
    }

    return response.json();
  }

  async getBatchJobStatus(jobId: string): Promise<BatchJobStatus> {
    return this.fetch<BatchJobStatus>(`/api/batch-score/${jobId}`);
  }

  async downloadBatchResults(jobId: string): Promise<string> {
    const token = authService.getToken();
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await fetch(
      `${this.baseUrl}/api/batch-score/${jobId}/download`,
      {
        headers: authHeaders,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to download results");
    }

    return response.text();
  }

  // History / Audit Log
  async getHistory(filters: HistoryFilters = {}): Promise<HistoryResponse> {
    const params = new URLSearchParams();
    if (filters.page) params.set("page", String(filters.page));
    if (filters.page_size) params.set("page_size", String(filters.page_size));
    if (filters.risk_band) params.set("risk_band", filters.risk_band);
    if (filters.decision) params.set("decision", filters.decision);

    const query = params.toString();
    return this.fetch<HistoryResponse>(`/api/history${query ? `?${query}` : ""}`);
  }

  // Explainability
  async explain(input: ApplicantInput): Promise<ExplainabilityResponse> {
    return this.fetch<ExplainabilityResponse>("/api/explain", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  // Settings
  async getModelSettings(): Promise<ModelSettings> {
    return this.fetch<ModelSettings>("/api/settings/model");
  }

  async updateModelSettings(modelType: ModelType): Promise<ModelSettings> {
    return this.fetch<ModelSettings>("/api/settings/model", {
      method: "POST",
      body: JSON.stringify({ active_model: modelType }),
    });
  }

  async getThresholdSettings(): Promise<ThresholdSettings> {
    return this.fetch<ThresholdSettings>("/api/settings/thresholds");
  }

  async updateThresholdSettings(settings: ThresholdSettings): Promise<ThresholdSettings> {
    return this.fetch<ThresholdSettings>("/api/settings/thresholds", {
      method: "POST",
      body: JSON.stringify(settings),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
