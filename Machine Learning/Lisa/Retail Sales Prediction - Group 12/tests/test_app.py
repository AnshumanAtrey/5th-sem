"""The Streamlit app, driven the way a user would: several inputs, bad inputs, what-if changes."""
from pathlib import Path

import pandas as pd
import pytest
from streamlit.testing.v1 import AppTest

APP = str(Path(__file__).resolve().parents[1] / "app.py")


def app(store=None, dept=None, week=None):
    at = AppTest.from_file(APP, default_timeout=120).run()
    for key, value in (("store", store), ("dept", dept), ("week", week)):
        if value is not None:
            at.selectbox(key=key).set_value(pd.Timestamp(value) if key == "week" else value).run()
    assert not at.exception
    return at


def dollars(text):
    return float(text.replace("$", "").replace(",", ""))


def forecast_and_range(at):
    low, high = (dollars(v) for v in at.metric[0].delta.removeprefix("80% range: ").split(" – "))
    return dollars(at.metric[0].value), low, high


def messages(at):
    return " ".join(m.value for m in [*at.error, *at.warning, *at.info, *at.success])


def test_default_view_is_a_real_next_week_forecast():
    at = app()
    assert at.metric[0].label == "Forecast weekly sales" and dollars(at.metric[0].value) > 0
    assert at.metric[2].value == "future week" and "data ends" in at.metric[2].delta
    assert "genuine forecast" in messages(at)


@pytest.mark.parametrize("store, dept, week", [
    (1, 1, "2012-10-26"),    # ordinary unseen test week
    (20, 92, "2012-09-07"),  # Labor Day, one of the biggest departments
    (44, 3, "2012-07-06"),   # small Type C store
    (35, 72, "2011-11-25"),  # Thanksgiving, electronics
    (4, 38, "2012-11-02"),   # next week, real forecast
])
def test_many_inputs_give_a_sane_forecast_and_range(store, dept, week):
    at = app(store, dept, week)
    forecast, low, high = forecast_and_range(at)
    assert 0 <= low <= forecast <= high
    if week < "2012-11-02":
        assert at.metric[2].value.startswith("$")  # actual sales shown for past weeks


def test_holiday_week_is_detected_and_warned_about():
    at = app(35, 72, "2011-11-25")
    assert at.selectbox(key="kind").value == "Thanksgiving week"
    assert "single season" in messages(at) and "training data" in messages(at)


def test_department_without_a_year_of_history_is_rejected():
    at = app(16, 83, "2011-09-02")  # this department only starts in June 2011
    assert at.error and "Not enough history" in at.error[0].value
    assert not at.metric  # no forecast is shown


def test_negative_promotion_is_not_accepted():
    at = app(1, 1, "2012-10-26")
    at.number_input(key="promo").set_value(-100).run()
    assert not at.exception and at.number_input(key="promo").value >= 0


def test_what_if_changes_forecast_and_hides_actual():
    at = app(1, 1, "2012-10-26")
    before = dollars(at.metric[0].value)
    at.number_input(key="lag1").set_value(at.number_input(key="lag1").value * 2).run()
    assert dollars(at.metric[0].value) != before
    assert at.metric[2].value == "n/a (what-if)"  # actual no longer applies to a made-up week


def test_new_week_resets_the_what_if_inputs():
    at = app(35, 72, "2012-10-26")
    at.selectbox(key="kind").set_value("Thanksgiving week").run()
    at.selectbox(key="week").set_value(pd.Timestamp("2012-09-07")).run()
    assert at.selectbox(key="kind").value == "Labor Day week"
