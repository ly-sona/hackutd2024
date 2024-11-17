# insurewise_backend/models.py

from sqlalchemy import Column, Integer, Float, Boolean, DateTime, String
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Claim(Base):
    __tablename__ = 'claims'
    id = Column(Integer, primary_key=True, index=True)
    policy_type = Column(Integer)
    incident_type = Column(Integer)
    vehicle_type = Column(Integer)
    claim_amount = Column(Float)
    customer_age = Column(Integer)
    fraud = Column(Boolean, default=False)
    fraud_score = Column(Float)
    anomaly_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    ipfs_hash = Column(String, nullable=True)  # New field to store IPFS hash
