// API Response Types

export interface PredictionResponse {
  pd: number;
  risk_score: number;
  risk_band: string;
  expected_loss: number;
  decision: string;
  reason_codes: string[];
}

export interface ApplicantInput {
  [key: string]: number | string | boolean;
}

export interface PortfolioSummary {
  total_applications: number;
  approval_rate: number;
  average_pd: number;
  total_expected_loss: number;
  risk_band_distribution: RiskBandDistribution[];
  expected_loss_by_band: ExpectedLossByBand[];
}

export interface RiskBandDistribution {
  risk_band: string;
  count: number;
  percentage: number;
}

export interface ExpectedLossByBand {
  risk_band: string;
  total_loss: number;
}

export interface BatchScoreResponse {
  job_id: string;
  status: string;
  download_url?: string;
  processed_count?: number;
  total_count?: number;
}

export interface HistoryRecord {
  application_id: string;
  timestamp: string;
  risk_band: string;
  decision: string;
  pd: number;
  expected_loss: number;
  risk_score: number;
}

export interface HistoryResponse {
  records: HistoryRecord[];
  total: number;
  page: number;
  page_size: number;
}

export interface ExplainabilityResponse {
  application_id: string;
  reason_codes: string[];
  feature_importance?: FeatureImportance[];
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  value: number | string;
}

export interface ModelSettings {
  active_model: 'logistic' | 'lightgbm';
  model_version?: string;
  last_updated?: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: string;
}

// Filter types
export interface HistoryFilters {
  start_date?: string;
  end_date?: string;
  risk_band?: string;
  decision?: string;
  page?: number;
  page_size?: number;
}
