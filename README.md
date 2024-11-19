# hackutd2024

## Before Running

1. create .env file with following: (you will need a database URL as well...)
`MODEL_PATH=../model/lightgbm_model.pkl`
`LABEL_ENCODERS_PATH=../model/label_encoders.pkl`
2. change directories into back-end
3. download dataset from kaggle called home credit default risk. place csvs inside data/home-credit-default-risk.
3. run `python3 data_preprocessing.py`
4. run `python3 train_model.py`
5. run `python3 predict_model.py`

## How to run FastAPI

1. install the library:  `pip install fastapi uvicorn`
2. Modify the code as you see needed
3. install dependencies as necessary
4. run the server by typing: `uvicorn main:app --reload`

P.S. By default, API should be visible at this local address: `http://127.0.0.1:8000`

## How to run the website

1. go to the `front-end` folder (cd front-end)
2. type `npm i` in the terminal (npm i)
3. install dependencies as necessary
4. type `npm run dev`
5. Open local hosted link
