import {
  PredictionResponse,
  ApplicantInput,
  PortfolioSummary,
  BatchScoreResponse,
  HistoryResponse,
  HistoryFilters,
  ExplainabilityResponse,
  ModelSettings,
  ApiError,
} from '@/types/api';

// Configure your backend base URL here
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class ApiService {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          message: 'An error occurred',
        }));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  // Single Applicant Scoring
  async predictSingleApplicant(data: ApplicantInput): Promise<PredictionResponse> {
    return this.request<PredictionResponse>('/predict', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Portfolio Dashboard
  async getPortfolioSummary(): Promise<PortfolioSummary> {
    return this.request<PortfolioSummary>('/portfolio/summary');
  }

  // Batch Scoring
  async uploadBatchFile(file: File): Promise<BatchScoreResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return fetch(`${API_BASE_URL}/batch-score`, {
      method: 'POST',
      body: formData,
    })
      .then(async (response) => {
        if (!response.ok) {
          const error: ApiError = await response.json().catch(() => ({
            message: 'Batch scoring failed',
          }));
          throw new Error(error.message);
        }
        return response.json();
      });
  }

  async getBatchScoreStatus(jobId: string): Promise<BatchScoreResponse> {
    return this.request<BatchScoreResponse>(`/batch-score/${jobId}`);
  }

  async downloadBatchResults(downloadUrl: string): Promise<Blob> {
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error('Failed to download results');
    }
    return response.blob();
  }

  // History & Logs
  async getHistory(filters?: HistoryFilters): Promise<HistoryResponse> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, String(value));
        }
      });
    }
    
    const queryString = params.toString();
    const endpoint = queryString ? `/history?${queryString}` : '/history';
    
    return this.request<HistoryResponse>(endpoint);
  }

  // Explainability
  async getExplanation(applicationId: string): Promise<ExplainabilityResponse> {
    return this.request<ExplainabilityResponse>(`/explain/${applicationId}`);
  }

  // Settings
  async getModelSettings(): Promise<ModelSettings> {
    return this.request<ModelSettings>('/settings/model');
  }

  async updateModelSettings(settings: Partial<ModelSettings>): Promise<ModelSettings> {
    return this.request<ModelSettings>('/settings/model', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }
}

export const apiService = new ApiService();
