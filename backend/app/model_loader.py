"""Lazy model loader for ML artifacts."""
import joblib
import logging
from pathlib import Path
from typing import Optional, Dict, Any

from .config import (
    LOGISTIC_MODEL_PATH,
    LIGHTGBM_MODEL_PATH,
    IMPUTER_PATH,
    FEATURE_COLUMNS_PATH,
    ModelType,
)

logger = logging.getLogger(__name__)

# Global model cache
_model_cache: Dict[str, Any] = {}
_feature_columns: Optional[list] = None
_imputer: Optional[Any] = None


def load_model(model_type: str) -> Any:
    """Load a trained model from disk (lazy loading)."""
    if model_type in _model_cache:
        return _model_cache[model_type]

    if model_type == ModelType.LOGISTIC:
        model_path = LOGISTIC_MODEL_PATH
    elif model_type == ModelType.LIGHTGBM:
        model_path = LIGHTGBM_MODEL_PATH
    else:
        raise ValueError(f"Unknown model type: {model_type}")

    if not model_path.exists():
        raise FileNotFoundError(f"Model file not found: {model_path}")

    try:
        model = joblib.load(model_path)
        _model_cache[model_type] = model
        logger.info(f"Loaded {model_type} model from {model_path}")
        return model
    except Exception as e:
        logger.error(f"Failed to load model {model_type}: {e}")
        raise


def get_feature_columns() -> list:
    """Load and cache feature column order."""
    global _feature_columns

    if _feature_columns is not None:
        return _feature_columns

    if not FEATURE_COLUMNS_PATH.exists():
        raise FileNotFoundError(f"Feature columns file not found: {FEATURE_COLUMNS_PATH}")

    try:
        _feature_columns = joblib.load(FEATURE_COLUMNS_PATH)
        logger.info(f"Loaded feature columns: {len(_feature_columns)} features")
        return _feature_columns
    except Exception as e:
        logger.error(f"Failed to load feature columns: {e}")
        raise


def get_imputer() -> Any:
    """Load and cache the imputer."""
    global _imputer

    if _imputer is not None:
        return _imputer

    if not IMPUTER_PATH.exists():
        raise FileNotFoundError(f"Imputer file not found: {IMPUTER_PATH}")

    try:
        _imputer = joblib.load(IMPUTER_PATH)
        logger.info("Loaded imputer")
        return _imputer
    except Exception as e:
        logger.error(f"Failed to load imputer: {e}")
        raise


def validate_models() -> bool:
    """Validate that all required models exist."""
    required_files = [
        LOGISTIC_MODEL_PATH,
        LIGHTGBM_MODEL_PATH,
        IMPUTER_PATH,
        FEATURE_COLUMNS_PATH,
    ]

    missing = [f for f in required_files if not f.exists()]

    if missing:
        logger.error(f"Missing model files: {missing}")
        return False

    logger.info("All model files present")
    return True


def test_models() -> bool:
    """Test that models can be loaded."""
    try:
        load_model(ModelType.LOGISTIC)
        load_model(ModelType.LIGHTGBM)
        get_feature_columns()
        get_imputer()
        logger.info("All models loaded successfully")
        return True
    except Exception as e:
        logger.error(f"Model loading test failed: {e}")
        return False
