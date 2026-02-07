"""FastAPI application entry point."""
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import LOG_LEVEL
from .model_loader import validate_models, test_models
from .storage import init_database
from .schemas import HealthResponse
from .routes import predict, batch, dashboard, history, explain, settings, auth

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="RiskLens Backend API",
    description="Credit risk scoring inference service",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware (allow frontend on localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:8083",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:8083",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include auth router (no prefix - /auth/login, /auth/signup)
app.include_router(auth.router, prefix="/auth")

# Include routers with /api prefix
app.include_router(predict.router, prefix="/api")
app.include_router(batch.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(explain.router, prefix="/api")
app.include_router(settings.router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    """Initialize on startup."""
    logger.info("Starting up RiskLens Backend...")
    
    # Validate model files exist
    if not validate_models():
        logger.error("Model validation failed!")
        raise RuntimeError("Required model files not found")
    
    # Initialize database
    try:
        init_database()
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise
    
    # Test models can be loaded
    if not test_models():
        logger.error("Model loading test failed!")
        raise RuntimeError("Failed to load models")
    
    logger.info("Startup complete")


@app.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check() -> HealthResponse:
    """Health check endpoint."""
    models_ok = test_models()
    
    if not models_ok:
        raise HTTPException(status_code=503, detail="Models not available")
    
    return HealthResponse(
        status="healthy",
        models_loaded=True,
        message="RiskLens Backend operational",
    )


@app.get("/", tags=["root"])
async def root():
    """Root endpoint with API information."""
    return {
        "service": "RiskLens Backend API",
        "version": "1.0.0",
        "docs_url": "/docs",
        "health_url": "/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
