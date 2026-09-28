# Kaggle Learn — Intro to Machine Learning
# Exercise 4: Model Validation

# --- Setup (already present): loads data, defines y, X, iowa_model ---

# --- Step 1: Split Your Data ---
from sklearn.model_selection import train_test_split
train_X, val_X, train_y, val_y = train_test_split(X, y, random_state=1)
step_1.check()

# --- Step 2: Specify and Fit the Model ---
iowa_model = DecisionTreeRegressor(random_state=1)
iowa_model.fit(train_X, train_y)
step_2.check()

# --- Step 3: Make Predictions with Validation Data ---
val_predictions = iowa_model.predict(val_X)
step_3.check()

# --- Inspect predictions vs actuals (helper cell) ---
print(val_predictions[:5])
print(val_y.head().tolist())

# --- Step 4: Calculate the Mean Absolute Error in Validation Data ---
from sklearn.metrics import mean_absolute_error
val_mae = mean_absolute_error(val_y, val_predictions)
print(val_mae)
step_4.check()
