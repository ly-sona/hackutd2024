# main.py

from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
import pandas as pd
import lightgbm as lgb
import shap
import joblib
from typing import List

from models import Base, Claim
from database import engine, SessionLocal
from schemas import ClaimCreate, ClaimResponse

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS settings (adjust origins as needed)
origins = [
    "http://localhost:3000",  # Frontend URL
    # Add other origins if necessary
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Load the trained LightGBM model
model = lgb.Booster(model_file='fraud_model.txt')

# Load label encoders
le_policy_type = joblib.load('label_encoder_policy_type.joblib')
le_incident_type = joblib.load('label_encoder_incident_type.joblib')
le_vehicle_type = joblib.load('label_encoder_vehicle_type.joblib')

# Initialize SHAP
explainer = shap.TreeExplainer(model)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/score_claim", response_model=ClaimResponse)
def score_claim(claim: ClaimCreate, db: Session = Depends(get_db)):
    try:
        # Prepare input data
        claim_data = claim.dict()
        df = pd.DataFrame([claim_data])

        # Predict fraud score
        fraud_score = model.predict(df)[0]

        # Calculate SHAP values
        shap_values = explainer.shap_values(df)
        shap_summary = shap_values.tolist()

        # Create Claim record
        db_claim = Claim(
            policy_type=claim.policy_type,
            incident_type=claim.incident_type,
            vehicle_type=claim.vehicle_type,
            claim_amount=claim.claim_amount,
            customer_age=claim.customer_age,
            fraud_score=fraud_score,
            anomaly_score=0.0,
            fraud=False  # Initially set to False; can be updated via feedback
        )
        db.add(db_claim)
        db.commit()
        db.refresh(db_claim)

        # Return response
        response = ClaimResponse(
            id=db_claim.id,
            policy_type=db_claim.policy_type,
            incident_type=db_claim.incident_type,
            vehicle_type=db_claim.vehicle_type,
            claim_amount=db_claim.claim_amount,
            customer_age=db_claim.customer_age,
            fraud_score=db_claim.fraud_score,
            anomaly_score=db_claim.anomaly_score,
            fraud=db_claim.fraud,
            created_at=db_claim.created_at.isoformat()
        )

        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/bulk_score", response_model=List[ClaimResponse])
def bulk_score(claims: List[ClaimCreate], db: Session = Depends(get_db)):
    try:
        # Prepare input data
        claims_data = [claim.dict() for claim in claims]
        df = pd.DataFrame(claims_data)

        # Predict fraud scores
        fraud_scores = model.predict(df)

        # Create Claim records
        db_claims = []
        for claim_data, score in zip(claims_data, fraud_scores):
            db_claim = Claim(
                policy_type=claim_data['policy_type'],
                incident_type=claim_data['incident_type'],
                vehicle_type=claim_data['vehicle_type'],
                claim_amount=claim_data['claim_amount'],
                customer_age=claim_data['customer_age'],
                fraud_score=score,
                anomaly_score=0.0,
                fraud=False
            )
            db.add(db_claim)
            db_claims.append(db_claim)
        
        db.commit()

        # Refresh and prepare response
        for db_claim in db_claims:
            db.refresh(db_claim)

        responses = [
            ClaimResponse(
                id=claim.id,
                policy_type=claim.policy_type,
                incident_type=claim.incident_type,
                vehicle_type=claim.vehicle_type,
                claim_amount=claim.claim_amount,
                customer_age=claim.customer_age,
                fraud_score=claim.fraud_score,
                anomaly_score=claim.anomaly_score,
                fraud=claim.fraud,
                created_at=claim.created_at.isoformat()
            )
            for claim in db_claims
        ]

        return responses
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/flagged_claims", response_model=List[ClaimResponse])
def get_flagged_claims(threshold: float = 0.8, db: Session = Depends(get_db)):
    claims = db.query(Claim).filter(Claim.fraud_score >= threshold).all()
    responses = [
        ClaimResponse(
            id=claim.id,
            policy_type=claim.policy_type,
            incident_type=claim.incident_type,
            vehicle_type=claim.vehicle_type,
            claim_amount=claim.claim_amount,
            customer_age=claim.customer_age,
            fraud_score=claim.fraud_score,
            anomaly_score=claim.anomaly_score,
            fraud=claim.fraud,
            created_at=claim.created_at.isoformat()
        )
        for claim in claims
    ]
    return responses

@app.post("/feedback/{claim_id}")
def feedback(claim_id: int, is_fraud: bool, db: Session = Depends(get_db)):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    claim.fraud = is_fraud
    db.commit()
    return {"message": "Feedback recorded"}

@app.get("/fraud_trends")
def fraud_trends(db: Session = Depends(get_db)):
    from sqlalchemy import func
    trends = db.query(
        func.date_trunc('month', Claim.created_at).label('month'),
        func.count(Claim.id).label('count')
    ).group_by('month').order_by('month').all()

    labels = [trend.month.strftime('%Y-%m') for trend in trends]
    data = [trend.count for trend in trends]

    return {"labels": labels, "data": data}

@app.post("/explain_claim/{claim_id}")
def explain_claim(claim_id: int, db: Session = Depends(get_db)):
    claim = db.query(Claim).filter(Claim.id == claim_id).first()
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    # Prepare data for SHAP
    claim_data = {
        'policy_type': claim.policy_type,
        'incident_type': claim.incident_type,
        'vehicle_type': claim.vehicle_type,
        'claim_amount': claim.claim_amount,
        'customer_age': claim.customer_age
    }
    df = pd.DataFrame([claim_data])

    # Predict and get SHAP values
    shap_values = explainer.shap_values(df)
    feature_names = df.columns.tolist()

    # Pair feature names with SHAP values
    shap_explanation = dict(zip(feature_names, shap_values[0]))

    return shap_explanation
