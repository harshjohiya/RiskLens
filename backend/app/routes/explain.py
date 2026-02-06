"""Explainability endpoints."""
from fastapi import APIRouter, HTTPException, Depends, status
import logging

from ..schemas import ExplainabilityResponse, ApplicantInput
from ..explain import generate_reason_codes, get_risk_factors
from ..auth_utils import get_current_user_id
from ..storage import get_prediction_by_id

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/explain", tags=["explainability"])


@router.post("", response_model=ExplainabilityResponse)
async def explain_prediction(
    applicant: ApplicantInput,
    user_id: str = Depends(get_current_user_id)
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


@router.get("/{application_id}", response_model=ExplainabilityResponse)
async def explain_by_id(
    application_id: str,
    user_id: str = Depends(get_current_user_id)
) -> ExplainabilityResponse:
    """
    Get explainability for a previous prediction by application ID.
    
    Returns 403 if the application doesn't belong to the authenticated user.
    """
    # Get prediction from storage (filtered by user_id)
    record = get_prediction_by_id(application_id, user_id)
    
    if not record:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Application not found or access denied"
        )
    
    # Reconstruct applicant input
    applicant_data = record['applicant_data']
    prediction_data = record['prediction']
    
    # Generate fresh explanations
    from ..schemas import ApplicantInput
    applicant = ApplicantInput(**applicant_data)
    reasons = generate_reason_codes(
        applicant,
        pd=prediction_data['pd'],
        risk_band=prediction_data['risk_band']
    )
    risk_factors = get_risk_factors(applicant)
    
    return ExplainabilityResponse(
        application_id=application_id,
        reason_codes=reasons,
        risk_factors=risk_factors,
    )

