# scripts/train_model.py

import pandas as pd
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score
import joblib
import os
import logging
import warnings

# Suppress specific Matplotlib warnings (optional)
warnings.filterwarnings("ignore", category=UserWarning, module='matplotlib')

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def load_data():
    # Load the preprocessed application data
    data_path = '../data/processed/application_train_processed.csv'
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Data file not found at path: {data_path}")
    app = pd.read_csv(data_path)
    logging.info(f"Loaded training data from {data_path}")
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
    logging.info(f"Training data has {X.shape[0]} samples and {X.shape[1]} features.")
    
    # Split the data
    X_train, X_val, y_train, y_val = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    logging.info(f"Split data into train ({X_train.shape[0]} samples) and validation ({X_val.shape[0]} samples) sets.")
    
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
    logging.info("Starting model training.")
    model = lgb.train(
        params=params,
        train_set=dtrain,
        valid_sets=[dvalid],
        num_boost_round=1000,
        callbacks=[early_stopping]
    )
    logging.info("Model training completed.")
    
    # Predict and evaluate
    y_pred = model.predict(X_val, num_iteration=model.best_iteration)
    auc = roc_auc_score(y_val, y_pred)
    logging.info(f'Validation AUC: {auc}')
    
    # Save the model
    os.makedirs('../model', exist_ok=True)
    model_path = '../model/lightgbm_model.pkl'
    joblib.dump({
        'model': model,
        'features': X.columns.tolist()
    }, model_path)
    logging.info(f'Model saved to {model_path}')
    
    # Optional: Plot and save feature importance
    try:
        import matplotlib.pyplot as plt
        plt.figure(figsize=(10, 8))
        
        # Set a specific font to avoid font-related warnings
        plt.rcParams['font.family'] = 'DejaVu Sans'
        
        ax = lgb.plot_importance(model, max_num_features=20, importance_type='gain')
        plt.title('Feature Importance (Gain)')
        plt.tight_layout()
        
        # Save the plot to the model directory
        feature_importance_path = '../model/feature_importance.png'
        plt.savefig(feature_importance_path)
        logging.info(f'Feature importance plot saved to {feature_importance_path}')
        
        # Optionally, display the plot
        # plt.show()
        
        plt.close()
    except ImportError:
        logging.warning("matplotlib not installed. Skipping feature importance plot.")
    except Exception as e:
        logging.error(f"An error occurred while plotting feature importance: {e}")

if __name__ == "__main__":
    train()
