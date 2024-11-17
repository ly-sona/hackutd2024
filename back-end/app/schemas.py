from pydantic import BaseModel, Field, field_validator
from typing import Optional
import datetime

class LoanApplicationCreate(BaseModel):
    name: str
    age_group: str
    marital_status: str
    number_of_dependents: int
    employment_status: str
    household_income_bracket: str  # Updated field name
    approximate_savings_amount: float
    monthly_rent_mortgage: float
    monthly_utilities: float
    monthly_insurance: float
    monthly_loan_payments: float
    monthly_subscriptions: float
    monthly_food_costs: float
    monthly_misc_costs: float
    desired_loan_amount: float     # Updated field name
    desired_loan_apr: float        # Updated field name
    desired_loan_period: int       # Updated field name

    @field_validator(
        'number_of_dependents',
        'approximate_savings_amount',
        'monthly_rent_mortgage',
        'monthly_utilities',
        'monthly_insurance',
        'monthly_loan_payments',
        'monthly_subscriptions',
        'monthly_food_costs',
        'monthly_misc_costs',
        'desired_loan_amount',     # Added field
        'desired_loan_apr',        # Added field
        'desired_loan_period',     # Added field
        mode='before'  # For Pydantic V2
    )
    def non_negative(cls, v, info):
        if v < 0:
            raise ValueError(f"{info.field_name} must be non-negative")
        return v

class LoanApplication(LoanApplicationCreate):
    id: int
    prediction: Optional[float]
    created_at: datetime.datetime

    class Config:
        from_attributes = True  # For Pydantic V2

class PredictionResponse(BaseModel):
    approval_probability: float
    default_risk: float