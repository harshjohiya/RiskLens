"""Batch scoring endpoint."""
from fastapi import APIRouter, File, UploadFile, HTTPException, Query, Depends, status
import pandas as pd
import io
import logging
import uuid
from pathlib import Path
from datetime import datetime

from ..schemas import BatchScoreRequest, BatchScoreResponse
from ..model_loader import load_model
from ..features import prepare_for_prediction
from ..scoring import compute_all_scores
from ..explain import generate_reason_codes
from ..schemas import ApplicantInput
from ..config import DATA_DIR
from ..auth_utils import get_current_user_id
from ..storage import store_batch_job, get_batch_job

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/batch-score", tags=["batch"])


@router.post("", response_model=BatchScoreResponse)
async def batch_score(
    file: UploadFile = File(...),
    model_type: str = Query("logistic", pattern="^(logistic|lightgbm)$"),
    user_id: str = Depends(get_current_user_id)
) -> BatchScoreResponse:
    """
    Score multiple applicants from CSV file.
    
    CSV must have columns matching ApplicantInput fields.
    Returns results as downloadable CSV.
    """
    try:
        # Read CSV
        content = await file.read()
        df = pd.read_csv(io.BytesIO(content))
        
        logger.info(f"Batch scoring {len(df)} records with {model_type} model")
        
        # Load model once
        model = load_model(model_type)
        
        # Add result columns
        results = []
        failed = 0
        
        for idx, row in df.iterrows():
            try:
                # Convert row to ApplicantInput
                applicant = ApplicantInput(
                    age_years=int(row['age_years']),
                    income_total=float(row['income_total']),
                    credit_amount=float(row['credit_amount']),
                    annuity=float(row['annuity']),
                    family_members=int(row['family_members']),
                    num_active_loans=int(row['num_active_loans']),
                    num_closed_loans=int(row['num_closed_loans']),
                    num_bureau_loans=int(row['num_bureau_loans']),
                    max_delinquency=int(row['max_delinquency']),
                    total_delinquency_months=int(row['total_delinquency_months']),
                    model_type=model_type,
                )
                
                # Prepare features
                X = prepare_for_prediction(applicant)
                
                # Get PD
                if model_type == "logistic":
                    pd = float(model.predict_proba(X)[0][1])
                else:  # lightgbm
                    pd = float(model.predict_proba(X)[0][1])
                
                pd = max(0.001, min(0.999, pd))
                
                # Compute scores
                score, band, el, decision = compute_all_scores(pd, applicant.credit_amount)
                
                # Generate reasons
                reasons = generate_reason_codes(applicant, pd, band)
                
                results.append({
                    **row.to_dict(),
                    'pd': round(pd, 4),
                    'risk_score': score,
                    'risk_band': band,
                    'expected_loss': el,
                    'decision': decision,
                    'reason_codes': ' | '.join(reasons),
                })
                
            except Exception as e:
                logger.warning(f"Failed to score row {idx}: {e}")
                failed += 1
                results.append({
                    **row.to_dict(),
                    'error': str(e),
                })
        
        # Save results
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        job_id = str(uuid.uuid4())
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_file = DATA_DIR / f"batch_{job_id}_{timestamp}.csv"
        
        result_df = pd.DataFrame(results)
        result_df.to_csv(output_file, index=False)
        
        successful = len(results) - failed
        
        # Store batch job record
        try:
            store_batch_job(
                user_id=user_id,
                job_id=job_id,
                filename=file.filename,
                model_type=model_type,
                total_records=len(df),
                successful_records=successful,
                failed_records=failed,
                result_file=str(output_file),
            )
        except Exception as e:
            logger.warning(f"Failed to store batch job: {e}")
        
        logger.info(f"Batch scoring complete for user {user_id}: {successful} successful, {failed} failed")
        
        return BatchScoreResponse(
            total_records=len(df),
            successful_records=successful,
            failed_records=failed,
            file_path=str(output_file),
            message=f"Scored {successful}/{len(df)} applicants successfully",
        )
        
    except Exception as e:
        logger.error(f"Batch scoring failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch scoring failed: {str(e)}")


@router.get("/{job_id}", response_model=dict)
async def get_batch_status(
    job_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """
    Get batch job status and results.
    
    Returns 403 if job doesn't belong to the authenticated user.
    """
    job = get_batch_job(job_id, user_id)
    
    if not job:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Batch job not found or access denied"
        )
    
    return job
