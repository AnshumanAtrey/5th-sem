"""Retail Store Sales Predictor — run with:  streamlit run app.py"""
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import streamlit as st

ROOT = Path(__file__).resolve().parent
MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


@st.cache_resource
def load():
    return joblib.load(ROOT / "models" / "best_model.joblib")


bundle = load()
model, ranges = bundle["pipeline"], bundle["ranges"]

st.set_page_config(page_title="Retail Sales Predictor", page_icon="🛒")
st.title("🛒 Retail Store Sales Predictor")
st.caption(f"Model: **{bundle['name']}** · trained on 48 stores × 36 months · tested on 12 stores it never saw")

c1, c2 = st.columns(2)
size = c1.slider("Store size (sq ft)", 2000, 15000, 7000, step=100)
staff = c1.slider("Number of staff", 5, 30, 10)
location = c1.selectbox("Location type", ["Urban", "Semi-Urban", "Rural"])
promo = c2.slider("Promotional spend (₹ thousand / month)", 0, 520, 100, step=10)
comp_known = c2.checkbox("I know the competitor distance", value=True)
comp = c2.slider("Nearest competitor (km)", 0.1, 25.0, 2.0, step=0.1) if comp_known else np.nan
month = c2.selectbox("Month", range(1, 13), index=5, format_func=lambda m: MONTHS[m - 1])

row = pd.DataFrame([{"store_size_sqft": size, "num_staff": staff, "promo_spend_k": promo,
                     "competitor_distance_km": comp, "location_type": location, "month": month}])
pred = float(model.predict(row)[0])
e80, e90 = bundle["error_p80"], bundle["error_p90"]

st.metric("Predicted monthly sales", f"₹{pred:.2f} lakh")
st.write(f"**Expected error range:** 8 out of 10 new-store predictions landed within **±₹{e80:.2f} lakh** "
         f"(₹{pred - e80:.1f}–{pred + e80:.1f} L); 9 out of 10 within ±₹{e90:.2f} lakh.")

if promo > 400:
    st.warning("Promo above ₹400k was only seen in festive months, and the polynomial curve bends down here. "
               "Treat this prediction as unreliable — real returns flatten, they don't fall.")
if not comp_known:
    st.info("Competitor distance missing → the model fills in the typical (median) value, like it did in training.")

st.subheader("What if I change promo spend for this store?")
grid = np.arange(0, 401, 20)
what = row.loc[row.index.repeat(len(grid))].reset_index(drop=True)
what["promo_spend_k"] = grid
curve = pd.DataFrame({"Promo spend (₹k)": grid, "Predicted sales (₹ lakh)": model.predict(what)}).set_index("Promo spend (₹k)")
st.line_chart(curve)
gain_first = curve.iloc[5, 0] - curve.iloc[0, 0]
gain_last = curve.iloc[-1, 0] - curve.iloc[-6, 0]
st.write(f"First ₹100k of promo adds **₹{gain_first:.2f} L**; the last ₹100k (300→400k) adds **₹{gain_last:.2f} L** — diminishing returns.")
