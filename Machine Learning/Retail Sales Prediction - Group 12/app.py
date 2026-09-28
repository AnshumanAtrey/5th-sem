"""Retailligence — next-week department sales forecasting engine.  Run with:  streamlit run app.py"""
import sys
from pathlib import Path

import altair as alt
import joblib
import numpy as np
import pandas as pd
import streamlit as st

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT / "src"))
import theme  # noqa: E402
from features import FEATURES, HOLIDAYS, TARGET, build_table, load_raw  # noqa: E402

st.set_page_config(page_title="Retailligence · Sales Forecasting Engine", page_icon="🛒", layout="wide")
KINDS = {"Normal week": None, "Super Bowl week": "hol_super_bowl", "Labor Day week": "hol_labor_day",
         "Thanksgiving week": "hol_thanksgiving", "2 weeks before Christmas": "pre_christmas",
         "Christmas week": "hol_christmas"}
st.markdown(f"""<style>
.block-container {{padding-top: 2rem; max-width: 1250px;}}
.hero {{background: linear-gradient(135deg, #12306b 0%, #0e4d64 55%, #0d6b62 100%); border-radius: 18px;
        padding: 26px 32px; margin-bottom: 18px; border: 1px solid {theme.GRID};}}
.hero h1 {{font-size: 2.05rem; margin: 10px 0 4px; padding: 0; color: #fff;}}
.hero p {{color: #d5e4f5; margin: 0; font-size: 1.02rem;}}
.chip {{display: inline-block; background: rgba(255,255,255,.14); color: #fff; border-radius: 999px;
        padding: 3px 12px; font-size: .78rem; margin-right: 6px; font-weight: 600;}}
[data-testid="stMetric"] {{background: {theme.PANEL}; border-radius: 14px; padding: 16px 20px;}}
[data-testid="stMetricLabel"] p {{text-transform: uppercase; letter-spacing: .06em; font-size: .78rem; color: {theme.MUTED};}}
[data-testid="stMetricValue"] {{color: {theme.TEAL}; font-weight: 700;}}
.panel {{background: {theme.PANEL}; border: 1px solid {theme.GRID}; border-radius: 14px; padding: 16px 20px;}}
.panel table {{width: 100%; border-collapse: collapse; font-size: .92rem;}}
.panel td {{padding: 6px 0; border-bottom: 1px solid {theme.GRID};}}
.panel td:last-child {{text-align: right; font-weight: 600; color: {theme.TEXT};}}
.panel td:first-child {{color: {theme.MUTED};}}
.foot {{color: {theme.MUTED}; font-size: .8rem; margin-top: 24px;}}
</style>""", unsafe_allow_html=True)


@st.cache_resource
def load():
    return joblib.load(ROOT / "models" / "best_model.joblib"), build_table(*load_raw())


def money(v):
    return f"&#36;{v:,.0f}"  # HTML dollar sign: Streamlit reads a pair of "$" as a formula


def panel(title, rows):
    body = "".join(f"<tr><td>{k}</td><td>{v}</td></tr>" for k, v in rows)
    st.markdown(f"<div class='panel'><b>{title}</b><table>{body}</table></div>", unsafe_allow_html=True)


bundle, table = load()
model, bands, ranges = bundle["pipeline"], bundle["error_bands"], bundle["input_ranges"]
first_week, test_start = pd.Timestamp(bundle["train_weeks"][0]), pd.Timestamp(bundle["test_weeks"][0])
next_week = table.Date.max()
stores = table.drop_duplicates("Store").set_index("Store")[["Type", "Size"]].sort_index()

# ── Sidebar inputs ────────────────────────────────────────────────────────
with st.sidebar:
    st.header("🧭 Forecast inputs")
    store = st.selectbox("Store", list(stores.index), key="store",
                         format_func=lambda s: f"Store {s} · Type {stores.Type[s]} · {stores.Size[s]:,} sq ft")
    dept = st.selectbox("Department (product group)", sorted(table.loc[table.Store == store, "Dept"].unique()),
                        key="dept", format_func=lambda d: f"Dept {d}")
    series = table[(table.Store == store) & (table.Dept == dept)].set_index("Date")
    weeks = [w for w in series.index[::-1] if w >= first_week]
    week = st.selectbox("Week to forecast (week ending Friday)", weeks, key="week",
                        format_func=lambda w: f"{w.date()} · " + ("next week: real forecast" if w == next_week
                                                                  else "unseen test week" if w >= test_start
                                                                  else "training week"))

st.markdown(f"""<div class="hero">
<span class="chip">ML Fundamentals Mini Project</span><span class="chip">Group 12</span>
<span class="chip">{bundle['name']}</span>
<h1>🛒 Retailligence — Next-Week Sales Forecasting Engine</h1>
<p>Forecast next week's sales for any department of any of 45 Walmart stores from its sales history, holidays and
promotions, to plan stock and staff a week ahead.</p></div>""", unsafe_allow_html=True)

row = series.loc[week]
if pd.isna(row.sales_yoy_jump):
    st.error(f"Not enough history: Dept {dept} in Store {store} has {int((series.index < week).sum())} weeks of sales "
             f"before {week.date()}, but the model needs 56 (it compares with the same week last year). "
             "Pick a later week or another department.")
    st.stop()

calendar_kind = next((k for k, col in KINDS.items() if col and row[col] == 1), "Normal week")
promo_max, lag_max = ranges["promo_markdown"][1], ranges["sales_lag_1"][1]
if st.session_state.get("what_if_for") != (store, dept, week):  # new selection → start from its real values
    st.session_state.update(what_if_for=(store, dept, week), kind=calendar_kind,
                            promo=min(float(row.promo_markdown), promo_max), lag1=min(float(row.sales_lag_1), lag_max))
with st.sidebar:
    st.divider()
    st.subheader("🧪 What-if")
    promo = st.number_input("Total markdown (promotion) that week, $", 0.0, promo_max, step=1000.0, key="promo",
                            help=f"Limited to the range seen in training ($0 – ${promo_max:,.0f}).")
    kind = st.selectbox("Kind of week", list(KINDS), key="kind")
    lag1 = st.number_input("Last week's sales, $", 0.0, lag_max, step=500.0, key="lag1", help=f"Limited to the range seen in training ($0 – ${lag_max:,.0f}).")
    st.caption("Change any value to see how the forecast reacts. Picking a new store, department or week resets them.")

x = series.loc[[week], FEATURES].copy()
x["promo_markdown"] = promo
x["markdown_reported"] = int(row.markdown_reported == 1 or promo > 0)
for col in HOLIDAYS:
    x[col] = int(KINDS[kind] == col)
x["sales_roll4"] = row.sales_roll4 + (lag1 - row.sales_lag_1) / 4  # keep the 4-week average consistent
x["sales_lag_1"] = lag1
changed = promo != row.promo_markdown or kind != calendar_kind or lag1 != row.sales_lag_1

# ── Prediction ────────────────────────────────────────────────────────────
pred = float(np.clip(model.predict(x)[0], 0, None))
p80 = pred * bands["p80_pct"][int(np.searchsorted(bands["edges"], pred))]
rule = max(0.0, float(x.sales_roll4.iloc[0] + row.sales_yoy_jump))
actual = None if changed or pd.isna(row[TARGET]) else float(row[TARGET])

st.subheader(f"📊 Store {store} · Dept {dept} · week of {week.date()}")
m1, m2, m3 = st.columns(3)  # metric text is Markdown: never put two "$" in one string (it becomes a formula)
m1.metric("Forecast weekly sales", f"${pred:,.0f}", border=True, delta_color="off", delta_arrow="off",
          delta=f"80% range: {max(pred - p80, 0):,.0f} – {pred + p80:,.0f}",
          help="8 out of 10 test-period forecasts of this size landed within this range. "
               "The test weeks had no Thanksgiving or Christmas, so holiday misses can be larger.")
m2.metric("Rule-of-thumb check", f"${rule:,.0f}", border=True,
          help="Average of the last 4 weeks + how much this week jumped last year.")
m3.metric("Actual sales that week", "not known" if actual is None else f"${actual:,.0f}", border=True,
          delta=None if actual is None else f"model {'over' if pred > actual else 'under'} by ${abs(pred - actual):,.0f}",
          delta_color="off", delta_arrow="off")

if week == next_week:
    st.success(f"{week.date()} is after the last week in the data: this is a genuine forecast.")
elif week < test_start:
    st.info("This week was part of the model's training data, so it is not a fair test. "
            "Pick a week marked 'unseen test week' or 'next week' for an honest check.")
if kind != calendar_kind:
    st.warning(f"You changed the kind of week — the calendar says: {calendar_kind}.")
if KINDS[kind] in ("hol_thanksgiving", "pre_christmas", "hol_christmas"):
    st.warning("The model learned these big holiday effects from a single season (2011). In testing, the "
               "rule-of-thumb was more reliable on holiday weeks — compare both numbers above.")

# ── Chart: recent weeks, the same weeks last year, and the forecast ───────
recent = series.loc[week - pd.Timedelta(weeks=16): week - pd.Timedelta(weeks=1), TARGET].fillna(0)
last_year = series[TARGET].reindex(recent.index - pd.Timedelta(weeks=52)).to_numpy()
lines = pd.concat([pd.DataFrame({"Week": recent.index, "Sales": recent.to_numpy(), "Series": "Actual sales"}),
                   pd.DataFrame({"Week": recent.index, "Sales": last_year, "Series": "Same week last year"})])
points = pd.DataFrame({"Week": [week] * 2, "Sales": [pred, rule], "Series": ["Model forecast", "Rule-of-thumb"]})
if actual is not None:
    points.loc[len(points)] = [week, actual, "Actual (this week)"]
color = alt.Color("Series:N", legend=alt.Legend(title=None, orient="bottom"), scale=alt.Scale(
    domain=["Actual sales", "Same week last year", "Model forecast", "Rule-of-thumb", "Actual (this week)"],
    range=[theme.SKY, "#64748b", theme.TEAL, theme.AMBER, "#ffffff"]))
chart = (alt.Chart(lines).mark_line(point=True).encode(
             x=alt.X("Week:T", title=None), y=alt.Y("Sales:Q", title="Weekly sales ($)"), color=color)
         + alt.Chart(points).mark_point(size=220, filled=True, shape="diamond").encode(
             x="Week:T", y="Sales:Q", color=color))
st.markdown("##### 📈 The 16 weeks before, the same weeks last year, and this week's numbers")
st.altair_chart(chart, width="stretch")

# ── Snapshot + model details ──────────────────────────────────────────────
past_year = series.loc[week - pd.Timedelta(weeks=52): week - pd.Timedelta(weeks=1), TARGET]
left, right = st.columns(2)
with left:
    panel("🏬 Store & department snapshot", [
        ("Store format / size", f"Type {stores.Type[store]} · {stores.Size[store]:,} sq ft"),
        ("Average week, past year", money(past_year.mean())),
        ("Last 4 weeks' average", money(x.sales_roll4.iloc[0])),
        ("Same week last year", money(row.sales_lag_52)),
        ("Last year's jump for this week", f"{'+' if row.sales_yoy_jump >= 0 else '−'}{money(abs(row.sales_yoy_jump))}"),
        ("Kind of week", kind),
        ("Markdown (promotion) this week", money(promo)),
    ])
with right:
    t, r, n = bundle["test_metrics"], bundle["rule_test_metrics"], bundle["naive_test_metrics"]
    panel("🧠 Model performance (17 unseen test weeks)", [
        ("Algorithm", bundle["name"]),
        ("Trained on", f"{bundle['train_weeks'][0]} → {bundle['train_weeks'][1]}"),
        ("Test R²", f"{t['R2']:.3f}"),
        ("Test MAE / RMSE", f"{money(t['MAE'])} / {money(t['RMSE'])}"),
        ("Error cut vs last week's sales", f"{(1 - t['MAE'] / n['MAE']) * 100:.1f}%"),
        ("Error cut vs rule-of-thumb", f"{(1 - t['MAE'] / r['MAE']) * 100:.1f}%"),
        ("Group attribution", "Group 12 · ML Fundamentals"),
    ])
with st.expander("🔍 Inputs the model used for this forecast"):
    st.dataframe(x.T.rename(columns=lambda c: "value").astype(str))
st.markdown("<div class='foot'>Data: Walmart Recruiting – Store Sales Forecasting (Kaggle, 2014) · "
            "45 stores · 81 departments · Feb 2010 – Oct 2012 · MAE = average miss per department-week.</div>",
            unsafe_allow_html=True)
