# backend/app/main.py

from fastapi import FastAPI, HTTPException, Depends
from app.schemas import LoanApplicationCreate, LoanApplication, PredictionResponse
from app.models import Base, LoanApplication as LoanApplicationModel
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.utils import Model
import os
from dotenv import load_dotenv
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
    required_vars = ['DATABASE_URL', 'MODEL_PATH', 'LABEL_ENCODERS_PATH']
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

@app.post("/predict", response_model=PredictionResponse)
async def predict(loan_application: LoanApplicationCreate, db: Session = Depends(get_db)):
    input_data = loan_application.dict()
    try:
        approval_prob, default_risk = model.predict(input_data)
        logger.info(f"Prediction successful: Approval Probability={approval_prob}, Default Risk={default_risk}")
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")
    
    # Save to database
    try:
        loan_record = LoanApplicationModel(
            name=loan_application.name,
            age_group=loan_application.age_group,
            marital_status=loan_application.marital_status,
            number_of_dependents=loan_application.number_of_dependents,
            employment_status=loan_application.employment_status,
            household_income_bracket=loan_application.household_income_bracket,
            approximate_household=loan_application.approximate_household,
            approximate_savings_amount=loan_application.approximate_savings_amount,
            monthly_rent_mortgage=loan_application.monthly_rent_mortgage,
            monthly_utilities=loan_application.monthly_utilities,
            monthly_insurance=loan_application.monthly_insurance,
            monthly_loan_payments=loan_application.monthly_loan_payments,
            monthly_subscriptions=loan_application.monthly_subscriptions,
            monthly_food_costs=loan_application.monthly_food_costs,
            monthly_misc_costs=loan_application.monthly_misc_costs,
            prediction=approval_prob
        )
        db.add(loan_record)
        db.commit()
        db.refresh(loan_record)
        logger.info(f"Loan application record saved for Name: {loan_record.name}")
    except Exception as e:
        logger.error(f"Database error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error: Could not save loan application")
    
    return PredictionResponse(
        approval_probability=approval_prob,
        default_risk=default_risk
    )