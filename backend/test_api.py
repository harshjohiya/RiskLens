"""Test script to verify backend API endpoints."""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint."""
    print("\n🔍 Testing Health Check...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_predict():
    """Test single applicant prediction."""
    print("\n🔍 Testing Single Prediction...")
    
    payload = {
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
    
    response = requests.post(f"{BASE_URL}/predict", json=payload)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

def test_portfolio():
    """Test portfolio summary."""
    print("\n🔍 Testing Portfolio Summary...")
    response = requests.get(f"{BASE_URL}/portfolio/summary")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

if __name__ == "__main__":
    print("="*60)
    print("🚀 RiskLens Backend API Test")
    print("="*60)
    
    try:
        test_health()
        test_predict()
        test_portfolio()
        
        print("\n" + "="*60)
        print("✅ All tests completed!")
        print("="*60)
        
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to backend server")
        print("Make sure the server is running at http://localhost:8000")
    except Exception as e:
        print(f"\n❌ Error: {e}")
