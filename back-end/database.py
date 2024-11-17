# insurewise_backend/database.py

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create a configured "Session" class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
