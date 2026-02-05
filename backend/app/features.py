"""Feature engineering for applicant data."""
import numpy as np
import pandas as pd
import logging
from typing import Dict, Any

from .config import (
    INCOME_PER_PERSON_BUCKETS,
    LOAN_TO_INCOME_BUCKETS,
    ANNUITY_TO_INCOME_BUCKETS,
)
from .model_loader import get_feature_columns, get_imputer
from .schemas import ApplicantInput

logger = logging.getLogger(__name__)


def engineer_features(applicant: ApplicantInput) -> Dict[str, Any]:
    """
    Engineer features from raw applicant input.
    
    Recomputes all derived features exactly as done during training.
    Must align with feature_columns.pkl order.
    """
    
    # Base features - match model's expected column names
    features = {
        'AMT_INCOME_TOTAL': applicant.income_total,
        'AMT_CREDIT': applicant.credit_amount,
        'AMT_ANNUITY': applicant.annuity,
        'CNT_FAM_MEMBERS': applicant.family_members,
        'age_years': applicant.age_years,
        'num_active_loans': applicant.num_active_loans,
        'num_closed_loans': applicant.num_closed_loans,
        'num_bureau_loans': applicant.num_bureau_loans,
        'max_delinquency': applicant.max_delinquency,
        'total_delinquency_months': applicant.total_delinquency_months,
    }
    
    # Derived features (same as training)
    income = applicant.income_total
    credit = applicant.credit_amount
    family = max(applicant.family_members, 1)  # Avoid division by zero
    
    features['income_per_person'] = income / family
    features['loan_to_income'] = credit / income if income > 0 else 0
    features['annuity_to_income'] = applicant.annuity / income if income > 0 else 0
    features['employment_ratio'] = income / max(credit, 1)  # Income to credit ratio
    
    # Credit exposure features
    total_loans = applicant.num_active_loans + applicant.num_closed_loans
    features['total_credit_exposure'] = credit * max(total_loans, 1)
    features['total_credit_debt'] = credit + applicant.annuity
    
    # Loan to income buckets - one-hot encoded
    loan_to_income_ratio = features['loan_to_income']
    features['loan_to_income_bucket_(1.818, 2.764]'] = 1 if 1.818 < loan_to_income_ratio <= 2.764 else 0
    features['loan_to_income_bucket_(2.764, 3.906]'] = 1 if 2.764 < loan_to_income_ratio <= 3.906 else 0
    features['loan_to_income_bucket_(3.906, 5.769]'] = 1 if 3.906 < loan_to_income_ratio <= 5.769 else 0
    features['loan_to_income_bucket_(5.769, 84.737]'] = 1 if 5.769 < loan_to_income_ratio <= 84.737 else 0
    
    return features


def prepare_for_prediction(applicant: ApplicantInput) -> np.ndarray:
    """
    Prepare applicant data for model prediction.
    
    1. Engineer features
    2. Create DataFrame with correct column order
    3. Apply imputer
    4. Return as numpy array
    """
    
    # Engineer features
    features_dict = engineer_features(applicant)
    
    # Create DataFrame
    df = pd.DataFrame([features_dict])
    
    # Get expected feature columns
    feature_columns = get_feature_columns()
    
    # Reorder and subset to match training
    df = df[feature_columns]
    
    # Apply imputer (handles any missing values)
    imputer = get_imputer()
    df_imputed = imputer.transform(df)
    
    logger.debug(f"Prepared features shape: {df_imputed.shape}")
    
    return df_imputed


def get_feature_importance_context(applicant: ApplicantInput) -> Dict[str, float]:
    """
    Get context on feature values for explainability.
    
    Returns values that influenced the prediction for reason code generation.
    """
    features = engineer_features(applicant)
    
    # Calculate derived values for reason code generation
    total_loans = applicant.num_active_loans + applicant.num_closed_loans + applicant.num_bureau_loans
    has_delinquency = 1 if applicant.max_delinquency > 0 else 0
    
    return {
        'loan_to_income': features['loan_to_income'],
        'annuity_to_income': features['annuity_to_income'],
        'income_per_person': features['income_per_person'],
        'num_active_loans': features['num_active_loans'],
        'has_delinquency': has_delinquency,
        'total_delinquency_months': features['total_delinquency_months'],
        'age_years': features['age_years'],
        'total_loans': total_loans,
        'employment_ratio': features['employment_ratio'],
        'max_delinquency': features['max_delinquency'],
    }
