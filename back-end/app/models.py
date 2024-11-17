# backend/app/models.py

from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
import datetime

Base = declarative_base()

class LoanApplicationRecord(Base):
    __tablename__ = 'loan_applications'
    
    id = Column(Integer, primary_key=True, index=True)
    applicant_id = Column(String, unique=True, index=True)
    approval_probability = Column(Float)
    default_risk = Column(Float)
    documents_ipfs_hash = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)