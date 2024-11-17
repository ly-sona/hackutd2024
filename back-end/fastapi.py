# fastapi.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel

app = FastAPI()

# Add CORS middleware to allow React frontend to interact with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock Data Models
class FlaggedClaim(BaseModel):
    id: str
    fraud_score: float
    details: str

class FraudTrends(BaseModel):
    labels: List[str]
    data: List[float]

class SummaryMetrics(BaseModel):
    total_claims_processed: int
    flagged_claims: int

# Root Endpoint
@app.get("/")
def read_root():
    return {"message": "Hello from FastAPI!"}

# Existing /data Endpoint (Optional)
@app.get("/data")
def get_data():
    return {"name": "FastAPI", "type": "backend"}

# New Endpoints for Dashboard.jsx

# 1. Summary Metrics
@app.get("/fraud_trends", response_model=SummaryMetrics)
def get_summary_metrics():
    """
    Returns summary metrics including total claims processed and flagged claims count.
    """
    return {
        "total_claims_processed": 1000,
        "flagged_claims": 50
    }

# 2. Flagged Claims List
@app.get("/api/flagged_claims", response_model=List[FlaggedClaim])
def get_flagged_claims():
    """
    Returns a list of flagged claims with their details.
    """
    mock_flagged_claims = [
        {"id": "C1001", "fraud_score": 85.5, "details": "Suspicious activity in account."},
        {"id": "C1002", "fraud_score": 78.2, "details": "Unusual claim amount."},
        {"id": "C1003", "fraud_score": 90.1, "details": "Multiple claims from the same entity."},
        {"id": "C1004", "fraud_score": 65.4, "details": "Discrepancy in reported information."},
        {"id": "C1005", "fraud_score": 80.0, "details": "Frequent policy changes."},
        # Add more mock claims as needed
    ]
    return mock_flagged_claims

# 3. Fraud Trends Data
@app.get("/api/fraud_trends", response_model=FraudTrends)
def get_fraud_trends():
    """
    Returns data for fraud detection trends over the past 6 months.
    """
    mock_fraud_trends = {
        "labels": ["June", "July", "August", "September", "October", "November"],
        "data": [5.2, 4.8, 6.1, 5.5, 5.9, 6.3]  # Fraud Detection Rates (%) per month
    }
    return mock_fraud_trends