"""Feature pipeline on a hand-made 60-week example where every right answer is known."""
import sys
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src"))
from features import MARKDOWNS, TARGET, build_table, model_rows  # noqa: E402

WEEKS = pd.date_range("2010-02-05", periods=60, freq="7D")


def toy(sales_values=None):
    values = np.arange(60) * 10.0 + 100 if sales_values is None else sales_values
    sales = pd.DataFrame({"Store": 1, "Dept": 1, "Date": WEEKS, TARGET: values, "IsHoliday": False})
    sales.loc[5, TARGET] = -50.0  # a week of net returns
    sales = sales.drop(index=10)  # a week with no record at all
    feats = pd.DataFrame({"Store": 1, "Date": pd.date_range("2010-02-05", periods=61, freq="7D"),
                          "Temperature": 50.0, "Fuel_Price": 3.0, "CPI": 200.0, "Unemployment": 7.0, "IsHoliday": False})
    for c in MARKDOWNS:
        feats[c] = np.nan
    feats.loc[3, ["MarkDown1", "MarkDown2"]] = [500.0, -20.0]
    feats.loc[feats.Date.isin(pd.to_datetime(["2010-11-26", "2010-12-31"])), "IsHoliday"] = True
    stores = pd.DataFrame({"Store": [1], "Type": ["A"], "Size": [150000]})
    return sales, feats, stores


def week(df, i):
    return df[df.Date == WEEKS[0] + pd.Timedelta(weeks=i)].iloc[0]


def test_one_row_per_week_plus_the_forecast_week():
    df = build_table(*toy())
    assert len(df) == 61
    assert not week(df, 10).observed and not week(df, 60).observed and week(df, 59).observed


def test_lags_look_back_the_right_number_of_weeks():
    df = build_table(*toy())
    assert week(df, 9).sales_lag_1 == 180 and week(df, 9).sales_lag_2 == 170
    assert week(df, 9).sales_roll4 == (180 + 170 + 160 + 0) / 4  # 4 weeks back is the returns week, clipped to 0
    assert week(df, 55).sales_lag_52 == 130
    assert week(df, 57).sales_yoy_jump == 0 - (110 + 120 + 130 + 140) / 4


def test_returns_count_as_zero_and_missing_weeks_count_as_no_sales():
    df = build_table(*toy())
    assert week(df, 5)[TARGET] == 0
    assert week(df, 6).sales_lag_1 == 0
    assert week(df, 11).sales_lag_1 == 0


def test_promotion_markdowns():
    df = build_table(*toy())
    assert week(df, 3).promo_markdown == 500 and week(df, 3).markdown_reported == 1
    assert week(df, 4).promo_markdown == 0 and week(df, 4).markdown_reported == 0


def test_holiday_features_from_the_date():
    df = build_table(*toy()).set_index("Date")
    assert df.loc["2010-11-26", "hol_thanksgiving"] == 1
    assert df.loc["2010-12-31", "hol_christmas"] == 1
    assert df.loc["2010-12-17", "pre_christmas"] == 1 and df.loc["2010-12-24", "pre_christmas"] == 1
    assert df.loc["2010-12-10", "pre_christmas"] == 0 and df.loc["2010-12-10", "hol_christmas"] == 0


def test_only_rows_with_56_weeks_of_history_are_used():
    rows = model_rows(build_table(*toy()))
    assert rows.Date.min() == WEEKS[56] and len(rows) == 4


def test_no_peeking_at_the_week_being_predicted():
    values = np.arange(60) * 10.0 + 100
    changed = values.copy()
    changed[57] = 99999
    a, b = build_table(*toy(values)), build_table(*toy(changed))
    cols = ["sales_lag_1", "sales_lag_2", "sales_roll4", "sales_lag_52", "sales_yoy_jump"]
    assert week(a, 57)[cols].equals(week(b, 57)[cols])  # this week's own sales never feed its inputs
    assert week(b, 58).sales_lag_1 == 99999  # ...but they do feed next week's
