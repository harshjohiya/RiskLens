# RiskLens - Credit Risk Assessment Platform

Full-stack credit risk scoring application with machine learning backend and React frontend.

## 🎯 Features

- **Single Applicant Scoring** - Real-time credit risk assessment
- **Batch Processing** - Bulk CSV file scoring
- **Portfolio Dashboard** - Risk analytics and visualization
- **History & Audit Log** - Track all predictions
- **Explainability** - Understand risk factors
- **Model Management** - Switch between Logistic Regression and LightGBM

## 🏗️ Architecture

- **Backend**: FastAPI + scikit-learn + LightGBM
- **Frontend**: React + TypeScript + Vite + TailwindCSS + shadcn/ui
- **Database**: SQLite (for history)
- **API**: RESTful with OpenAPI docs

## 📁 Project Structure

```
risk lens/
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── main.py           # Main app entry
│   │   ├── routes/           # API endpoints
│   │   ├── config.py         # Configuration
│   │   ├── schemas.py        # Pydantic models
│   │   ├── model_loader.py   # ML model management
│   │   ├── scoring.py        # Scoring logic
│   │   ├── explain.py        # Explainability
│   │   ├── features.py       # Feature engineering
│   │   └── storage.py        # Database operations
│   ├── requirements.txt
│   └── venv/                 # Python virtual environment
├── frontend/          # React application
│   ├── src/
│   │   ├── pages/            # Page components
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/
│   │   │   └── api.ts        # API client
│   │   └── types/            # TypeScript types
│   ├── package.json
│   └── .env                  # Environment variables
├── models/            # Trained ML models
│   ├── logistic_pd_model.pkl
│   ├── lightgbm_pd_model.pkl
│   ├── imputer.pkl
│   └── feature_columns.pkl
├── data/              # Processed data
├── dataset/           # Training datasets
└── notebook/          # Jupyter notebooks

```

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm or bun

### Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows PowerShell)
.\venv\Scripts\Activate.ps1

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will run at: **http://localhost:8000**
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run at: **http://localhost:8080**

## 🔧 Configuration

### Backend

Create `.env` file in project root (optional):

```env
MODEL_PATH=../models
LOG_LEVEL=INFO
```

### Frontend

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

## 📊 API Endpoints

### Core Features

- `GET /health` - Health check
- `POST /api/predict` - Single applicant scoring
- `POST /api/explain` - Explainability
- `POST /api/batch-score` - Submit batch job
- `GET /api/batch-score/{job_id}` - Get batch results

### Dashboard & History

- `GET /api/portfolio/summary` - Portfolio metrics
- `GET /api/history` - Prediction history

### Settings

- `GET /api/settings/model` - Get active model
- `POST /api/settings/model` - Switch model

Full API documentation: http://localhost:8000/docs

## 🧪 Testing

### Backend

```bash
cd backend
pytest
```

### Frontend

```bash
cd frontend
npm test
```

## 📦 Building for Production

### Backend

```bash
# Install production dependencies
pip install -r requirements.txt

# Run with gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### Frontend

```bash
cd frontend
npm run build
```

Build output: `frontend/dist/`

## 🔒 Security Notes

- Models trained on synthetic/demo data
- No authentication implemented (add before production)
- CORS configured for localhost only
- Add rate limiting for production use

## 📝 Model Information

**Input Features:**
- Age (years)
- Income Total
- Credit Amount
- Annuity
- Family Members
- Active/Closed Loans
- Bureau Loans
- Delinquency History

**Output:**
- Probability of Default (PD)
- Risk Score (0-1000)
- Risk Band (A/B/C/D)
- Expected Loss ($)
- Decision (Approved/Rejected/Manual Review)
- Reason Codes

**Models:**
- Logistic Regression (default)
- LightGBM (advanced)

## 🛠️ Development

### Hot Reload

Both backend and frontend support hot reload:

- **Backend**: FastAPI's `--reload` flag
- **Frontend**: Vite HMR

### Common Issues

1. **Port already in use**
   ```bash
   # Change ports in configuration
   # Backend: uvicorn --port 8001
   # Frontend: vite --port 8081
   ```

2. **CORS errors**
   - Check `backend/app/main.py` CORS configuration
   - Ensure frontend URL is allowed

3. **Model loading errors**
   - Verify `models/` directory has all .pkl files
   - Check Python scikit-learn version compatibility

4. **Database errors**
   - Delete `backend/history.db` to reset
   - Will be recreated on startup

## 📚 Tech Stack

**Backend:**
- FastAPI 0.104
- Pydantic 2.5
- scikit-learn 1.3.2
- LightGBM 4.1.0
- pandas 2.1.3
- uvicorn 0.24

**Frontend:**
- React 18
- TypeScript 5
- Vite 5
- TailwindCSS 3
- shadcn/ui
- Radix UI
- React Query
- Recharts

## 🎓 Learning Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [scikit-learn User Guide](https://scikit-learn.org/stable/)
- [LightGBM Documentation](https://lightgbm.readthedocs.io/)

## 📄 License

MIT

## 👥 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 🐛 Known Issues

- sklearn version warning (models trained on 1.6.1, running on 1.3.2)
- Pydantic warning about `model_type` field name

These warnings don't affect functionality but should be addressed in production.

---

**Current Status**: ✅ Backend Running | ✅ Frontend Running | ✅ Fully Integrated

Access the application at http://localhost:8080
