# data_preparation.py

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from imblearn.over_sampling import SMOTE
import joblib

# Load dataset
df = pd.read_csv('insurance_dataset.csv')  # Update with actual file name

# Display first few rows
print(df.head())

# Handle missing values
print("Missing values before:", df.isnull().sum())
df = df.dropna()
print("Missing values after:", df.isnull().sum())

# Remove duplicates
df = df.drop_duplicates()

# Feature Engineering
current_year = 2024
df['customer_age'] = current_year - df['customer_birth_year']

# Drop unnecessary columns
df = df.drop(['id', 'policy_number', 'customer_birth_year'], axis=1)

# Encode categorical variables
label_encoders = {}
categorical_features = ['policy_type', 'incident_type', 'vehicle_type']

for col in categorical_features:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    label_encoders[col] = le

# Define features and target
X = df.drop(['fraud'], axis=1)
y = df['fraud']

# Split into train and test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Handle class imbalance with SMOTE
smote = SMOTE(random_state=42)
X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)

# Save processed data
X_train_resampled.to_csv('X_train_resampled.csv', index=False)
y_train_resampled.to_csv('y_train_resampled.csv', index=False)
X_test.to_csv('X_test.csv', index=False)
y_test.to_csv('y_test.csv', index=False)

# Save label encoders for future use
for col, le in label_encoders.items():
    joblib.dump(le, f'label_encoder_{col}.joblib')

print("Data preprocessing completed and saved successfully.")
