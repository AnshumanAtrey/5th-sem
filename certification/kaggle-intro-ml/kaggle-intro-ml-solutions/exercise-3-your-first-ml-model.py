# Kaggle Learn — Intro to Machine Learning
# Exercise 3: Your First Machine Learning Model

# --- Setup cell (already present) ---
# import pandas as pd
# iowa_file_path = '../input/home-data-for-ml-course/train.csv'
# home_data = pd.read_csv(iowa_file_path)
# from learntools.core import binder
# binder.bind(globals())
# from learntools.machine_learning.ex3 import *
# print("Setup Complete")

# --- Step 1: Specify Prediction Target ---
y = home_data.SalePrice
step_1.check()

# --- Step 2: Create X ---
feature_names = ['LotArea', 'YearBuilt', '1stFlrSF', '2ndFlrSF',
                 'FullBath', 'BedroomAbvGr', 'TotRmsAbvGrd']
X = home_data[feature_names]
step_2.check()

# --- Step 3: Specify and Fit Model ---
from sklearn.tree import DecisionTreeRegressor
iowa_model = DecisionTreeRegressor(random_state=1)
iowa_model.fit(X, y)
step_3.check()

# --- Step 4: Make Predictions ---
predictions = iowa_model.predict(X)
print(predictions)
step_4.check()
