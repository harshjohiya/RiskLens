# 🚀 RiskLens Quick Start Guide

## Get Running in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
# or
bun install
```

### Step 2: Configure API
```bash
# The .env file is already created with default settings
# Edit if your backend runs on a different URL
VITE_API_BASE_URL=http://localhost:8000/api
```

### Step 3: Start Development Server
```bash
npm run dev
# or
bun dev
```

### Step 4: Open Application
Navigate to: **http://localhost:5173**

---

## 📱 Navigation Structure

Once running, you'll see a left sidebar with:

1. **Dashboard** (`/dashboard`) - Portfolio overview
2. **Single Applicant** (`/score`) - Score individual applications
3. **Batch Scoring** (`/batch`) - Upload CSV for bulk scoring
4. **Risk Bands** (`/risk-bands`) - Risk categorization
5. **Expected Loss** (`/expected-loss`) - Loss analysis
6. **Explainability** (`/explainability`) - Decision factors
7. **History** (`/history`) - Past scoring records
8. **API Access** (`/api-access`) - API documentation
9. **Settings** (`/settings`) - Model configuration

---

## ⚠️ Important Notes

### Backend Required
This UI requires a backend API running on `http://localhost:8000` (or your configured URL).

**If backend is not running:**
- You'll see "Failed to load" errors
- API calls will fail
- Empty states will display

### No Mock Data
- All data comes from backend APIs
- No placeholder charts or numbers
- Everything is real-time

### API Endpoints Your Backend Must Implement

```
POST   /api/predict                    → Single scoring
GET    /api/portfolio/summary          → Dashboard data
POST   /api/batch-score                → Batch upload
GET    /api/batch-score/:jobId         → Batch status
GET    /api/history                    → Historical records
GET    /api/explain/:applicationId     → Explainability
GET    /api/settings/model             → Get settings
PUT    /api/settings/model             → Update settings
```

---

## 🎯 First-Time Testing

### Test Single Applicant Scoring
1. Go to **Single Applicant** page
2. Fill in the form:
   - Income: 75000
   - Credit Score: 700
   - Loan Amount: 25000
   - Employment Length: 5
   - Debt-to-Income: 35.5
3. Click **Calculate Risk Score**
4. View results (PD, Risk Band, Decision, etc.)

### Test Dashboard
1. Go to **Dashboard**
2. Should see portfolio metrics
3. Charts show risk distribution
4. If empty, check backend is returning data

---

## 🔧 Common Issues

### "Failed to load" errors
**Problem:** Backend not running or wrong URL
**Solution:** 
1. Start your backend server
2. Check `.env` has correct `VITE_API_BASE_URL`
3. Verify backend CORS allows frontend origin

### TypeScript errors
**Problem:** Type mismatches
**Solution:** Check `src/types/api.ts` matches your backend responses

### Missing modules
**Problem:** Dependencies not installed
**Solution:** Run `npm install` again

---

## 📚 Next Steps

1. **Review Files:**
   - `src/services/api.ts` - API endpoints
   - `src/types/api.ts` - Response types
   - `src/pages/SingleApplicant.tsx` - Customize form fields

2. **Customize:**
   - Update form fields to match your model
   - Adjust risk band thresholds
   - Add authentication if needed

3. **Test:**
   - Test all pages with real backend
   - Verify all API calls work
   - Check error handling

4. **Deploy:**
   - Build: `npm run build`
   - Deploy `dist/` folder
   - Update `VITE_API_BASE_URL` for production

---

## 🆘 Need Help?

1. Check [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) for detailed setup
2. Review [RISKLENS_README.md](RISKLENS_README.md) for full documentation
3. See [UI_UPDATE_SUMMARY.md](UI_UPDATE_SUMMARY.md) for what changed

---

**You're all set! Start your backend and enjoy your professional credit risk platform! 🎉**
