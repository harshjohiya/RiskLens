"""Explainability endpoints."""
from fastapi import APIRouter, HTTPException
import logging

from ..schemas import ExplainabilityResponse, ApplicantInput
from ..explain import generate_reason_codes, get_risk_factors

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/explain", tags=["explainability"])


@router.post("", response_model=ExplainabilityResponse)
async def explain_prediction(
    applicant: ApplicantInput
) -> ExplainabilityResponse:
    """
    Get explainability for a prediction.
    
    Returns reason codes and risk factors.
    Does NOT require prior prediction - generates fresh explanations.
    """
    try:
        # Generate reason codes (pd and risk_band are for context, use defaults)
        reasons = generate_reason_codes(applicant, pd=0.5, risk_band="C")
        
        # Get risk factors
        risk_factors = get_risk_factors(applicant)
        
        response = ExplainabilityResponse(
            application_id="new",
            reason_codes=reasons,
            risk_factors=risk_factors,
        )
        
        logger.info("Generated explanations")
        return response
        
    except Exception as e:
        logger.error(f"Explainability generation failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to generate explanations")
