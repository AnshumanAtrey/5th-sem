# Kaggle Learn — Intro to Machine Learning
# Exercise 6: Random Forests

# --- Setup (already present): loads data, splits into train_X/val_X/train_y/val_y ---

# --- Step 1: Use a Random Forest ---
from sklearn.ensemble import RandomForestRegressor

rf_model = RandomForestRegressor(random_state=1)
rf_model.fit(train_X, train_y)
rf_val_mae = mean_absolute_error(val_y, rf_model.predict(val_X))

print("Validation MAE for Random Forest Model: {}".format(rf_val_mae))
step_1.check()
