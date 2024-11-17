from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.schemas import LoanApplicationCreate, LoanApplication, PredictionResponse
from app.models import Base, LoanApplication as LoanApplicationModel
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.utils import Model
import os
from dotenv import load_dotenv
import logging
from typing import List  # Import List from typing
import datetime

# Initialize FastAPI
app = FastAPI(title="Prophecy Loan Prediction API")

# Configure CORS
origins = [
    "http://localhost:5173",  # React frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for testing; restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
    required_vars = ['DATABASE_URL', 'MODEL_PATH', 'LABEL_ENCODERS_PATH']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        raise EnvironmentError(f"Missing environment variables: {', '.join(missing_vars)}")

validate_env_variables()

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

@app.get("/loan_application", response_model=List[LoanApplication])
def get_loan_application(db: Session = Depends(get_db)):
    """
    Fetch all loan applications from the database.
    """
    try:
        applications = db.query(LoanApplicationModel).all()
        return applications  # Return the applications, even if empty
    except Exception as e:
        logger.error(f"Error fetching loan applications: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching loan applications: {str(e)}")

import datetime

@app.post("/predict", response_model=PredictionResponse)
async def predict(loan_application: LoanApplicationCreate, db: Session = Depends(get_db)):
    """
    Predict loan approval and default risk, then save the application.
    """
    input_data = loan_application.dict()
    try:
        # Attempt prediction
        approval_prob, default_risk = model.predict(input_data)

        # Convert NumPy types to native Python types
        approval_prob = float(approval_prob)
        default_risk = float(default_risk)

        logger.info(f"Prediction successful: Approval Probability={approval_prob}, Default Risk={default_risk}")
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        approval_prob, default_risk = None, None  # If prediction fails, set to None
    
    # Save to database
    try:
        loan_record = LoanApplicationModel(
            **loan_application.dict(),
            prediction=approval_prob,  # Can be None
            created_at=datetime.date.today()  # Explicitly set created_at
        )
        db.add(loan_record)
        db.commit()
        db.refresh(loan_record)
        logger.info(f"Loan application record saved for Name: {loan_record.name}")
    except Exception as e:
        logger.error(f"Database error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
    
    return PredictionResponse(
        approval_probability=approval_prob or 0.0,  # Default to 0.0 if None
        default_risk=default_risk or 0.0  # Default to 0.0 if None
    )