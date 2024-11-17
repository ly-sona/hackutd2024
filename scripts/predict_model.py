# scripts/predict_model.py

import pandas as pd
import lightgbm as lgb
import joblib
import os
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def load_model(model_path='../model/lightgbm_model.pkl'):
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at path: {model_path}")
    model_data = joblib.load(model_path)
    model = model_data['model']
    features = model_data['features']
    logging.info(f"Loaded model and feature list from {model_path}")
    return model, features

def load_test_data(test_data_path='../data/processed/application_test_processed.csv'):
    if not os.path.exists(test_data_path):
        raise FileNotFoundError(f"Test data file not found at path: {test_data_path}")
    test_df = pd.read_csv(test_data_path)
    logging.info(f"Loaded test data from {test_data_path}")
    return test_df

def predict(model, features, test_df):
    # Ensure test_df contains all required features
    if not set(features).issubset(test_df.columns):
        missing = set(features) - set(test_df.columns)
        raise ValueError(f"Test data is missing required features: {missing}")
    
    X_test = test_df[features]
    logging.info(f"Making predictions on {X_test.shape[0]} samples.")
    y_pred = model.predict(X_test, num_iteration=model.best_iteration)
    return y_pred

def save_predictions(test_df, y_pred, submission_path='../data/processed/submission.csv'):
    submission = pd.DataFrame({
        'SK_ID_CURR': test_df['SK_ID_CURR'],
        'TARGET': y_pred
    })
    submission.to_csv(submission_path, index=False)
    logging.info(f'Submission file saved to {submission_path}')

def main():
    try:
        # Load model
        logging.info("Loading the trained model.")
        model, features = load_model()
        
        # Load test data
        logging.info("Loading test data.")
        test_df = load_test_data()
        
        # Predict
        logging.info("Making predictions on test data.")
        y_pred = predict(model, features, test_df)
        
        # Save predictions
        logging.info("Saving predictions.")
        save_predictions(test_df, y_pred, submission_path='../data/processed/submission.csv')
        
    except Exception as e:
        logging.error(f"An error occurred during prediction: {e}")
        raise

if __name__ == "__main__":
    main()