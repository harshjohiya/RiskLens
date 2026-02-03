"""Pydantic models for request/response validation."""
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import List, Optional
from datetime import datetime


class ApplicantInput(BaseModel):
    """Single applicant scoring request."""
    model_config = ConfigDict(protected_namespaces=())
    
    age_years: int = Field(..., ge=18, le=100)
    income_total: float = Field(..., gt=0)
    credit_amount: float = Field(..., gt=0)
    annuity: float = Field(..., ge=0)
    family_members: int = Field(..., ge=1)
    num_active_loans: int = Field(..., ge=0)
    num_closed_loans: int = Field(..., ge=0)
    num_bureau_loans: int = Field(..., ge=0)
    max_delinquency: int = Field(..., ge=0)
    total_delinquency_months: int = Field(..., ge=0)
    model_type: Optional[str] = "logistic"

    @field_validator('model_type')
    @classmethod
    def validate_model_type(cls, v):
        if v not in ['logistic', 'lightgbm']:
            raise ValueError('model_type must be "logistic" or "lightgbm"')
        return v


class PredictionResponse(BaseModel):
    """Single prediction response."""
    pd: float = Field(..., ge=0, le=1)
    risk_score: int = Field(..., ge=0, le=1000)
    risk_band: str = Field(..., pattern=r"^[A-D]$")
    expected_loss: float = Field(..., ge=0)
    decision: str = Field(...)
    reason_codes: List[str] = Field(default_factory=list)


class BatchScoreRequest(BaseModel):
    """Batch scoring request."""
    model_type: Optional[str] = "logistic"


class BatchScoreResponse(BaseModel):
    """Batch scoring response."""
    total_records: int
    successful_records: int
    failed_records: int
    file_path: str
    message: str


class PortfolioSummary(BaseModel):
    """Portfolio dashboard summary."""
    total_applications: int
    approval_rate: float
    average_pd: float
    total_expected_loss: float
    risk_band_distribution: List[dict]
    expected_loss_by_band: List[dict]


class HistoryRecord(BaseModel):
    """Single history record."""
    model_config = ConfigDict(protected_namespaces=())
    
    id: str
    timestamp: datetime
    applicant_data: dict
    prediction: dict
    model_used: str


class HistoryResponse(BaseModel):
    """History list response."""
    records: List[HistoryRecord]
    total: int
    page: int
    page_size: int


class ExplainabilityResponse(BaseModel):
    """Explainability response."""
    application_id: str
    reason_codes: List[str]
    risk_factors: dict


class ModelSettingsRequest(BaseModel):
    """Model settings request."""
    model_config = ConfigDict(protected_namespaces=())
    
    model_type: str = Field(..., pattern=r"^(logistic|lightgbm)$")


class ModelSettings(BaseModel):
    """Model settings response."""
    current_model: str
    available_models: List[str]


class HealthResponse(BaseModel):
    """Health check response."""
    status: str
    models_loaded: bool
    message: str
