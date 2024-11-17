# scripts/data_preprocessing.py

import pandas as pd
import numpy as np
import os
import joblib
from sklearn.preprocessing import LabelEncoder
from sklearn.impute import SimpleImputer

def mode_or_default(x):
    """Returns the mode of the series or 'C' if no mode exists."""
    return x.mode()[0] if not x.mode().empty else 'C'

def value_counts_dict(x):
    """Returns a dictionary of value counts."""
    return x.value_counts().to_dict()

def load_data(data_dir, is_train=True):
    # Load primary datasets and normalize column names
    if is_train:
        application = pd.read_csv(os.path.join(data_dir, 'application_train.csv')).rename(str.upper, axis='columns')
    else:
        application = pd.read_csv(os.path.join(data_dir, 'application_test.csv')).rename(str.upper, axis='columns')
    bureau = pd.read_csv(os.path.join(data_dir, 'bureau.csv')).rename(str.upper, axis='columns')
    bureau_balance = pd.read_csv(os.path.join(data_dir, 'bureau_balance.csv')).rename(str.upper, axis='columns')
    credit_card_balance = pd.read_csv(os.path.join(data_dir, 'credit_card_balance.csv')).rename(str.upper, axis='columns')
    POS_CASH_balance = pd.read_csv(os.path.join(data_dir, 'POS_CASH_balance.csv')).rename(str.upper, axis='columns')
    installments_payments = pd.read_csv(os.path.join(data_dir, 'installments_payments.csv')).rename(str.upper, axis='columns')
    previous_application = pd.read_csv(os.path.join(data_dir, 'previous_application.csv')).rename(str.upper, axis='columns')
    
    return application, bureau, bureau_balance, credit_card_balance, POS_CASH_balance, installments_payments, previous_application

def preprocess_application(application_train, is_train=True):
    # Drop only unnecessary ID columns, retain 'SK_ID_CURR' or 'SK_ID_TEST'
    if 'SK_ID_BUREAU' in application_train.columns:
        application_train = application_train.drop(['SK_ID_BUREAU'], axis=1, errors='ignore')
    return application_train

def preprocess_previous_application(previous_application, is_train=True):
    if 'SK_ID_PREV' not in previous_application.columns:
        raise KeyError("'SK_ID_PREV' column is missing from 'previous_application' DataFrame.")
    
    mapping_df = previous_application[['SK_ID_PREV', 'SK_ID_CURR']].drop_duplicates()
    
    # Drop 'SK_ID_PREV' column
    previous_application = previous_application.drop(['SK_ID_PREV'], axis=1, errors='ignore')
    
    # Encode categorical variables
    categorical_cols = previous_application.select_dtypes(include=['object']).columns
    for col in categorical_cols:
        previous_application[col] = previous_application[col].astype('category').cat.codes
    
    # Aggregate previous application data
    previous_app_agg = previous_application.groupby('SK_ID_CURR').agg(
        APP_CASH_LOAN_PURPOSE_mean=('NAME_CASH_LOAN_PURPOSE', 'mean'),
        AMT_APPLICATION_sum=('AMT_APPLICATION', 'sum'),
        AMT_CREDIT_sum=('AMT_CREDIT', 'sum'),
        AMT_DOWN_PAYMENT_sum=('AMT_DOWN_PAYMENT', 'sum'),
        DAYS_DECISION_mean=('DAYS_DECISION', 'mean')
    ).reset_index()
    
    # Rename columns with prefix
    previous_app_agg.columns = ['SK_ID_CURR'] + ['previous_app_' + col for col in previous_app_agg.columns[1:]]
    
    # Save the mapping DataFrame for later use
    os.makedirs('../model', exist_ok=True)
    joblib.dump(mapping_df, '../model/skidprev_skidcurr_mapping.pkl')
    
    return previous_app_agg

def preprocess_bureau(bureau, bureau_balance):
    print("Starting preprocess_bureau")
    # Merge bureau with bureau_balance
    bureau_balance_agg = bureau_balance.groupby('SK_ID_BUREAU').agg(
        MONTHS_BALANCE_min=('MONTHS_BALANCE', 'min'),
        MONTHS_BALANCE_max=('MONTHS_BALANCE', 'max'),
        MONTHS_BALANCE_mean=('MONTHS_BALANCE', 'mean'),
        MONTHS_BALANCE_sum=('MONTHS_BALANCE', 'sum'),
        STATUS_mode_or_default=('STATUS', mode_or_default)
    ).reset_index()
    
    bureau = bureau.merge(bureau_balance_agg, on='SK_ID_BUREAU', how='left')
    bureau = bureau.drop(['SK_ID_BUREAU'], axis=1)
    
    # Aggregate bureau data
    bureau_agg = bureau.groupby('SK_ID_CURR').agg(
        CREDIT_ACTIVE_counts=('CREDIT_ACTIVE', value_counts_dict),
        CREDIT_CURRENCY_counts=('CREDIT_CURRENCY', value_counts_dict),
        AMT_CREDIT_MAX_OVERDUE_mean=('AMT_CREDIT_MAX_OVERDUE', 'mean'),
        AMT_CREDIT_SUM_sum=('AMT_CREDIT_SUM', 'sum'),
        AMT_CREDIT_SUM_DEBT_sum=('AMT_CREDIT_SUM_DEBT', 'sum'),
        AMT_CREDIT_SUM_LIMIT_sum=('AMT_CREDIT_SUM_LIMIT', 'sum'),
        AMT_CREDIT_SUM_OVERDUE_sum=('AMT_CREDIT_SUM_OVERDUE', 'sum'),
        DAYS_CREDIT_mean=('DAYS_CREDIT', 'mean'),
        DAYS_CREDIT_ENDDATE_mean=('DAYS_CREDIT_ENDDATE', 'mean'),
        DAYS_ENDDATE_FACT_mean=('DAYS_ENDDATE_FACT', 'mean'),
        MONTHS_BALANCE_min=('MONTHS_BALANCE_min', 'min'),
        MONTHS_BALANCE_max=('MONTHS_BALANCE_max', 'max'),
        MONTHS_BALANCE_mean=('MONTHS_BALANCE_mean', 'mean'),
        MONTHS_BALANCE_sum=('MONTHS_BALANCE_sum', 'sum'),
        STATUS_mode=('STATUS_mode_or_default', mode_or_default)
    ).reset_index()
    
    return bureau_agg

def preprocess_credit_card(credit_card_balance):
    print("Starting preprocess_credit_card")
    # Ensure 'SK_ID_CURR' exists in 'credit_card_balance'
    if 'SK_ID_CURR' not in credit_card_balance.columns:
        raise KeyError("'SK_ID_CURR' column is missing from 'credit_card_balance' DataFrame.")
    
    # Proceed to aggregate by 'SK_ID_CURR'
    credit_card_agg = credit_card_balance.groupby('SK_ID_CURR').agg(
        MONTHS_BALANCE_min=('MONTHS_BALANCE', 'min'),
        MONTHS_BALANCE_max=('MONTHS_BALANCE', 'max'),
        MONTHS_BALANCE_mean=('MONTHS_BALANCE', 'mean'),
        MONTHS_BALANCE_sum=('MONTHS_BALANCE', 'sum'),
        SK_DPD_mean=('SK_DPD', 'mean'),
        SK_DPD_sum=('SK_DPD', 'sum'),
        SK_DPD_DEF_mean=('SK_DPD_DEF', 'mean'),
        SK_DPD_DEF_sum=('SK_DPD_DEF', 'sum')
    ).reset_index()
    
    # Rename columns with prefix
    credit_card_agg.columns = ['SK_ID_CURR'] + ['credit_card_' + col for col in credit_card_agg.columns[1:]]
    
    print("Aggregated credit_card_agg successfully.")
    return credit_card_agg

def preprocess_POS_cash(POS_CASH_balance):
    print("Starting preprocess_POS_cash")
    # Aggregate POS cash balance data
    pos_cash_agg = POS_CASH_balance.groupby('SK_ID_CURR').agg(
        MONTHS_BALANCE_min=('MONTHS_BALANCE', 'min'),
        MONTHS_BALANCE_max=('MONTHS_BALANCE', 'max'),
        MONTHS_BALANCE_mean=('MONTHS_BALANCE', 'mean'),
        MONTHS_BALANCE_sum=('MONTHS_BALANCE', 'sum'),
        CNT_INSTALMENT_mean=('CNT_INSTALMENT', 'mean'),
        CNT_INSTALMENT_FUTURE_mean=('CNT_INSTALMENT_FUTURE', 'mean')
    ).reset_index()
    
    # Rename columns with prefix
    pos_cash_agg.columns = ['SK_ID_CURR'] + ['pos_cash_' + col for col in pos_cash_agg.columns[1:]]
    
    print("Aggregated POS cash balance data successfully.")
    return pos_cash_agg

def preprocess_installments(installments_payments):
    print("Starting preprocess_installments")
    # Ensure 'SK_ID_CURR' exists in 'installments_payments'
    if 'SK_ID_CURR' not in installments_payments.columns:
        raise KeyError("'SK_ID_CURR' column is missing from 'installments_payments' DataFrame.")
    
    # Proceed to aggregate
    installments_agg = installments_payments.groupby('SK_ID_CURR').agg(
        NUM_INSTALMENT_VERSION_mean=('NUM_INSTALMENT_VERSION', 'mean'),
        NUM_INSTALMENT_NUMBER_mean=('NUM_INSTALMENT_NUMBER', 'mean'),
        DAYS_INSTALMENT_mean=('DAYS_INSTALMENT', 'mean'),
        DAYS_ENTRY_PAYMENT_mean=('DAYS_ENTRY_PAYMENT', 'mean'),
        AMT_INSTALMENT_sum=('AMT_INSTALMENT', 'sum'),
        AMT_PAYMENT_sum=('AMT_PAYMENT', 'sum')
    ).reset_index()
    
    # Rename columns with prefix
    installments_agg.columns = ['SK_ID_CURR'] + ['installments_' + col for col in installments_agg.columns[1:]]
    
    print("Aggregated installments_agg successfully.")
    return installments_agg

def preprocess_data(is_train=True):
    data_dir = '../data/home-credit-default-risk/'
    application, bureau, bureau_balance, credit_card_balance, POS_CASH_balance, installments_payments, previous_application = load_data(data_dir, is_train=is_train)
    
    # Preprocess each dataset
    application = preprocess_application(application, is_train=is_train)
    previous_app_agg = preprocess_previous_application(previous_application, is_train=is_train)
    bureau_agg = preprocess_bureau(bureau, bureau_balance)
    credit_card_agg = preprocess_credit_card(credit_card_balance)
    pos_cash_agg = preprocess_POS_cash(POS_CASH_balance)
    installments_agg = preprocess_installments(installments_payments)
    
    # Merge all datasets
    print("Starting to merge all datasets.")
    df = application.merge(bureau_agg, on='SK_ID_CURR', how='left') \
                      .merge(credit_card_agg, on='SK_ID_CURR', how='left') \
                      .merge(pos_cash_agg, on='SK_ID_CURR', how='left') \
                      .merge(installments_agg, on='SK_ID_CURR', how='left') \
                      .merge(previous_app_agg, on='SK_ID_CURR', how='left')
    
    # Handle Aggregated Dictionary Columns
    if 'CREDIT_ACTIVE_counts' in df.columns:
        print("Handling 'CREDIT_ACTIVE_counts' with One-Hot Encoding.")
        credit_active_df = pd.json_normalize(df['CREDIT_ACTIVE_counts'])
        credit_active_df.columns = ['CREDIT_ACTIVE_' + str(col) for col in credit_active_df.columns]
        df = pd.concat([df.drop(['CREDIT_ACTIVE_counts'], axis=1), credit_active_df], axis=1)
    
    if 'CREDIT_CURRENCY_counts' in df.columns:
        print("Handling 'CREDIT_CURRENCY_counts' with One-Hot Encoding.")
        credit_currency_df = pd.json_normalize(df['CREDIT_CURRENCY_counts'])
        credit_currency_df.columns = ['CREDIT_CURRENCY_' + str(col) for col in credit_currency_df.columns]
        df = pd.concat([df.drop(['CREDIT_CURRENCY_counts'], axis=1), credit_currency_df], axis=1)
    
    # Handle missing values
    imputer = SimpleImputer(strategy='median')
    df_numeric = df.select_dtypes(include=['int64', 'float64'])
    df_numeric_imputed = pd.DataFrame(imputer.fit_transform(df_numeric), columns=df_numeric.columns)
    
    # Encode categorical variables
    categorical_cols = df.select_dtypes(include=['object']).columns
    label_encoders = {}
    for col in categorical_cols:
        le = LabelEncoder()
        df[col] = df[col].fillna('Missing').astype(str)
        df[col] = le.fit_transform(df[col])
        label_encoders[col] = le
    
    # Combine numeric and categorical data
    df_processed = pd.concat([df_numeric_imputed, df[categorical_cols]], axis=1)
    
    # Save preprocessed data
    if is_train:
        processed_path = '../data/processed/application_train_processed.csv'
        label_encoder_path = '../model/label_encoders_train.pkl'
        print("Saving preprocessed training data.")
    else:
        processed_path = '../data/processed/application_test_processed.csv'
        label_encoder_path = '../model/label_encoders_test.pkl'
        print("Saving preprocessed test data.")
    
    df_processed.to_csv(processed_path, index=False)
    joblib.dump(label_encoders, label_encoder_path)
    print(f'Preprocessed data saved to {processed_path}')
    print(f'Label encoders saved to {label_encoder_path}')

def main():
    # Process training data
    print("Processing training data.")
    preprocess_data(is_train=True)
    
    # Process test data
    print("Processing test data.")
    preprocess_data(is_train=False)

if __name__ == "__main__":
    main()
