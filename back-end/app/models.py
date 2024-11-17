from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class LoanApplication(Base):
    __tablename__ = 'loan_applications'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age_group = Column(String, nullable=False)
    marital_status = Column(String, nullable=False)
    number_of_dependents = Column(Integer, nullable=False)
    employment_status = Column(String, nullable=False)
    household_income_bracket = Column(String, nullable=False)  # Updated field name
    approximate_savings_amount = Column(Float, nullable=False)
    monthly_rent_mortgage = Column(Float, nullable=False)
    monthly_utilities = Column(Float, nullable=False)
    monthly_insurance = Column(Float, nullable=False)
    monthly_loan_payments = Column(Float, nullable=False)
    monthly_subscriptions = Column(Float, nullable=False)
    monthly_food_costs = Column(Float, nullable=False)
    monthly_misc_costs = Column(Float, nullable=False)
    desired_loan_amount = Column(Float, nullable=False)     # Updated field name
    desired_loan_apr = Column(Float, nullable=False)        # Updated field name
    desired_loan_period = Column(Integer, nullable=False)   # Updated field name
    prediction = Column(Float)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)