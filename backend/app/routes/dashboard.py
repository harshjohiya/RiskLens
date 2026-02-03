"""Portfolio dashboard endpoint."""
from fastapi import APIRouter
import logging

from ..schemas import PortfolioSummary
from ..storage import get_portfolio_stats

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/portfolio", tags=["portfolio"])


@router.get("/summary", response_model=PortfolioSummary)
async def get_portfolio_summary() -> PortfolioSummary:
    """
    Get portfolio summary statistics.
    
    Returns aggregated metrics from all scored applicants.
    """
    try:
        stats = get_portfolio_stats()
        
        summary = PortfolioSummary(
            total_applications=stats['total_applications'],
            approval_rate=stats['approval_rate'],
            average_pd=stats['average_pd'],
            total_expected_loss=stats['total_expected_loss'],
            risk_band_distribution=stats['risk_band_distribution'],
        )
        
        logger.info("Portfolio summary retrieved")
        return summary
        
    except Exception as e:
        logger.error(f"Failed to retrieve portfolio summary: {e}", exc_info=True)
        raise
