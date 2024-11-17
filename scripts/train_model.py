# scripts/train_model.py

import pandas as pd
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
import joblib
import os

def load_data():
    # Load the preprocessed application data
    data_path = '../data/processed/application_train_processed.csv'
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Data file not found at path: {data_path}")
    app = pd.read_csv(data_path)
    return app

def train():
    df = load_data()
    
    # Separate target and features
    if 'TARGET' not in df.columns:
        raise KeyError("'TARGET' column is missing from the dataset.")
    if 'SK_ID_CURR' not in df.columns:
        raise KeyError("'SK_ID_CURR' column is missing from the dataset.")
    
    y = df['TARGET']
    X = df.drop(['TARGET', 'SK_ID_CURR'], axis=1)
    
    # Split the data
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Create LightGBM datasets
    dtrain = lgb.Dataset(X_train, label=y_train)
    dvalid = lgb.Dataset(X_val, label=y_val, reference=dtrain)
    
    # Define model parameters
    params = {
        "objective": "binary",
        "metric": "auc",
        "learning_rate": 0.05,
        "num_leaves": 31,
        "verbose": -1,
        "random_state": 42,
    }
    
    # Define early stopping callback
    early_stopping = lgb.early_stopping(stopping_rounds=100, verbose=True)
    
    # Train the model with early stopping via callbacks
    model = lgb.train(
        params=params,
        train_set=dtrain,
        valid_sets=[dvalid],
        num_boost_round=1000,
        callbacks=[early_stopping]
    )
    
    # Predict and evaluate
    y_pred = model.predict(X_val, num_iteration=model.best_iteration)
    auc = roc_auc_score(y_val, y_pred)
    print(f'Validation AUC: {auc}')
    
    # Save the model
    os.makedirs('../model', exist_ok=True)
    joblib.dump({
        'model': model,
        'features': X.columns.tolist()
    }, '../model/lightgbm_model.pkl')
    print('Model saved to ../model/lightgbm_model.pkl')

if __name__ == "__main__":
    train()