# backend/app/schemas.py

from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional
from datetime import datetime

class LoanApplicationBase(BaseModel):
    name: str
    age_group: str
    marital_status: str
    number_of_dependents: int
    employment_status: str
    household_income_bracket: str
    approximate_household: float
    approximate_savings_amount: float
    monthly_rent_mortgage: float
    monthly_utilities: float
    monthly_insurance: float
    monthly_loan_payments: float
    monthly_subscriptions: float
    monthly_food_costs: float
    monthly_misc_costs: float

    model_config = ConfigDict(from_attributes=True)

    @field_validator(
        'number_of_dependents', 
        'approximate_household', 
        'approximate_savings_amount',
        'monthly_rent_mortgage', 
        'monthly_utilities', 
        'monthly_insurance',
        'monthly_loan_payments', 
        'monthly_subscriptions', 
        'monthly_food_costs',
        'monthly_misc_costs'
    )
    def non_negative(cls, v, info):
        if v < 0:
            raise ValueError(f"{info.field.name} must be non-negative")
        return v

class LoanApplicationCreate(LoanApplicationBase):
    pass

class LoanApplication(LoanApplicationBase):
    name: str
    status: str
    prediction: Optional[float]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class PredictionResponse(BaseModel):
    approval_probability: float
    default_risk: float

    model_config = ConfigDict(from_attributes=True)