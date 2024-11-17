# backend/app/main.py

from fastapi import FastAPI, HTTPException, UploadFile, File
from .schemas import LoanApplication, PredictionResponse
from .models import Base, LoanApplicationRecord
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .utils import Model
import os
import uuid
from dotenv import load_dotenv
import requests

load_dotenv()

# Initialize FastAPI
app = FastAPI(title="Prophecy Loan Prediction API")

# Database setup
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost/prophecy_db')
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

# Initialize model
model = Model()

# Pinata setup
PINATA_API_KEY = os.getenv('PINATA_API_KEY')
PINATA_SECRET_API_KEY = os.getenv('PINATA_SECRET_API_KEY')
PINATA_ENDPOINT = "https://api.pinata.cloud/pinning/pinFileToIPFS"

def upload_to_pinata(file: UploadFile):
    try:
        headers = {
            "pinata_api_key": PINATA_API_KEY,
            "pinata_secret_api_key": PINATA_SECRET_API_KEY
        }
        files = {
            'file': (file.filename, file.file, file.content_type)
        }
        response = requests.post(PINATA_ENDPOINT, headers=headers, files=files)
        if response.status_code == 200:
            return response.json()['IpfsHash']
        else:
            return None
    except Exception as e:
        print(e)
        return None

@app.post("/predict", response_model=PredictionResponse)
async def predict(application: LoanApplication, file: UploadFile = File(None)):
    input_data = application.dict()
    try:
        approval_prob, default_risk = model.predict(input_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    ipfs_hash = None
    if file:
        ipfs_hash = upload_to_pinata(file)
        if not ipfs_hash:
            raise HTTPException(status_code=500, detail="File upload failed")
    
    # Save to database
    db = SessionLocal()
    record = LoanApplicationRecord(
        applicant_id=str(uuid.uuid4()),
        approval_probability=approval_prob,
        default_risk=default_risk,
        documents_ipfs_hash=ipfs_hash
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    db.close()
    
    return PredictionResponse(
        approval_probability=approval_prob,
        default_risk=default_risk,
        documents_ipfs_hash=ipfs_hash
    )