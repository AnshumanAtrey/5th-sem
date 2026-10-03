# Individual contribution record — Group 12 (Retailligence)

The brief asks for an individual contribution record and says every member must be ready for an individual viva.
One row per member with what they **actually** did. Each member can explain their part end to end.

| Member | Roll no. | Owned (what they did) | Can explain in the viva |
|---|---|---|---|
| Anshuman Atrey | 150096724029 | **Model comparison (the main modelling work):** baselines vs linear vs polynomial regression, the time-ordered train/test design, 5-fold cross-validation on training weeks, feature selection, choosing the polynomial degree, the final test on 17 unseen weeks and the error analysis (notebook §7–14, report slides 23–29) | why we never train on future weeks, why polynomial degree 2 won, what MAE / RMSE / R² mean here, how the model beats "next week = last week" by 17.9%, where it misses (holiday weeks) |
| Shlok Kadam | 150096724103 | **Deployment and the app around the model:** the Streamlit app (`app.py`), saving and loading the model, the input checks and what-if inputs, the app tests (`tests/`), and putting it live on Streamlit Community Cloud (report slides 30–32) | how the app loads `models/best_model.joblib` and builds a forecast, what each input does, how bad inputs are caught, how the live deploy works (the root `streamlit_app.py`) |
| Rajneesh Kumar | 150096724144 | **EDA:** the exploratory charts and what they say, sales over time, store types and sizes, departments, the holiday effect, monthly seasonality, markdowns vs sales and the correlations (notebook §6, report slides 15–22) | what the data shows: history carries the forecast (last week 0.96, same week last year 0.98), holidays multiply sales (Thanksgiving ≈1.43×), markdowns look strong but its really store size |

Suggested split so that every viva topic in the brief has an owner:

| Area | Where it lives |
|---|---|
| Problem definition, dataset and data classification | notebook §1–3 · report slides 5–11 |
| Cleaning, preprocessing and feature engineering | `src/features.py` · notebook §4–5 · slides 12–14 |
| EDA and interpretation | notebook §6 · slides 15–22 |
| Models, validation and evaluation | notebook §7–14 · slides 23–29 |
| Streamlit app and testing | `app.py`, `tests/` · slides 30–32 |
