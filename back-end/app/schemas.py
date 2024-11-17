# backend/app/schemas.py

from pydantic import BaseModel, Field
from typing import Optional

class LoanApplication(BaseModel):
    # Define all required fields based on your dataset features
    NAME_CONTRACT_TYPE: Optional[str] = Field(None, example="Cash loans")
    CODE_GENDER: Optional[str] = Field(None, example="M")
    AMT_INCOME_TOTAL: Optional[float] = Field(None, example=50000.0)
    AMT_CREDIT: Optional[float] = Field(None, example=200000.0)
    AMT_ANNUITY: Optional[float] = Field(None, example=15000.0)
    # Add more fields as necessary, ensuring they match the model's expected input

class PredictionResponse(BaseModel):
    approval_probability: float = Field(..., example=0.85)
    default_risk: float = Field(..., example=0.15)
    documents_ipfs_hash: Optional[str] = Field(None, example="Qm...")