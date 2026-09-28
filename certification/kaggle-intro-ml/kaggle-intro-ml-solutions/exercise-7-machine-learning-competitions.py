# Kaggle Learn — Intro to Machine Learning
# Exercise 7: Machine Learning Competitions
# Produces submission.csv for the Housing Prices competition

# --- Setup (already present): symlinks, imports, features, baseline model ---

# --- Train Random Forest on ALL training data ---
rf_model_on_full_data = RandomForestRegressor(random_state=1)
rf_model_on_full_data.fit(X, y)

# --- Make predictions on the test set ---
test_data_path = '../input/test.csv'
test_data = pd.read_csv(test_data_path)
test_X = test_data[features]
test_preds = rf_model_on_full_data.predict(test_X)

# --- Verify test_preds format ---
step_1.check()

# --- Generate submission.csv ---
output = pd.DataFrame({'Id': test_data.Id,
                       'SalePrice': test_preds})
output.to_csv('submission.csv', index=False)
