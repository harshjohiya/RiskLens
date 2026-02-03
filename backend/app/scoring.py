"""Scoring logic: PD → Score → Band → EL → Decision."""
import numpy as np
import logging
from typing import Tuple, List

from .config import (
    RISK_BAND_A_MIN,
    RISK_BAND_B_MIN,
    RISK_BAND_C_MIN,
    EL_LOSS_RATE,
)

logger = logging.getLogger(__name__)


def pd_to_risk_score(pd: float) -> int:
    """
    Convert PD (Probability of Default) to risk score.
    
    Formula: Score = 600 - 50 * ln(PD / (1 - PD))
    
    Clamps result to [0, 1000].
    """
    if pd <= 0 or pd >= 1:
        # Edge case handling
        if pd <= 0:
            return 1000
        if pd >= 1:
            return 0
    
    try:
        odds = pd / (1 - pd)
        score = 600 - 50 * np.log(odds)
        score = max(0, min(1000, int(score)))
        return score
    except Exception as e:
        logger.error(f"Error computing risk score from PD {pd}: {e}")
        return 600  # Default middle score


def score_to_risk_band(score: int) -> str:
    """Assign risk band based on score."""
    if score >= RISK_BAND_A_MIN:
        return "A"
    elif score >= RISK_BAND_B_MIN:
        return "B"
    elif score >= RISK_BAND_C_MIN:
        return "C"
    else:
        return "D"


def compute_expected_loss(pd: float, credit_amount: float) -> float:
    """
    Compute expected loss.
    
    Formula: EL = PD * LGD * Exposure
    where LGD = 0.45 (Loss Given Default)
    """
    el = pd * EL_LOSS_RATE * credit_amount
    return round(el, 2)


def score_to_decision(risk_band: str) -> str:
    """Convert risk band to lending decision."""
    if risk_band in ["A", "B"]:
        return "Approve"
    elif risk_band == "C":
        return "Manual Review"
    else:  # D
        return "Reject"


def compute_all_scores(
    pd: float,
    credit_amount: float
) -> Tuple[int, str, float, str]:
    """
    Compute all scoring metrics.
    
    Returns:
        (risk_score, risk_band, expected_loss, decision)
    """
    score = pd_to_risk_score(pd)
    band = score_to_risk_band(score)
    el = compute_expected_loss(pd, credit_amount)
    decision = score_to_decision(band)
    
    return score, band, el, decision
