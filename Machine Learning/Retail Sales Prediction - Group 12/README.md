# 🛒 Retailligence — Next-Week Department Sales Forecasting

**Machine Learning Fundamentals · Mini Project · Group 12** · B.Tech CSE 2024–28 · Semester V
Brief: [`problem-statement.pdf`](problem-statement.pdf) (Group 12 – Retail Sales Prediction + the rules for all groups)

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/AnshumanAtrey/5th-sem/blob/main/Machine%20Learning/Retail%20Sales%20Prediction%20-%20Group%2012/Retailligence.ipynb)

Retailligence forecasts **next week's sales for one department of one Walmart store**. It uses the department's
sales history, the store, the product group, promotions (markdowns), the month and the holiday calendar, so a manager can
order stock and plan staff a week ahead.

| | |
|---|---|
| **Data** | Walmart Recruiting – Store Sales Forecasting (Kaggle, 2014): 421,570 weekly sales rows · 45 stores · 81 departments · 143 weeks (Feb 2010 – Oct 2012) |
| **Model** | Polynomial Regression (degree 2) on engineered history, date/time, holiday and store features |
| **Test (17 unseen weeks)** | MAE **$1,277** per department-week · RMSE $2,544 · R² **0.987** |
| **vs rules of thumb** | 17.9% lower error than "next week = last week", 7.9% lower than the best seasonal rule |
| **Deliverables** | [notebook](Retailligence.ipynb) · [presentation (9 slides)](Retailligence-Presentation.pdf) · [full report (37 slides)](Retailligence-Report.pdf) · [Streamlit app](app.py) · [tests](tests/) · [contributions](CONTRIBUTIONS.md) |

## Run it

```bash
pip install -r requirements.txt
streamlit run app.py                     # the app (uses models/best_model.joblib)
```

Rebuild everything from scratch (about 1 minute for the notebook):

```bash
pip install -r requirements-dev.txt
jupyter nbconvert --to notebook --execute --inplace Retailligence.ipynb   # figures/, reports/*.json, models/
pytest --junitxml=reports/tests.xml                                        # 21 tests
python -m playwright install chromium                                      # once, for the next two steps
python report/screenshots.py      # needs the app running on port 8765
python report/build_report.py     # → Retailligence-Report.pdf + Retailligence-Presentation.pdf
```

**Live demo:** open the notebook in Colab with the badge above, then *Runtime → Run all*. The first cell clones this repo and
installs the pinned libraries. The app can go live on [Streamlit Community Cloud](https://share.streamlit.io) straight from
this repo, with main file `Machine Learning/Retail Sales Prediction - Group 12/app.py`.

## How it works

1. **Clean.** Negative sales (net returns) → 0. Missing markdowns → 0 plus a "reported" flag. Weeks with no record count
   as 0 sales in the history, and are never used as targets.
2. **Engineer features** (`src/features.py`, shared by the notebook and the app): last week, 2 weeks ago, 4-week average,
   same week last year, *last year's jump* for this week; month, 4 holiday flags and the 2 pre-Christmas weeks from the date;
   store type and size, department, total markdown.
3. **Validate without peeking at the future.** The last 17 weeks are locked away as the test set. Inside the training weeks,
   5-fold expanding-window cross-validation always trains on the past.
4. **Compare** three rules of thumb (last week · same week last year · 4-week average + last year's jump) with Linear and
   Polynomial Regression. Feature selection and the polynomial degree (1 / **2** / 3) are chosen on cross-validation.
5. **Deploy** the chosen model in Streamlit with an 80% range, the rule-of-thumb cross-check, input validation and what-if inputs.

## What we found

- **History carries the forecast.** Correlation with this week's sales is 0.96 for last week and 0.98 for the same week last year.
- **Holidays multiply sales.** Thanksgiving week runs at ≈1.43× a normal week and the two weeks before Christmas at ≈1.52×.
- **Markdowns look powerful but it's store size.** Per square foot the correlation is −0.04, and their model importance is ≈0.
- **Honest weak spot.** The data holds only one holiday season to learn from, and the test weeks hold none. In cross-validation
  the seasonal rule beat the models on holiday weeks, so the app shows both numbers and warns on big holidays.

## Folder structure

```
├── Retailligence.ipynb       # the whole pipeline: data → EDA → features → models → evaluation → saved model
├── Retailligence-Presentation.pdf  # 9-slide viva deck: 3 parts × 3 slides, one part per presenter
├── Retailligence-Report.pdf  # full report (37 slides, every number read from reports/*.json)
├── app.py                    # Streamlit app
├── problem-statement.pdf     # the official brief
├── src/features.py           # feature pipeline shared by notebook and app
├── src/theme.py              # colours shared by charts, app and report
├── data/                     # train.csv, features.csv, stores.csv (Kaggle)
├── models/best_model.joblib  # saved model + error bands + input ranges
├── reports/                  # results.json, eda.json, tests.xml
├── figures/                  # 16 charts from the notebook
├── screenshots/              # 5 app screenshots
├── report/                   # build_report.py, report.css, screenshots.py
├── tests/                    # 21 tests: features, saved model, app
└── CONTRIBUTIONS.md          # individual contribution record
```

## Viva cheat-sheet

| Question | Answer |
|---|---|
| Regression or classification? | Regression: the target is a dollar amount. |
| Why not a random train/test split? | It would train on next week to predict this week (leakage). We split by time. |
| Why Polynomial and not Linear? | A holiday *multiplies* sales. Squared and interaction terms (last week × Thanksgiving) can model that. CV MAE 1,668 vs 1,710. |
| Why degree 2? | Degree 3 fits training weeks better but its unseen-week error jumps to 2,070 (over-fitting). |
| What does R² 0.987 mean? | The model explains 98.7% of the week-to-week variation across departments. MAE is the fairer everyday number: $1,277. |
| Why compare with rules of thumb? | A model is only useful if it beats what a manager already does. Ours cuts the best rule's error by 7.9%. |
| Where does it fail? | Huge holiday spikes: it learned them from one season only. The app shows the rule too. |
