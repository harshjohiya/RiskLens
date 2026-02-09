---
title: RiskLens Backend API
emoji: 🎯
colorFrom: blue
colorTo: purple
sdk: docker
pinned: false
license: mit
app_port: 7860
---

# RiskLens Backend API

Credit risk scoring inference service powered by machine learning models.

## Features

- 🎯 Credit risk scoring with multiple models (Logistic Regression, LightGBM)
- 📊 Batch processing for multiple applicants
- 📈 Portfolio analytics and risk distribution
- 🔍 Model explainability (SHAP values)
- 📝 Historical scoring logs
- 🔐 JWT-based authentication
- ⚙️ Configurable model settings

## API Documentation

Once deployed, visit:
- Swagger UI: `https://your-space-name.hf.space/docs`
- ReDoc: `https://your-space-name.hf.space/redoc`

## Setup

1. Upload your trained models to the `models/` directory:
   - `logistic_pd_model.pkl`
   - `lightgbm_pd_model.pkl`
   - `imputer.pkl`
   - `feature_columns.pkl`

2. Configure environment variables in Space settings:
   - `JWT_SECRET_KEY`: Secret key for JWT token generation

## Endpoints

- `GET /health` - Health check
- `POST /auth/signup` - User registration
- `POST /auth/login` - User authentication
- `POST /api/predict` - Single prediction
- `POST /api/batch/score` - Batch scoring
- `GET /api/batch/status/{job_id}` - Check batch status
- `GET /api/dashboard/summary` - Portfolio summary
- `GET /api/history` - Scoring history
- `POST /api/explain` - Model explainability
- `GET /api/settings` - Get model settings
- `PUT /api/settings` - Update model settings

## Local Development

```bash
cd backend
pip install -r requirements.txt
python app_hf.py
```

## Technology Stack

- FastAPI - Web framework
- LightGBM - Gradient boosting model
- Scikit-learn - Machine learning utilities
- Pandas - Data manipulation
- SQLite - History storage
