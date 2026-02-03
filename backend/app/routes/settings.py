"""Model settings endpoints."""
from fastapi import APIRouter
import logging

from ..schemas import ModelSettings, ModelSettingsRequest
from ..config import ModelType, DEFAULT_MODEL

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/settings", tags=["settings"])

# Global settings
_current_model = DEFAULT_MODEL


@router.get("/model", response_model=ModelSettings)
async def get_model_settings() -> ModelSettings:
    """Get current model settings."""
    return ModelSettings(
        current_model=_current_model,
        available_models=[ModelType.LOGISTIC, ModelType.LIGHTGBM],
    )


@router.post("/model", response_model=ModelSettings)
async def set_model_settings(request: ModelSettingsRequest) -> ModelSettings:
    """Set active model for predictions."""
    global _current_model
    
    if request.model_type not in [ModelType.LOGISTIC, ModelType.LIGHTGBM]:
        raise ValueError(f"Invalid model type: {request.model_type}")
    
    _current_model = request.model_type
    logger.info(f"Switched to {request.model_type} model")
    
    return ModelSettings(
        current_model=_current_model,
        available_models=[ModelType.LOGISTIC, ModelType.LIGHTGBM],
    )
