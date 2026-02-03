"""Single applicant prediction endpoint."""
from fastapi import APIRouter, HTTPException
import logging

from ..schemas import ApplicantInput, PredictionResponse
from ..model_loader import load_model
from ..features import prepare_for_prediction
from ..scoring import compute_all_scores
from ..explain import generate_reason_codes
from ..storage import store_prediction

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/predict", tags=["prediction"])


@router.post("", response_model=PredictionResponse)
async def predict_single_applicant(applicant: ApplicantInput) -> PredictionResponse:
    """
    Score a single applicant.
    
    Returns PD, risk score, risk band, expected loss, and reason codes.
    """
    try:
        # Load model
        model = load_model(applicant.model_type)
        
        # Prepare features
        X = prepare_for_prediction(applicant)
        
        # Get PD prediction
        if applicant.model_type == "logistic":
            pd = float(model.predict_proba(X)[0][1])
        else:  # lightgbm
            pd = float(model.predict_proba(X)[0][1])
        
        # Ensure PD is valid
        pd = max(0.001, min(0.999, pd))
        
        # Compute scores
        score, band, el, decision = compute_all_scores(pd, applicant.credit_amount)
        
        # Generate explanations
        reasons = generate_reason_codes(applicant, pd, band)
        
        # Create response
        response = PredictionResponse(
            pd=round(pd, 4),
            risk_score=score,
            risk_band=band,
            expected_loss=el,
            decision=decision,
            reason_codes=reasons,
        )
        
        # Store in history
        try:
            store_prediction(
                applicant_input=applicant.dict(),
                prediction=response.dict(),
                model_used=applicant.model_type,
            )
        except Exception as e:
            logger.warning(f"Failed to store prediction: {e}")
        
        logger.info(f"Predicted {applicant.model_type} - PD: {pd:.3f}, Band: {band}, Decision: {decision}")
        
        return response
        
    except FileNotFoundError as e:
        logger.error(f"Model file not found: {e}")
        raise HTTPException(status_code=503, detail="Model files not available")
    except Exception as e:
        logger.error(f"Prediction failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
