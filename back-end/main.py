from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
import lightgbm as lgb
import shap
from typing import List

from models import Base, Claim
from database import engine, SessionLocal
from schemas import ClaimCreate, ClaimResponse

app = FastAPI()

# Create tables
Base.metadata.create_all(bind=engine)

# Load model and SHAP
model = lgb.Booster(model_file='fraud_model.txt')
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
        # Convert to DataFrame
        df = pd.DataFrame([claim.dict()])
        
        # Predict fraud score
        fraud_score = model.predict(df)[0]
        
        # Calculate SHAP values
        shap_values = explainer.shap_values(df)[0].tolist()
        
        # Create Claim record
        db_claim = Claim(**claim.dict(), fraud_score=fraud_score, fraud=False, anomaly_score=0.0)
        db.add(db_claim)
        db.commit()
        db.refresh(db_claim)
        
        return db_claim
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/bulk_score", response_model=List[ClaimResponse])
def bulk_score(claims: List[ClaimCreate], db: Session = Depends(get_db)):
    try:
        df = pd.DataFrame([claim.dict() for claim in claims])
        fraud_scores = model.predict(df)
        
        db_claims = []
        for claim, score in zip(claims, fraud_scores):
            db_claim = Claim(**claim.dict(), fraud_score=score, fraud=False, anomaly_score=0.0)
            db.add(db_claim)
            db_claims.append(db_claim)
        
        db.commit()
        for claim in db_claims:
            db.refresh(claim)
        
        return db_claims
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/flagged_claims", response_model=List[ClaimResponse])
def get_flagged_claims(threshold: float = 0.8, db: Session = Depends(get_db)):
    claims = db.query(Claim).filter(Claim.fraud_score >= threshold).all()
    return claims

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
    trends = db.query(func.date_trunc('month', Claim.created_at).label('month'),
                      func.count(Claim.id).label('count'))\
               .group_by('month').all()
    labels = [str(trend.month) for trend in trends]
    data = [trend.count for trend in trends]
    return {"labels": labels, "data": data}
