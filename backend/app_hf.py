"""
Entry point for Hugging Face Spaces deployment.
This file starts the FastAPI application using uvicorn.
"""
from app.main import app
import uvicorn
import os

if __name__ == "__main__":
    port = int(os.getenv("PORT", 7860))  # HF Spaces default port is 7860
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        log_level="info",
        reload=False
    )
