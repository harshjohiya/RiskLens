// RiskLens API Types - Strongly typed for all backend interactions

export type ModelType = "logistic" | "lightgbm";

export type RiskBand = "A" | "B" | "C" | "D";

export type Decision = "Approve" | "Reject" | "Manual Review";

export type BatchJobStatus = "pending" | "processing" | "completed" | "failed";

// Single Applicant Scoring
export interface ApplicantInput {
  age_years: number;
  income_total: number;
  credit_amount: number;
  annuity: number;
  family_members: number;
  num_active_loans: number;
  num_closed_loans: number;
  num_bureau_loans: number;
  max_delinquency: number;
  total_delinquency_months: number;
  model_type: ModelType;
}

export interface PredictionResponse {
  application_id: string;
  pd: number;
  risk_score: number;
  risk_band: RiskBand;
  expected_loss: number;
  decision: Decision;
  reason_codes: string[];
  timestamp: string;
}

// Portfolio Dashboard
export interface RiskBandDistribution {
  band: RiskBand;
  count: number;
  percentage: number;
}

export interface ExpectedLossByBand {
  band: RiskBand;
  expected_loss: number;
}

export interface PortfolioSummary {
  total_applications: number;
  approval_rate: number;
  average_pd: number;
  total_expected_loss: number;
  risk_band_distribution: RiskBandDistribution[];
  expected_loss_by_band: ExpectedLossByBand[];
}

// Batch Scoring
export interface BatchScoreRequest {
  file: File;
  model_type: ModelType;
}

export interface BatchScoreResponse {
  job_id: string;
  status: BatchJobStatus;
  total_records?: number;
  processed_records?: number;
  error_message?: string;
  download_url?: string;
  created_at: string;
  completed_at?: string;
}

// History / Audit Log
export interface HistoryRecord {
  application_id: string;
  timestamp: string;
  risk_band: RiskBand;
  decision: Decision;
  pd: number;
  risk_score: number;
  expected_loss: number;
}

export interface HistoryResponse {
  records: HistoryRecord[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface HistoryFilters {
  page?: number;
  page_size?: number;
  risk_band?: RiskBand | "";
  decision?: Decision | "";
}

// Explainability
export interface RiskFactor {
  feature: string;
  contribution: number;
  direction: "positive" | "negative";
}

export interface ExplainabilityResponse {
  application_id: string;
  reason_codes: string[];
  risk_factors: RiskFactor[];
}

// Settings
export interface ModelSettings {
  active_model: ModelType;
  available_models: ModelType[];
  last_updated: string;
}

// Health Check
export interface HealthStatus {
  status: "healthy" | "unhealthy";
  database: "connected" | "disconnected";
  model_service: "available" | "unavailable";
  timestamp: string;
}

// API Error Response
export interface ApiError {
  detail: string;
  status_code: number;
}
