# backend/app/utils.py

import joblib
import os
import pandas as pd

MODEL_PATH = os.getenv('MODEL_PATH', '../model/lightgbm_model.pkl')

class Model:
    def __init__(self):
        with open(MODEL_PATH, 'rb') as f:
            data = joblib.load(f)
            self.model = data['model']
            self.label_encoders = data['label_encoders']
            self.features = data['features']
    
    def predict(self, input_data: dict):
        df = pd.DataFrame([input_data])
        
        # Encode categorical variables
        for col, le in self.label_encoders.items():
            if col in df.columns:
                df[col] = le.transform(df[col].astype(str))
        
        # Ensure all features are present
        for feature in self.features:
            if feature not in df.columns:
                df[feature] = 0  # or appropriate default
        
        X = df[self.features]
        approval_prob = self.model.predict_proba(X)[:,1][0]
        default_risk = approval_prob  # Assuming approval probability correlates with default risk; adjust as needed
        return approval_prob, default_risk