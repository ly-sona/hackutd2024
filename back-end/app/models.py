# backend/app/models.py

from sqlalchemy import Column, String, Integer, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class LoanApplication(Base):
    __tablename__ = 'loan_applications'
    
    # Assuming 'name' is unique and serves as the primary key
    name = Column(String, primary_key=True, index=True, unique=True)
    
    # Loan application fields
    age_group = Column(String, nullable=False)
    marital_status = Column(String, nullable=False)
    number_of_dependents = Column(Integer, nullable=False)
    employment_status = Column(String, nullable=False)
    household_income_bracket = Column(String, nullable=False)
    approximate_household = Column(Float, nullable=False)
    approximate_savings_amount = Column(Float, nullable=False)
    monthly_rent_mortgage = Column(Float, nullable=False)
    monthly_utilities = Column(Float, nullable=False)
    monthly_insurance = Column(Float, nullable=False)
    monthly_loan_payments = Column(Float, nullable=False)
    monthly_subscriptions = Column(Float, nullable=False)
    monthly_food_costs = Column(Float, nullable=False)
    monthly_misc_costs = Column(Float, nullable=False)
    status = Column(String, default="Pending")
    prediction = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)