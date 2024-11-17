# backend/app/schemas.py

from pydantic import BaseModel
from typing import Optional

class LoanApplication(BaseModel):
    # Define the fields based on the dataset features required for prediction
    # Example fields; adjust based on actual feature requirements
    NAME_CONTRACT_TYPE: Optional[str]
    CODE_GENDER: Optional[str]
    AMT_INCOME_TOTAL: Optional[float]
    AMT_CREDIT: Optional[float]
    AMT_ANNUITY: Optional[float]
    # Add more fields as necessary

class PredictionResponse(BaseModel):
    approval_probability: float
    default_risk: float
    documents_ipfs_hash: Optional[str] = None