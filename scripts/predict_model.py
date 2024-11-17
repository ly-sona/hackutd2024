# scripts/predict_model.py

import pandas as pd
import lightgbm as lgb
import joblib
import os

def load_model(model_path='../model/lightgbm_model.pkl'):
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found at path: {model_path}")
    model_data = joblib.load(model_path)
    model = model_data['model']
    features = model_data['features']
    return model, features

def load_test_data(test_data_path='../data/processed/application_test_processed.csv'):
    if not os.path.exists(test_data_path):
        raise FileNotFoundError(f"Test data file not found at path: {test_data_path}")
    test_df = pd.read_csv(test_data_path)
    return test_df

def predict(model, features, test_df):
    X_test = test_df[features]
    # Predict probabilities using the Booster
    y_pred = model.predict(X_test, num_iteration=model.best_iteration)
    return y_pred

def save_predictions(test_df, y_pred, submission_path='../data/processed/submission.csv'):
    submission = pd.DataFrame({
        'SK_ID_CURR': test_df['SK_ID_CURR'],
        'TARGET': y_pred
    })
    submission.to_csv(submission_path, index=False)
    print(f'Submission file saved to {submission_path}')

def main():
    # Load model
    print("Loading the trained model.")
    model, features = load_model()
    
    # Load test data
    print("Loading test data.")
    test_df = load_test_data()
    
    # Ensure that the test data has all necessary features
    missing_features = set(features) - set(test_df.columns)
    if missing_features:
        raise ValueError(f"The following required features are missing in the test data: {missing_features}")
    
    # Predict
    print("Making predictions on test data.")
    y_pred = predict(model, features, test_df)
    
    # Save predictions
    print("Saving predictions.")
    save_predictions(test_df, y_pred, submission_path='../data/processed/submission.csv')

if __name__ == "__main__":
    main()