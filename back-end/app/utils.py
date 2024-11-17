# backend/app/utils.py

import joblib
import os
import pandas as pd
from typing import Dict

class Model:
    def __init__(self):
        model_path = os.getenv('MODEL_PATH', '../../model/lightgbm_model.pkl')
        label_encoders_path = os.getenv('LABEL_ENCODERS_PATH', '../../model/label_encoders.pkl')
        
        # Verify that model and label encoders files exist
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Model file not found at path: {model_path}")
        
        if not os.path.exists(label_encoders_path):
            raise FileNotFoundError(f"Label encoders file not found at path: {label_encoders_path}")
        
        try:
            # Load the model and features
            with open(model_path, 'rb') as f:
                model_data = joblib.load(f)
                self.model = model_data['model']
                self.features = model_data['features']
            
            # Load the label encoders
            with open(label_encoders_path, 'rb') as f:
                self.label_encoders: Dict[str, joblib] = joblib.load(f)
                
        except Exception as e:
            raise RuntimeError(f"Error loading model or label encoders: {e}")
    
    def predict(self, input_data: dict):
        df = pd.DataFrame([input_data])
        
        # Encode categorical variables using label encoders
        for col, le in self.label_encoders.items():
            if col in df.columns:
                # Handle unknown categories by assigning a default value (e.g., -1)
                df[col] = df[col].astype(str).fillna('Missing')
                df[col] = df[col].apply(lambda x: le.transform([x])[0] if x in le.classes_ else -1)
        
        # Ensure all required features are present
        for feature in self.features:
            if feature not in df.columns:
                df[feature] = 0  # Assign a default value or handle appropriately
        
        X = df[self.features]
        try:
            approval_prob = self.model.predict_proba(X)[:, 1][0]
            default_risk = 1 - approval_prob  # Assuming inverse relationship
        except Exception as e:
            raise RuntimeError(f"Prediction error: {e}")
        
        return approval_prob, default_risk