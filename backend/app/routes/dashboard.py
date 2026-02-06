"""Portfolio dashboard endpoint."""
from fastapi import APIRouter, Depends
import logging

from ..schemas import PortfolioSummary
from ..storage import get_portfolio_stats
from ..auth_utils import get_current_user_id

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("/summary", response_model=PortfolioSummary)
async def get_portfolio_summary(user_id: str = Depends(get_current_user_id)) -> PortfolioSummary:
    """
    Get portfolio summary statistics.
    
    Returns aggregated metrics from all scored applicants.
    """
    try:
        stats = get_portfolio_stats(user_id)
        
        summary = PortfolioSummary(
            total_applications=stats['total_applications'],
            approval_rate=stats['approval_rate'],
            average_pd=stats['average_pd'],
            total_expected_loss=stats['total_expected_loss'],
            risk_band_distribution=stats['risk_band_distribution'],
            expected_loss_by_band=stats['expected_loss_by_band'],
        )
        
        logger.info("Portfolio summary retrieved")
        return summary
        
    except Exception as e:
        logger.error(f"Failed to retrieve portfolio summary: {e}", exc_info=True)
        raise
