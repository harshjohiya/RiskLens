# RiskLens Backend API

Production-grade FastAPI backend for credit risk scoring inference.

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Verify Models

Ensure models exist in `../models/`:
- `logistic_pd_model.pkl`
- `lightgbm_pd_model.pkl`
- `imputer.pkl`
- `feature_columns.pkl`

### 3. Run Server

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Visit: **http://localhost:8000/docs** for interactive API documentation

## Architecture

```
backend/
├── app/
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration & constants
│   ├── schemas.py           # Pydantic models
│   ├── model_loader.py      # Lazy model loading
│   ├── features.py          # Feature engineering
│   ├── scoring.py           # PD → Score → Band → EL
│   ├── explain.py           # Reason codes
│   ├── storage.py           # SQLite history
│   └── routes/
│       ├── predict.py       # Single prediction
│       ├── batch.py         # Batch scoring
│       ├── dashboard.py     # Portfolio summary
│       ├── history.py       # Audit logs
│       ├── explain.py       # Explainability
│       └── settings.py      # Model settings
├── requirements.txt
└── README.md
```

## API Endpoints

### Health Check
```
GET /health
```

### Single Applicant Scoring
```
POST /predict

{
  "age_years": 35,
  "income_total": 500000,
  "credit_amount": 1200000,
  "annuity": 45000,
  "family_members": 4,
  "num_active_loans": 2,
  "num_closed_loans": 3,
  "num_bureau_loans": 5,
  "max_delinquency": 1,
  "total_delinquency_months": 2,
  "model_type": "logistic"
}
```

### Batch Scoring
```
POST /batch-score?model_type=logistic
Content-Type: multipart/form-data
```

### Portfolio Summary
```
GET /portfolio/summary
```

### History
```
GET /history?page=1&page_size=20
```

### Explainability
```
POST /explain
```

### Model Settings
```
GET /settings/model
POST /settings/model
```

## Features

- ✅ Real ML inference (no mock data)
- ✅ Production-ready feature engineering
- ✅ Type-safe Pydantic models
- ✅ SQLite audit trail
- ✅ CORS enabled for frontend
- ✅ Comprehensive logging
- ✅ Interactive API docs at /docs

## Scoring Logic

**PD to Score:**
```
Score = 600 - 50 * ln(PD / (1 - PD))
```

**Risk Bands:**
- A: ≥650 (Approve)
- B: 600-649 (Approve)
- C: 550-599 (Manual Review)
- D: <550 (Reject)

**Expected Loss:**
```
EL = PD × 0.45 × Credit_Amount
```

## Testing

Visit **http://localhost:8000/docs** to test all endpoints via Swagger UI.
