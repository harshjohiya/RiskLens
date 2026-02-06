"""History and audit logs endpoints."""
from fastapi import APIRouter, Query, Depends
import logging
from typing import Optional

from ..schemas import HistoryResponse, HistoryRecord
from ..storage import get_history
from ..auth_utils import get_current_user_id

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/history", tags=["history"])


@router.get("", response_model=HistoryResponse)
async def get_scoring_history(
    user_id: str = Depends(get_current_user_id),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    risk_band: Optional[str] = Query(None, pattern="^[A-D]$"),
    decision: Optional[str] = Query(None, pattern="^(Approve|Manual Review|Reject)$"),
) -> HistoryResponse:
    """
    Get paginated scoring history.
    
    Supports optional filtering by risk band or decision.
    """
    try:
        records, total = get_history(
            user_id=user_id,
            page=page,
            page_size=page_size,
            risk_band=risk_band,
            decision=decision,
        )
        
        history_records = [
            HistoryRecord(
                application_id=r['id'],
                timestamp=r['timestamp'],
                risk_band=r['prediction']['risk_band'],
                decision=r['prediction']['decision'],
                pd=r['prediction']['pd'],
                risk_score=r['prediction']['risk_score'],
                expected_loss=r['prediction']['expected_loss'],
            )
            for r in records
        ]
        
        response = HistoryResponse(
            records=history_records,
            total=total,
            page=page,
            page_size=page_size,
        )
        
        logger.info(f"Retrieved history page {page}")
        return response
        
    except Exception as e:
        logger.error(f"Failed to retrieve history: {e}", exc_info=True)
        raise
