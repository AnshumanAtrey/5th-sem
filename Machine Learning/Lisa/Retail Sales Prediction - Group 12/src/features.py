"""Load the Walmart files and build one model-ready row per (store, department, week).

Every input for week t is known before week t starts: sales from earlier weeks,
the calendar, and the store's promotion / economic figures for week t.
Used by eda.py, train.py and app.py so all three see exactly the same features.
"""
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
TARGET = "Weekly_Sales"
KEYS = ["Store", "Dept", "Date"]
MARKDOWNS = [f"MarkDown{i}" for i in range(1, 6)]

HISTORY = ["sales_lag_1", "sales_lag_2", "sales_roll4", "sales_lag_52", "sales_yoy_jump"]
HOLIDAYS = ["hol_super_bowl", "hol_labor_day", "hol_thanksgiving", "hol_christmas", "pre_christmas"]
POLY = HISTORY + ["promo_markdown"] + HOLIDAYS  # the polynomial model squares and multiplies these
LINEAR = ["Size", "markdown_reported"]
CATEGORICAL = ["Type", "month", "Dept"]
FEATURES = POLY + LINEAR + CATEGORICAL
# Tested in train.py's feature-selection step and left out: they did not lower cross-validated error.
ECONOMIC = ["Temperature", "Fuel_Price", "CPI", "Unemployment"]

HOLIDAY_MONTH = {"hol_super_bowl": 2, "hol_labor_day": 9, "hol_thanksgiving": 11, "hol_christmas": 12}


def load_raw(data_dir=DATA):
    sales = pd.read_csv(data_dir / "train.csv", parse_dates=["Date"])
    feats = pd.read_csv(data_dir / "features.csv", parse_dates=["Date"])
    stores = pd.read_csv(data_dir / "stores.csv")
    return sales, feats, stores


def build_table(sales, feats, stores):
    """Rows run from each department's first recorded week to ONE week past the data
    (that extra week has no target: it is the week the app forecasts)."""
    sales = sales.assign(**{TARGET: sales[TARGET].clip(lower=0)})  # net returns are not demand
    weeks = pd.date_range(sales.Date.min(), sales.Date.max() + pd.Timedelta(weeks=1), freq="7D")
    first = sales.groupby(["Store", "Dept"]).Date.min().rename("first").reset_index()
    grid = first.merge(pd.DataFrame({"Date": weeks}), how="cross")
    grid = grid[grid.Date >= grid["first"]].drop(columns="first")
    df = grid.merge(sales.drop(columns="IsHoliday"), on=KEYS, how="left").sort_values(KEYS, ignore_index=True)
    df["observed"] = df[TARGET].notna()

    # Historical sales. A week with no record counts as a week with no sales.
    past = df[TARGET].fillna(0).groupby([df.Store, df.Dept])
    lag = {k: past.shift(k) for k in (1, 2, 3, 4, 52, 53, 54, 55, 56)}
    df["sales_lag_1"], df["sales_lag_2"], df["sales_lag_52"] = lag[1], lag[2], lag[52]
    df["sales_roll4"] = (lag[1] + lag[2] + lag[3] + lag[4]) / 4
    # Last year, how far did this week jump above (or fall below) the 4 weeks before it?
    df["sales_yoy_jump"] = lag[52] - (lag[53] + lag[54] + lag[55] + lag[56]) / 4

    # Promotion: 5 anonymised markdown columns, only reported from Nov 2011 → total + "was it reported?"
    feats = feats.assign(
        promo_markdown=feats[MARKDOWNS].clip(lower=0).sum(axis=1),  # missing counts as 0
        markdown_reported=feats[MARKDOWNS].notna().any(axis=1).astype(int),
    ).drop(columns=MARKDOWNS)
    df = df.merge(feats, on=["Store", "Date"], how="left").merge(stores, on="Store", how="left")

    # Date/time features.
    df["year"], df["month"] = df.Date.dt.year, df.Date.dt.month
    df["week_of_year"] = df.Date.dt.isocalendar().week.astype(int)
    for col, month in HOLIDAY_MONTH.items():
        df[col] = (df.IsHoliday & (df.month == month)).astype(int)
    christmas = pd.to_datetime(pd.DataFrame({"year": df.year, "month": 12, "day": 25}))
    df["pre_christmas"] = (christmas - df.Date).dt.days.between(1, 14).astype(int)  # 2 biggest weeks, not flagged in data
    return df


def model_rows(df):
    """Rows the model can learn from: a real recorded week with 56 weeks of history behind it."""
    return df[df.observed & df.sales_yoy_jump.notna()]
