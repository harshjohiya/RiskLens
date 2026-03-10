<div align="center">

# 🎯 RiskLens

### AI-Powered Credit Risk Assessment Platform

*Real-time scoring • Batch processing • SHAP explainability*

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)

</div>

---

## 📋 Overview

RiskLens is an enterprise-grade credit risk assessment platform that leverages machine learning to provide accurate, explainable credit scoring. Built with modern web technologies and production-ready ML models, it offers both real-time predictions and batch processing capabilities.

## ✨ Key Features

- **🎯 Real-time Scoring** - Instant credit risk assessment with multiple ML models
- **📊 Batch Processing** - Process thousands of applications efficiently
- **🔍 Model Explainability** - SHAP values for transparent decision-making
- **📈 Portfolio Analytics** - Comprehensive risk distribution insights
- **🔐 Secure Authentication** - JWT-based user management
- **📱 Responsive Design** - Modern UI built with React & Tailwind CSS

## 🏗️ Architecture

```mermaid
graph TB
    A[👤 User] -->|HTTPS| B[React Frontend]
    B -->|API Calls| C[FastAPI Backend]
    C -->|Load Models| D[(ML Models)]
    C -->|Store Results| E[(SQLite DB)]
    D -->|Predictions| F[Scoring Engine]
    F -->|SHAP| G[Explainability]
    
    style A fill:#e1f5ff,stroke:#01579b,stroke-width:2px,color:#000
    style B fill:#bbdefb,stroke:#01579b,stroke-width:2px,color:#000
    style C fill:#90caf9,stroke:#01579b,stroke-width:2px,color:#000
    style D fill:#64b5f6,stroke:#0d47a1,stroke-width:2px,color:#000
    style E fill:#42a5f5,stroke:#0d47a1,stroke-width:2px,color:#000
    style F fill:#2196f3,stroke:#0d47a1,stroke-width:2px,color:#fff
    style G fill:#1976d2,stroke:#0d47a1,stroke-width:2px,color:#fff
```

##  Quick Start

### Prerequisites
- Node.js 18+ & npm
- Python 3.9+
- Git

### Frontend Setup

```bash
# Clone repository
git clone <YOUR_GIT_URL>
cd risk-lens

# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup

```bash
cd risklens-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server
python app/main.py
```

## 🛠️ Tech Stack

**Frontend**
- ⚛️ React 18 + TypeScript
- 🎨 Tailwind CSS + shadcn/ui
- ⚡ Vite
- 🔄 React Query
- 📊 Recharts

**Backend**
- 🐍 Python + FastAPI
- 🤖 LightGBM + Scikit-learn
- 📈 SHAP for explainability
- 🔐 JWT authentication
- 💾 SQLite database

## 📁 Project Structure

```
risk-lens/
├── src/              # React frontend
│   ├── components/   # UI components
│   ├── pages/        # Application pages
│   └── lib/          # Utilities & API client
├── risklens-backend/ # FastAPI backend
│   ├── app/          # Application code
│   ├── models/       # Trained ML models
│   └── routes/       # API endpoints
├── notebook/         # Jupyter notebooks
└── data/             # Training datasets
```

## 🎯 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/signup` | User registration |
| `POST` | `/auth/login` | User authentication |
| `POST` | `/api/predict` | Single prediction |
| `POST` | `/api/batch/score` | Batch scoring |
| `GET` | `/api/batch/status/{id}` | Batch job status |

## 📊 Models

| Model | Type | Role |
|-------|------|------|
| **Logistic Regression** | Linear classifier | Baseline — interpretable, fast |
| **LightGBM** | Gradient boosting | Production default — highest accuracy |

## 📈 Model Performance

**Training Dataset** — 307,511 samples · 122 raw features → **20 engineered features** · **8.1% default rate** (class-imbalanced)

| Metric | Logistic Regression | LightGBM |
|--------|:-------------------:|:--------:|
| ROC-AUC | 0.6245 | **0.6751** |
| KS Statistic | 0.1308 | **0.2611** |
| PR-AUC (Avg. Precision) | 0.1029 | **0.1627** |

> LightGBM is the default production model, delivering superior discriminative power on this imbalanced task.

## 🎯 Risk Score System

PD (Probability of Default) is converted to a score via: `Score = 600 − 50 × ln(PD / (1 − PD))`, clamped to **[0 – 1000]**.

| Band | Score Range | Decision | Risk Level |
|:----:|:-----------:|:--------:|:----------:|
| A | ≥ 650 | ✅ Approve | Low |
| B | 600 – 649 | ✅ Approve | Moderate |
| C | 550 – 599 | ⚠️ Manual Review | High |
| D | < 550 | ❌ Reject | Very High |

> Expected Loss: `EL = PD × LGD × Exposure` where **LGD = 45%**.

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

<div align="center">

**Built with ❤️ for better credit risk assessment**
