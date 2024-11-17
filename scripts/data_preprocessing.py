# scripts/data_preprocessing.py

import pandas as pd
import numpy as np
import os
import joblib
from sklearn.preprocessing import LabelEncoder
from sklearn.impute import SimpleImputer

# -------------------------------
# Feature Engineering Functions
# -------------------------------

def create_age_group(df):
    """
    Creates 'Age' and 'Age_Group' features from 'DAYS_BIRTH'.
    """
    if 'DAYS_BIRTH' not in df.columns:
        raise KeyError("'DAYS_BIRTH' column is missing from the DataFrame.")
    
    df['Age'] = (-df['DAYS_BIRTH'] / 365).astype(int)
    bins = [0, 25, 35, 45, 55, 65, 100]
    labels = ['<25', '25-34', '35-44', '45-54', '55-64', '65+']
    df['Age_Group'] = pd.cut(df['Age'], bins=bins, labels=labels, right=False)
    print("Created 'Age_Group'")
    return df

def encode_marital_status(df):
    """
    Encodes 'Marital_Status' based on 'NAME_FAMILY_STATUS'.
    """
    if 'NAME_FAMILY_STATUS' not in df.columns:
        df['Marital_Status'] = 'Unknown'
    else:
        df['Marital_Status'] = df['NAME_FAMILY_STATUS']
        # Simplify categories
        marital_mapping = {
            'Married': 'Married',
            'Single / not married': 'Single',
            'Civil marriage': 'Married',
            'Separated': 'Separated',
            'Widow': 'Widow',
            'Unknown': 'Unknown'
        }
        df['Marital_Status'] = df['Marital_Status'].map(marital_mapping)
        # Handle missing values
        df['Marital_Status'] = df['Marital_Status'].fillna('Unknown')
    print("Encoded 'Marital_Status'")
    return df

def calculate_dependents(df):
    """
    Calculates 'Number_of_Dependents' using 'CNT_CHILDREN'.
    """
    if 'CNT_CHILDREN' not in df.columns:
        df['Number_of_Dependents'] = 0
    else:
        df['Number_of_Dependents'] = df['CNT_CHILDREN']
    print("Calculated 'Number_of_Dependents'")
    return df

def determine_employment_status(df):
    """
    Determines 'Employment_Status' based on 'DAYS_EMPLOYED'.
    """
    if 'DAYS_EMPLOYED' not in df.columns:
        df['Employment_Status'] = 'Unemployed'
    else:
        df['Employment_Status'] = df['DAYS_EMPLOYED'].apply(
            lambda x: 'Employed' if x > 0 else 'Unemployed'
        )
    print("Determined 'Employment_Status'")
    return df

def income_bracket(df):
    """
    Creates 'Income_Bracket' by categorizing 'AMT_INCOME_TOTAL'.
    """
    if 'AMT_INCOME_TOTAL' not in df.columns:
        raise KeyError("'AMT_INCOME_TOTAL' column is missing from the DataFrame.")
    
    bins = [0, 30000, 60000, 90000, 120000, 150000, 1e6]
    labels = ['<30k', '30k-60k', '60k-90k', '90k-120k', '120k-150k', '150k+']
    df['Income_Bracket'] = pd.cut(df['AMT_INCOME_TOTAL'], bins=bins, labels=labels, right=False)
    print("Created 'Income_Bracket'")
    return df

def approximate_household(df):
    """
    Creates 'Approx_Household' using 'CNT_FAM_MEMBERS'.
    """
    if 'CNT_FAM_MEMBERS' not in df.columns:
        df['Approx_Household'] = 1  # Assuming at least 1 member
    else:
        df['Approx_Household'] = df['CNT_FAM_MEMBERS']
    print("Created 'Approx_Household'")
    return df

def estimate_savings(df):
    """
    Estimates 'Approx_Savings' based on income and expenses.
    """
    # Check necessary columns
    required_columns = ['AMT_INCOME_TOTAL', 'AMT_ANNUITY', 'AMT_CREDIT']
    for col in required_columns:
        if col not in df.columns:
            raise KeyError(f"'{col}' column is missing from the DataFrame.")
    
    # Estimate monthly income
    df['Monthly_Income'] = df['AMT_INCOME_TOTAL'] / 12
    
    # Estimate monthly expenses (Placeholder estimations)
    df['Monthly_Rent_Mortgage'] = df['AMT_ANNUITY'] / 12  # Assuming AMT_ANNUITY relates to mortgage
    df['Monthly_Loan_Payments'] = df['AMT_CREDIT'] / 1000  # Arbitrary estimation
    
    # Calculate approximate savings
    expense_cols = ['Monthly_Rent_Mortgage', 'Monthly_Loan_Payments']
    df['Approx_Savings'] = df['Monthly_Income'] - df[expense_cols].sum(axis=1)
    # Handle negative savings
    df['Approx_Savings'] = df['Approx_Savings'].apply(lambda x: x if x > 0 else 0)
    
    print("Estimated 'Approx_Savings'")
    return df

def estimate_utilities(df):
    """
    Estimates 'Monthly_Utilities' as a percentage of 'AMT_GOODS_PRICE'.
    """
    if 'AMT_GOODS_PRICE' not in df.columns:
        df['Monthly_Utilities'] = 0
    else:
        df['Monthly_Utilities'] = df['AMT_GOODS_PRICE'] * 0.01  # Adjust as needed
    print("Estimated 'Monthly_Utilities'")
    return df

def estimate_insurance(df):
    """
    Estimates 'Monthly_Insurance' as a percentage of 'AMT_ANNUITY'.
    """
    if 'AMT_ANNUITY' not in df.columns:
        df['Monthly_Insurance'] = 0
    else:
        df['Monthly_Insurance'] = df['AMT_ANNUITY'] * 0.05  # Adjust as needed
    print("Estimated 'Monthly_Insurance'")
    return df

def estimate_subscriptions(df):
    """
    Estimates 'Monthly_Subscriptions' with a fixed value.
    """
    df['Monthly_Subscriptions'] = 20  # Fixed amount in currency units
    print("Estimated 'Monthly_Subscriptions'")
    return df

def estimate_food_costs(df):
    """
    Estimates 'Monthly_Food_Costs' based on 'Number_of_Dependents'.
    """
    if 'Number_of_Dependents' not in df.columns:
        df['Monthly_Food_Costs'] = 150  # Default value
    else:
        df['Monthly_Food_Costs'] = df['Number_of_Dependents'] * 150  # Example value per dependent
    print("Estimated 'Monthly_Food_Costs'")
    return df

def estimate_misc_costs(df):
    """
    Estimates 'Monthly_Misc_Costs' as remaining income after other expenses.
    """
    expense_cols = [
        'Monthly_Rent_Mortgage', 'Monthly_Loan_Payments',
        'Monthly_Utilities', 'Monthly_Insurance',
        'Monthly_Subscriptions', 'Monthly_Food_Costs'
    ]
    
    # Check if all expense columns exist
    missing_expenses = [col for col in expense_cols if col not in df.columns]
    if missing_expenses:
        raise KeyError(f"The following expense columns are missing for estimating 'Monthly_Misc_Costs': {missing_expenses}")
    
    df['Monthly_Misc_Costs'] = df['Monthly_Income'] - df[expense_cols].sum(axis=1)
    df['Monthly_Misc_Costs'] = df['Monthly_Misc_Costs'].apply(lambda x: x if x > 0 else 0)
    print("Estimated 'Monthly_Misc_Costs'")
    return df

def feature_engineering(df):
    """
    Applies all feature engineering functions to the DataFrame.
    """
    df = create_age_group(df)
    df = encode_marital_status(df)
    df = calculate_dependents(df)
    df = determine_employment_status(df)
    df = income_bracket(df)
    df = approximate_household(df)
    df = estimate_savings(df)
    df = estimate_utilities(df)
    df = estimate_insurance(df)
    df = estimate_subscriptions(df)
    df = estimate_food_costs(df)
    df = estimate_misc_costs(df)
    print("Completed feature engineering.")
    return df

# -------------------------------
# Data Loading and Preprocessing
# -------------------------------

def mode_or_default(x):
    """Returns the mode of the series or 'C' if no mode exists."""
    return x.mode()[0] if not x.mode().empty else 'C'

def value_counts_dict(x):
    """Returns a dictionary of value counts."""
    return x.value_counts().to_dict()

def load_data(data_dir, is_train=True):
    """
    Loads primary datasets and normalizes column names.
    """
    try:
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
        
        print(f"Loaded data from {data_dir}")
        return application, bureau, bureau_balance, credit_card_balance, POS_CASH_balance, installments_payments, previous_application
    except Exception as e:
        print(f"Error loading data: {e}")
        raise

def preprocess_application(application_train, is_train=True):
    """
    Preprocesses the application data by dropping unnecessary columns.
    """
    # Drop only unnecessary ID columns, retain 'SK_ID_CURR' or 'SK_ID_TEST'
    columns_to_drop = ['SK_ID_BUREAU']
    existing_columns_to_drop = [col for col in columns_to_drop if col in application_train.columns]
    application_train = application_train.drop(existing_columns_to_drop, axis=1, errors='ignore')
    print("Preprocessed application data.")
    return application_train

def preprocess_previous_application(previous_application, is_train=True):
    """
    Preprocesses the previous application data by encoding categorical variables and aggregating.
    """
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
    print("Preprocessed previous application data.")
    
    return previous_app_agg

def preprocess_bureau(bureau, bureau_balance):
    """
    Preprocesses the bureau data by merging with bureau_balance and aggregating.
    """
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
    
    print("Preprocessed bureau data.")
    return bureau_agg

def preprocess_credit_card(credit_card_balance):
    """
    Preprocesses the credit card balance data by aggregating.
    """
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
    """
    Preprocesses the POS cash balance data by aggregating.
    """
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
    """
    Preprocesses the installments payments data by aggregating.
    """
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

# -------------------------------
# Main Preprocessing Function
# -------------------------------

def preprocess_data(is_train=True):
    """
    Main function to preprocess data for training or testing.
    """
    data_dir = '../data/home-credit-default-risk/'
    
    try:
        # Load data
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
        
        # Feature Engineering
        print("Starting feature engineering.")
        df = feature_engineering(df)
        
        # Handle missing values
        print("Handling missing values.")
        imputer = SimpleImputer(strategy='median')
        df_numeric = df.select_dtypes(include=['int64', 'float64'])
        df_numeric_imputed = pd.DataFrame(imputer.fit_transform(df_numeric), columns=df_numeric.columns)
        
        # Encode categorical variables
        print("Encoding categorical variables.")
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns
        label_encoders = {}
        for col in categorical_cols:
            le = LabelEncoder()
            # Convert categorical columns to string type to avoid issues with new categories
            df[col] = df[col].astype(str)
            df[col] = df[col].fillna('Missing')  # Fill any remaining NaNs with 'Missing'
            df[col] = le.fit_transform(df[col])
            label_encoders[col] = le
            print(f"Encoded '{col}'")
        
        # Combine numeric and categorical data
        print("Combining numeric and categorical data.")
        df_processed = pd.concat([df_numeric_imputed, df[categorical_cols]], axis=1)
        
        # Save preprocessed data
        os.makedirs('../data/processed/', exist_ok=True)
        os.makedirs('../model/', exist_ok=True)
        
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
        
    except Exception as e:
        print(f"An error occurred during preprocessing: {e}")
        raise

# -------------------------------
# Main Execution
# -------------------------------

def main():
    # Process training data
    print("Processing training data.")
    preprocess_data(is_train=True)
    
    # Process test data
    print("Processing test data.")
    preprocess_data(is_train=False)

if __name__ == "__main__":
    main()