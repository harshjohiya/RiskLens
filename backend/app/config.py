"""Configuration and constants for the backend."""
from pathlib import Path
from enum import Enum

# Paths
PROJECT_ROOT = Path(__file__).parent.parent
MODELS_DIR = PROJECT_ROOT.parent / "models"
DATA_DIR = PROJECT_ROOT.parent / "data"
DB_PATH = PROJECT_ROOT / "history.db"

# Model paths
LOGISTIC_MODEL_PATH = MODELS_DIR / "logistic_pd_model.pkl"
LIGHTGBM_MODEL_PATH = MODELS_DIR / "lightgbm_pd_model.pkl"
IMPUTER_PATH = MODELS_DIR / "imputer.pkl"
FEATURE_COLUMNS_PATH = MODELS_DIR / "feature_columns.pkl"

# Model types
class ModelType(str, Enum):
    LOGISTIC = "logistic"
    LIGHTGBM = "lightgbm"

# Default model
DEFAULT_MODEL = ModelType.LOGISTIC

# Risk band thresholds (score-based)
RISK_BAND_A_MIN = 650
RISK_BAND_B_MIN = 600
RISK_BAND_C_MIN = 550

# Feature engineering constants
INCOME_PER_PERSON_BUCKETS = [0, 25000, 50000, 100000, 200000, 500000, float('inf')]
LOAN_TO_INCOME_BUCKETS = [0, 1, 2, 3, 4, 5, float('inf')]
ANNUITY_TO_INCOME_BUCKETS = [0, 0.1, 0.15, 0.2, 0.25, 0.3, float('inf')]

# EL calculation
EL_LOSS_RATE = 0.45  # Loss Given Default

# Logging
LOG_LEVEL = "INFO"
