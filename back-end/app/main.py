# backend/app/main.py

from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from app.schemas import LoanApplication, PredictionResponse
from app.models import Base, LoanApplicationRecord
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.utils import Model
import os
import uuid
from dotenv import load_dotenv
import requests
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Validate environment variables
def validate_env_variables():
    required_vars = ['DATABASE_URL', 'PINATA_API_KEY', 'PINATA_SECRET_API_KEY', 'MODEL_PATH', 'LABEL_ENCODERS_PATH']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        raise EnvironmentError(f"Missing environment variables: {', '.join(missing_vars)}")

validate_env_variables()

# Initialize FastAPI
app = FastAPI(title="Prophecy Loan Prediction API")

# Database setup
DATABASE_URL = os.getenv('DATABASE_URL')
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create all tables
Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize model
try:
    model = Model()
    logger.info("Model loaded successfully.")
except Exception as e:
    logger.error(f"Failed to load model: {e}")
    raise e

# Pinata setup
PINATA_API_KEY = os.getenv('PINATA_API_KEY')
PINATA_SECRET_API_KEY = os.getenv('PINATA_SECRET_API_KEY')
PINATA_ENDPOINT = "https://api.pinata.cloud/pinning/pinFileToIPFS"

def upload_to_pinata(file: UploadFile):
    if not PINATA_API_KEY or not PINATA_SECRET_API_KEY:
        logger.warning("Pinata API keys not set.")
        return None
    try:
        headers = {
            "pinata_api_key": PINATA_API_KEY,
            "pinata_secret_api_key": PINATA_SECRET_API_KEY
        }
        files = {
            'file': (file.filename, file.file, file.content_type)
        }
        response = requests.post(PINATA_ENDPOINT, headers=headers, files=files)
        response.raise_for_status()
        ipfs_hash = response.json().get('IpfsHash')
        logger.info(f"File uploaded to Pinata with IPFS hash: {ipfs_hash}")
        return ipfs_hash
    except Exception as e:
        logger.error(f"Error uploading to Pinata: {e}")
        return None

@app.post("/predict", response_model=PredictionResponse)
async def predict(application: LoanApplication, file: UploadFile = File(None), db: Session = Depends(get_db)):
    input_data = application.dict()
    try:
        approval_prob, default_risk = model.predict(input_data)
        logger.info(f"Prediction successful: Approval Probability={approval_prob}, Default Risk={default_risk}")
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")
    
    ipfs_hash = None
    if file:
        ipfs_hash = upload_to_pinata(file)
        if not ipfs_hash:
            logger.error("File upload failed.")
            raise HTTPException(status_code=500, detail="File upload failed")
    
    # Save to database
    try:
        record = LoanApplicationRecord(
            applicant_id=str(uuid.uuid4()),
            approval_probability=approval_prob,
            default_risk=default_risk,
            documents_ipfs_hash=ipfs_hash
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        logger.info(f"Loan application record saved with ID: {record.id}")
    except Exception as e:
        db.rollback()
        logger.error(f"Database error: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    return PredictionResponse(
        approval_probability=approval_prob,
        default_risk=default_risk,
        documents_ipfs_hash=ipfs_hash
    )