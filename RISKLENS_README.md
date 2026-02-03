# RiskLens - Credit Risk Assessment Platform

A professional fintech application for credit risk assessment, featuring real-time scoring, portfolio analytics, and comprehensive explainability.

## 🚀 Features

### Core Functionality
- **Dashboard** - Portfolio-wide risk metrics and analytics
- **Single Applicant Scoring** - Real-time individual credit risk assessment
- **Batch Scoring** - Bulk CSV upload for multiple applications
- **Risk Bands** - Risk segmentation and categorization
- **Expected Loss** - Portfolio loss analysis and forecasting
- **Explainability** - Detailed decision factor analysis
- **History** - Searchable application scoring records
- **API Access** - REST API documentation and integration
- **Settings** - Model configuration and preferences

### Technical Features
- ✅ Professional left sidebar navigation
- ✅ Full TypeScript support with strict typing
- ✅ Centralized API service layer
- ✅ Real-time data fetching (no mock data)
- ✅ Loading states and error handling
- ✅ Responsive design for all screen sizes
- ✅ Toast notifications for user feedback
- ✅ Route-based navigation with active states

## 🛠️ Tech Stack

- **Frontend Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **UI Library:** Tailwind CSS + shadcn/ui
- **State Management:** TanStack Query (React Query)
- **Routing:** React Router v6
- **Charts:** Recharts
- **Icons:** Lucide React
- **Date Handling:** date-fns

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx      # Main layout with sidebar
│   │   └── Sidebar.tsx         # Navigation sidebar
│   ├── ui/                     # shadcn/ui components
│   └── ...
├── pages/
│   ├── Dashboard.tsx           # Portfolio overview
│   ├── SingleApplicant.tsx     # Individual scoring
│   ├── BatchScoring.tsx        # Bulk CSV scoring
│   ├── RiskBands.tsx           # Risk categorization
│   ├── ExpectedLoss.tsx        # Loss analysis
│   ├── Explainability.tsx      # Decision explanations
│   ├── History.tsx             # Historical records
│   ├── ApiAccess.tsx           # API documentation
│   ├── Settings.tsx            # Configuration
│   └── ...
├── services/
│   └── api.ts                  # Centralized API client
├── types/
│   └── api.ts                  # TypeScript interfaces
├── lib/
│   └── utils.ts                # Utility functions
└── App.tsx                     # Main app & routing
```

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+ or Bun
- Backend API running on `http://localhost:8000`

### Installation

```bash
# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env
# Edit .env to configure API_BASE_URL

# Run development server
npm run dev
# or
bun dev
```

The app will be available at `http://localhost:5173`

## 🌐 Backend API Requirements

The frontend expects the following REST API endpoints:

### Required Endpoints

```
POST   /api/predict                    # Single applicant scoring
POST   /api/batch-score                # Batch CSV upload
GET    /api/batch-score/:jobId         # Check batch status
GET    /api/portfolio/summary          # Portfolio metrics
GET    /api/history                    # Application history
GET    /api/explain/:applicationId     # Explainability
GET    /api/settings/model             # Model settings
PUT    /api/settings/model             # Update model
```

### API Response Types

See [src/types/api.ts](src/types/api.ts) for complete TypeScript interfaces.

**Example: Single Prediction Response**
```json
{
  "pd": 0.156,
  "risk_score": 680,
  "risk_band": "Medium",
  "expected_loss": 3900,
  "decision": "Approved",
  "reason_codes": [
    "Good credit score",
    "Stable employment history",
    "Moderate debt-to-income ratio"
  ]
}
```

**Example: Portfolio Summary Response**
```json
{
  "total_applications": 1284,
  "approval_rate": 0.785,
  "average_pd": 0.156,
  "total_expected_loss": 125000.50,
  "risk_band_distribution": [
    { "risk_band": "Low", "count": 578, "percentage": 45.0 },
    { "risk_band": "Medium", "count": 449, "percentage": 35.0 },
    { "risk_band": "High", "count": 257, "percentage": 20.0 }
  ],
  "expected_loss_by_band": [
    { "risk_band": "Low", "total_loss": 12500.50 },
    { "risk_band": "Medium", "total_loss": 45000.00 },
    { "risk_band": "High", "total_loss": 67500.00 }
  ]
}
```

## 📝 Configuration

### Environment Variables

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

### Model Configuration

The Settings page allows switching between:
- **Logistic Regression** (default) - Traditional statistical model
- **LightGBM** - Advanced gradient boosting model

## 🎨 UI/UX Features

### Navigation
- Collapsible sidebar with icons and labels
- Active route highlighting
- Persistent collapsed state
- Mobile-responsive drawer

### Data States
- Loading skeletons during data fetch
- Empty states when no data available
- Error alerts with retry options
- Success notifications via toast

### Accessibility
- Keyboard navigation support
- ARIA labels and roles
- Focus management
- Screen reader friendly

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

## 📦 Building for Production

```bash
# Build production bundle
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist/` directory.

## 🔒 Security Notes

- API keys should be stored securely
- Never commit `.env` files with real credentials
- Use environment variables for sensitive configuration
- Implement proper authentication/authorization on backend

## 🚫 What This UI Does NOT Do

❌ Read CSV or PKL files directly  
❌ Use hardcoded or mock data  
❌ Perform model training  
❌ Access `/dataset` or `/models` directories  
❌ Generate fake analytics  

**All data comes from backend API responses.**

## 📖 Additional Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query/latest)
- [Recharts](https://recharts.org)
- [Tailwind CSS](https://tailwindcss.com)

## 🤝 Contributing

This is a professional fintech product. Follow these guidelines:

1. Maintain TypeScript strict mode
2. No mock or dummy data
3. Proper error handling for all API calls
4. Responsive design for all components
5. Accessibility best practices

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ for financial institutions**
