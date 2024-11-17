# insurewise_backend/main.py

from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from sqlalchemy.orm import Session
import pandas as pd
import lightgbm as lgb
import shap
import joblib
from typing import List
import os
from dotenv import load_dotenv

from models import Base, Claim
from database import engine, SessionLocal
from schemas import ClaimCreate, ClaimResponse

from fastapi.middleware.cors import CORSMiddleware
from pinata_utils import upload_file_to_pinata  # Import the utility function

load_dotenv()

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

@app.post("/upload_claim_file/{claim_id}")
def upload_claim_file(claim_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Endpoint to upload a file related to a specific claim.
    """
    try:
        # Save the uploaded file temporarily
        temp_file_path = f"temp_{file.filename}"
        with open(temp_file_path, "wb") as buffer:
            buffer.write(file.file.read())
        
        # Upload to Pinata
        ipfs_hash = upload_file_to_pinata(temp_file_path)
        
        # Remove the temporary file
        os.remove(temp_file_path)
        
        # Update the claim record with the IPFS hash
        claim = db.query(Claim).filter(Claim.id == claim_id).first()
        if not claim:
            raise HTTPException(status_code=404, detail="Claim not found")
        
        claim.ipfs_hash = ipfs_hash
        db.commit()
        db.refresh(claim)
        
        return {"ipfs_hash": ipfs_hash, "ipfs_url": f"https://gateway.pinata.cloud/ipfs/{ipfs_hash}"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# insurewise_backend/main.py (excerpt)

from models import Base
from database import engine

# Create all tables in the database. This is equivalent to "Create Table" statements in raw SQL.
Base.metadata.create_all(bind=engine)


# Existing endpoints remain unchanged
# ...
