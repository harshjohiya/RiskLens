"""Explainability: Generate reason codes based on feature values."""
import logging
from typing import List, Dict, Any

from .schemas import ApplicantInput
from .features import get_feature_importance_context

logger = logging.getLogger(__name__)


def generate_reason_codes(
    applicant: ApplicantInput,
    pd: float,
    risk_band: str
) -> List[str]:
    """
    Generate business-readable reason codes based on applicant features.
    
    Does NOT use SHAP. Uses threshold-based rule logic.
    """
    reasons = []
    context = get_feature_importance_context(applicant)
    
    # Delinquency flags
    if context['has_delinquency'] == 1:
        reasons.append("Past delinquency history")
        if context['total_delinquency_months'] > 12:
            reasons.append("Prolonged delinquency record")
    
    # Loan-to-income ratios
    lti = context['loan_to_income']
    if lti > 4:
        reasons.append("High loan-to-income ratio")
    elif lti > 3:
        reasons.append("Elevated loan-to-income ratio")
    
    # Annuity-to-income
    ati = context['annuity_to_income']
    if ati > 0.3:
        reasons.append("High annuity burden")
    elif ati > 0.2:
        reasons.append("Significant annuity obligations")
    
    # Active loans
    if context['num_active_loans'] >= 3:
        reasons.append("Multiple active loans")
    
    # Total outstanding
    if context['total_loans'] >= 5:
        reasons.append("Extensive credit history with multiple creditors")
    
    # Age
    age = context['age_years']
    if age < 25:
        reasons.append("Young credit profile")
    elif age > 60:
        reasons.append("Approaching retirement age")
    
    # Income per person
    ipp = context['income_per_person']
    if ipp < 50000:
        reasons.append("Lower income per household member")
    
    # Risk band specific
    if risk_band == "D":
        reasons.append("High default probability")
    elif risk_band == "C":
        reasons.append("Moderate credit risk factors")
    
    # PD-based flags
    if pd > 0.8:
        reasons.append("Very high default probability")
    elif pd > 0.5:
        reasons.append("Elevated default risk")
    elif pd < 0.1:
        reasons.append("Low default probability")
    
    # Remove duplicates, preserve order
    seen = set()
    unique_reasons = []
    for reason in reasons:
        if reason not in seen:
            unique_reasons.append(reason)
            seen.add(reason)
    
    return unique_reasons


def get_risk_factors(applicant: ApplicantInput) -> List[Dict[str, Any]]:
    """Return detailed risk factors for explainability as a list of feature contributions."""
    context = get_feature_importance_context(applicant)
    
    risk_factors = []
    
    # Loan to income ratio
    lti = context['loan_to_income']
    risk_factors.append({
        'feature': 'Loan-to-Income Ratio',
        'contribution': round(lti, 3),
        'direction': 'positive' if lti > 3 else 'negative'
    })
    
    # Annuity to income ratio
    ati = context['annuity_to_income']
    risk_factors.append({
        'feature': 'Annuity-to-Income Ratio',
        'contribution': round(ati, 3),
        'direction': 'positive' if ati > 0.25 else 'negative'
    })
    
    # Income per household member
    ipp = context['income_per_person']
    risk_factors.append({
        'feature': 'Income per Household Member',
        'contribution': round(ipp, 2),
        'direction': 'negative' if ipp > 75000 else 'positive'
    })
    
    # Active loans
    active = int(context['num_active_loans'])
    risk_factors.append({
        'feature': 'Active Loans',
        'contribution': active,
        'direction': 'positive' if active >= 2 else 'negative'
    })
    
    # Total loans
    total = int(context['total_loans'])
    risk_factors.append({
        'feature': 'Total Credit History',
        'contribution': total,
        'direction': 'positive' if total >= 4 else 'negative'
    })
    
    # Delinquency history
    has_delinq = bool(context['has_delinquency'])
    delinq_months = int(context['total_delinquency_months'])
    risk_factors.append({
        'feature': 'Delinquency History',
        'contribution': delinq_months,
        'direction': 'positive' if has_delinq else 'negative'
    })
    
    # Age
    age = int(context['age_years'])
    risk_factors.append({
        'feature': 'Age',
        'contribution': age,
        'direction': 'positive' if age < 25 or age > 60 else 'negative'
    })
    
    # Employment ratio
    emp_ratio = round(context['employment_ratio'], 3)
    risk_factors.append({
        'feature': 'Employment Ratio',
        'contribution': emp_ratio,
        'direction': 'negative' if emp_ratio > 0.5 else 'positive'
    })
    
    return risk_factors
