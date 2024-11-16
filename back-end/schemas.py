# schemas.py

from pydantic import BaseModel
from typing import Optional

class ClaimBase(BaseModel):
    policy_type: int
    incident_type: int
    vehicle_type: int
    claim_amount: float
    customer_age: int

class ClaimCreate(ClaimBase):
    pass

class ClaimResponse(ClaimBase):
    id: int
    fraud_score: float
    anomaly_score: float
    fraud: bool
    created_at: Optional[str]

    class Config:
        orm_mode = True
