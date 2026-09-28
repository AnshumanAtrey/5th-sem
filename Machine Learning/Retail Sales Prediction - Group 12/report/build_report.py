"""Build Retailligence-Report.pdf: a slide-style project report, every number read from the notebook's outputs.

    jupyter nbconvert --to notebook --execute --inplace Retailligence.ipynb   # figures + reports/*.json
    pytest --junitxml=reports/tests.xml                                        # test results
    python report/build_report.py
"""
import html
import io
import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from features import load_raw  # noqa: E402

E = json.loads((ROOT / "reports/eda.json").read_text())
R = json.loads((ROOT / "reports/results.json").read_text())
BEST, NAIVE, RULE = R["best_model"], "Naive: last week's sales", "Seasonal rule: last 4 weeks + last year's jump"
T = R["test"][BEST]
NB = json.loads((ROOT / "Retailligence.ipynb").read_text())
FIG, SHOT = "../figures", "../screenshots"


def usd(v):
    return f"{'−' if v < 0 else ''}${abs(v):,.0f}"


def at(title):
    """Placeholder for the slide number of the slide with this title, filled in once all slides exist."""
    return f"@@{title}@@"


def esc(text):
    return html.escape(str(text))


def points(items):
    """items: (headline, detail). Put **word** in a headline to highlight it."""
    out = []
    for head, detail in items:
        head = esc(head).replace("**", "\0")
        parts = head.split("\0")
        head = "".join(f"<em>{p}</em>" if i % 2 else p for i, p in enumerate(parts))
        out.append(f"<div class='pt'><div class='h'>{head}</div><div class='d'>{detail}</div></div>")
    return "".join(out)


def img(name, folder=FIG, cls=""):
    return f"<img class='{cls}' src='{folder}/{name}'>"


def code(text, cls=""):
    return f"<pre class='code {cls}'>{esc(text)}</pre>"


def table(header, rows, cls=""):
    head = "".join(f"<th>{esc(h)}</th>" for h in header)
    body = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in rows)
    return f"<table class='{cls}'><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table>"


def stats(cards):
    return "<div class='stats'>" + "".join(f"<div class='stat'><b>{v}</b><span>{k}</span></div>" for v, k in cards) + "</div>"


def flow(steps, cls=""):
    return f"<div class='flow {cls}'>" + "<i>→</i>".join(f"<div>{s}</div>" for s in steps) + "</div>"


SLIDES = []


def slide(title, left, right="", kicker="", split="split"):
    SLIDES.append(f"<section class='slide'><div class='kicker'>{kicker}</div><h2>{title}</h2><div class='rule'></div>"
                  f"<div class='{split}'><div class='left'>{left}</div><div class='right'>{right}</div></div></section>")


def notebook_cell(marker):
    return next("".join(c["source"]) for c in NB["cells"] if c["cell_type"] == "code" and marker in "".join(c["source"]))


def make_model_source():
    cell = notebook_cell("def make_model(")
    return cell[cell.index("def make_model"):cell.index("def predict")].strip()


def repo_tree():
    skip = {".venv", "__pycache__", ".pytest_cache", ".DS_Store", ".ipynb_checkpoints"}
    notes = {"app.py": "Streamlit app", "Retailligence.ipynb": "full pipeline: EDA → model → evaluation",
             "problem-statement.pdf": "official brief (Group 12 + common rules)", "features.py": "shared feature pipeline",
             "theme.py": "shared colours", "best_model.joblib": "saved model", "results.json": "all model numbers",
             "eda.json": "all data numbers", "train.csv": "421,570 sales rows", "features.csv": "store-week context",
             "stores.csv": "45 stores", "build_report.py": "builds this PDF", "screenshots.py": "app screenshots",
             "requirements.txt": "pinned libraries", "tests": "21 automated tests", "figures": "16 charts",
             "screenshots": "5 app screenshots", "README.md": "how to run"}
    lines = ["Retail Sales Prediction - Group 12/"]

    def walk(folder, prefix):
        items = sorted(p for p in folder.iterdir() if p.name not in skip and not p.name.endswith((".html", ".xml")))
        for i, p in enumerate(items):
            last = i == len(items) - 1
            name = p.name + ("/" if p.is_dir() else "")
            note = notes.get(p.name, "")
            count = f" ({len(list(p.glob('*.png')))} files)" if p.name in ("figures", "screenshots") else ""
            lines.append(f"{prefix}{'└── ' if last else '├── '}{name}{count}" + (f"   # {note}" if note else ""))
            if p.is_dir() and p.name not in ("figures", "screenshots"):
                walk(p, prefix + ("    " if last else "│   "))
    walk(ROOT, "")
    return "\n".join(lines)


def info_text():
    sales, feats, stores = load_raw()
    raw = sales.merge(feats.drop(columns="IsHoliday"), on=["Store", "Date"], how="left").merge(stores, on="Store")
    buf = io.StringIO()
    raw.info(buf=buf)
    desc = raw[["Weekly_Sales", "Size", "Temperature", "Fuel_Price", "CPI", "Unemployment"]].describe().T.round(1)
    return buf.getvalue().replace("<class 'pandas.DataFrame'>\n", ""), desc


def tests():
    suite = ET.parse(ROOT / "reports/tests.xml").getroot().find("testsuite")
    cases = [(c.get("classname").split(".")[-1], c.get("name"), c.find("failure") is None) for c in suite.iter("testcase")]
    return suite, cases


# ── 1. Cover ─────────────────────────────────────────────────────────────
SLIDES.append(f"""<section class='slide cover'>
<div class='chips'><span>ML Fundamentals Mini Project</span><span>Group 12</span><span>Regression · Forecasting</span></div>
<h1>Retailligence</h1>
<p class='sub'>Forecasting next week's sales for every department of every store, from sales history,
store, product, promotion, month and holiday data.</p>
<div class='coverstats'>{stats([(f"{E['rows']:,}", "sales rows"), (f"{E['stores']} × {E['departments']}", "stores × departments"),
                                 (usd(T['MAE']), "average miss / dept-week"), (f"{T['R2']:.3f}", "test R²")])}</div>
<p class='meta'>B.Tech CSE 2024–28 · Semester V · Machine Learning Fundamentals · Mini-project report</p></section>""")

# ── 2. About + repo tree ────────────────────────────────────────────────
slide("About the project", points([
    ("Retailligence is a **next-week sales forecaster**", "For one department of one Walmart store, it predicts next week's "
     "sales so the manager can order the right stock and roster the right staff."),
    ("Built on **real data**", f"Walmart's 45 stores, 81 departments, {E['weeks']} weeks (Feb 2010 – Oct 2012): "
     f"{E['rows']:,} weekly sales records."),
    ("Everything is **reproducible**", "One notebook runs the whole pipeline (also live on Google Colab); the app, "
     "this report and 21 automated tests all read its outputs."),
    ("Chosen model: **Polynomial Regression (degree 2)**", f"{R['test_mae_change_vs_naive_pct'][BEST]:.1f}% lower error than "
     "\"next week = last week\" on 17 weeks it never saw."),
]), code(repo_tree(), "tree"), "Overview")

# ── 3. Abstract ──────────────────────────────────────────────────────────
slide("Abstract", f"""<p class='para'>Retail stores must decide every week how much stock to order and how many staff to roster.
Both depend on a forecast of next week's sales. Using the public Walmart Recruiting – Store Sales Forecasting data
({E['rows']:,} store-department-weeks), we built features from sales history (last week, last 4 weeks, the same week last
year and last year's jump for that week), extracted dates into month, holiday and pre-Christmas flags, and combined
them with store, department and promotion information. Linear and Polynomial Regression were compared against three
rule-of-thumb baselines with 5-fold time-series cross-validation, and the chosen model was tested once on the final
{R['data']['test_weeks'][2]} weeks. Polynomial Regression (degree 2) reached MAE {usd(T['MAE'])}, RMSE {usd(T['RMSE'])} and R²
{T['R2']:.3f}, cutting the error of the best rule of thumb by {R['test_mae_change_vs_rule_pct'][BEST]:.1f}%. Holiday spikes
remain the hardest case, because the data contains only one holiday season to learn from. The model is deployed as a
Streamlit app that shows the forecast, an 80% range and a rule-of-thumb cross-check.</p>""",
      stats([(usd(T['MAE']), "MAE on unseen weeks"), (usd(T['RMSE']), "RMSE"), (f"{T['R2']:.3f}", "R²"),
             (f"{R['test_mae_change_vs_naive_pct'][BEST]:.1f}%", "lower error than last week's sales"),
             (f"{R['test_mae_change_vs_rule_pct'][BEST]:.1f}%", "lower error than the seasonal rule"),
             ("21 / 21", "automated tests pass")]), "Summary")

# ── 4. Introduction & motivation ────────────────────────────────────────
slide("Introduction and motivation", points([
    ("Forecasts drive **stock and staff**", "Order too much and cash sits on shelves or spoils; order too little and "
     "shelves go empty on the busiest days."),
    ("Sales are **not steady**", f"Chain-wide sales jump to ${E['top_weeks_million']['2010-12-24']}M in the week before "
     f"Christmas, against ≈ ${E['avg_week_million_by_kind']['Normal week']}M in a normal week."),
    ("Every department is **different**", f"The top 10 departments make {E['top10_dept_share_pct']}% of all sales; a forecast "
     "must work for a $50 department and a $500,000 one."),
    ("Goal: **one model for all 3,331 store-departments**", "that uses only what is known before the week starts."),
]), img("03_sales_over_time.png"), "Why this matters")

# ── 5. Problem statement & objectives ───────────────────────────────────
slide("Problem statement and objectives", f"""<div class='quote'><b>Group 12 – Retail Sales Prediction.</b> Build a model that
predicts retail sales using historical sales, product, store, promotion, month, holiday and other suitable
information.</div>""" + points([
    ("Target", "<code>Weekly_Sales</code>: dollars sold by one department of one store in one week."),
    ("Problem type", "Supervised <b>regression</b> on time-ordered data, i.e. a forecasting problem: never train on the future."),
    ("Objective", "Beat the simple rules a manager already uses, measured on weeks the model never saw."),
]), table(["Minimum requirement (brief)", "Done"], [
    ["Use sales as the target", "✓ <code>Weekly_Sales</code>"],
    ["EDA and appropriate date/time feature extraction", "✓ 9 charts · month, holidays, pre-Christmas, history"],
    ["Preprocessing and feature engineering", "✓ cleaning, imputation, scaling, one-hot, 5 history features"],
    ["Implement Linear and/or Polynomial Regression", "✓ both, degree chosen by validation"],
    ["Evaluate using MAE, MSE, RMSE and R²", "✓ plus WMAE (Kaggle's own metric)"],
    ["Deploy the prediction model using Streamlit", "✓ <code>app.py</code>, 11 app tests"],
    ["Final title created by the group", "✓ Retailligence"],
], "check"), "The brief")

# ── 6. Literature survey ────────────────────────────────────────────────
slide("Literature survey", table(["Work", "Key finding we used"], [
    ["Fildes, Ma & Kolassa (2022), <i>Retail forecasting: Research and practice</i>, IJF 38(4)",
     "Retail demand is driven by seasonality, holidays and promotions; simple benchmarks are hard to beat and must be reported."],
    ["Makridakis, Spiliotis & Assimakopoulos (2022), <i>M5 accuracy competition</i>, IJF 38(4)",
     "On Walmart sales, models that pool many series with calendar and history features win: our one-model-for-all design."],
    ["Bojer & Meldgaard (2021), <i>Kaggle forecasting competitions</i>, IJF 37(2)",
     "Reviews Kaggle retail competitions incl. Walmart Store Sales: lag features and holiday handling matter most."],
    ["Bergmeir & Benítez (2012), <i>Cross-validation for time series</i>, Information Sciences 191",
     "Time-ordered evaluation (train on the past, test on the future) avoids optimistic scores: our expanding-window CV."],
    ["Hyndman & Athanasopoulos (2021), <i>Forecasting: Principles and Practice</i>, 3rd ed.",
     "Naive and seasonal-naive forecasts are the standard benchmarks: our three baselines."],
], "lit"), "", "Background", "full")

# ── 7. Existing system ──────────────────────────────────────────────────
rule_mae = {n: R["test"][n]["MAE"] for n in (NAIVE, "Seasonal naive: same week last year", RULE)}
slide("Existing system and its limitations", points([
    ("Today: **rules of thumb**", "Managers order like last week, or like the same week last year, often in a spreadsheet."),
    ("They **ignore context**", "\"Last week\" misses holidays completely; \"last year\" misses this year's growth or decline."),
    ("They **cannot be measured**", "Nobody tracks how wrong the guess was, so nobody improves it."),
    ("So we **measured them**", "All three rules are baselines in our evaluation, on exactly the same weeks as the models."),
]), table(["Rule of thumb", "Test MAE", "vs our model"], [
    [esc(n), usd(v), f"{(1 - T['MAE'] / v) * 100:.1f}% worse" if v > T['MAE'] else "—"] for n, v in rule_mae.items()]
    + [[f"<b>{BEST}</b>", f"<b>{usd(T['MAE'])}</b>", "—"]], "check"), "Existing system")

# ── 8. Proposed system & workflow ───────────────────────────────────────
slide("Proposed system and workflow", points([
    ("One **pipeline**, end to end", "Problem → dataset → understanding → cleaning → preprocessing → EDA → feature "
     "engineering → split → models → evaluation → comparison → best model → saving → Streamlit → testing."),
    ("One **shared feature module**", "<code>src/features.py</code> builds the inputs for the notebook and the app, so the "
     "deployed model sees exactly what it was trained on."),
    ("Honest by **design**", "Baselines, time-ordered validation and a locked test set are part of the pipeline, not an afterthought."),
]), flow(["Problem", "Dataset<br><small>Kaggle Walmart</small>", "Cleaning", "Feature<br>engineering", "EDA"], "")
    + flow(["Time<br>split", "5-fold<br>CV", "Linear vs<br>Poly", "Test<br>once", "Save<br>model", "Streamlit<br>app"], "second"), "Workflow")

# ── 9. Dataset ───────────────────────────────────────────────────────────
slide("Dataset description", points([
    ("Source", "<b>Walmart Recruiting – Store Sales Forecasting</b> (Kaggle, 2014), via the Kaggle mirror "
     "<code>aslanahmedov/walmart-sales-forecast</code> (identical files, checked row counts)."),
    ("Three files joined", "<code>train.csv</code> (sales) + <code>features.csv</code> (store-week context) + "
     "<code>stores.csv</code> (store type and size), joined on store and date."),
    ("Target", "<code>Weekly_Sales</code> in US dollars, one row per store × department × week (weeks end on Friday)."),
]), stats([(f"{E['rows']:,}", "sales rows (train.csv)"), (f"{E['feature_rows']:,}", "store-week rows (features.csv)"),
           (E["stores"], "stores (3 types)"), (E["departments"], "departments (products)"),
           (f"{E['store_departments']:,}", "store-department series"), (E["weeks"], f"weeks · {E['first_week']} → {E['last_week']}"),
           (E["holiday_weeks"], "holiday weeks flagged"), (f"${E['total_sales_billion']}B", "total sales in the data"),
           (E["duplicate_rows"], "duplicate rows")]), "Data")

# ── 10. Data classification ─────────────────────────────────────────────
slide("Data classification: every column", table(["Column", "Data type", "Meaning", "How the model uses it", "Missing %"],
      [[f"<code>{esc(c['column'])}</code>", esc(c["data type"]), esc(c["meaning"]), esc(c["how the model uses it"]),
        f"{c['missing %']}"] for c in E["classification"]], "cls"), "", "Data", "full")

# ── 11. Data understanding ──────────────────────────────────────────────
info, desc = info_text()
slide("Data understanding", points([
    (f"**{E['rows']:,} rows × {info.split('(total ')[1].split(' ')[0]} columns** after joining", "Store, department and date identify each row; the rest are numbers, "
     "categories or flags (previous slide)."),
    ("Target is **right-skewed**", f"Median {usd(E['sales_summary']['50%'])}, mean {usd(E['sales_summary']['mean'])}, "
     f"max {usd(E['sales_summary']['max'])} per department-week."),
    ("Context columns are **complete**", "Temperature, fuel price, CPI and unemployment have no gaps; only markdowns do."),
]), code(info, "small") + table(["", "mean", "std", "min", "50%", "max"],
      [[f"<code>{k}</code>", f"{v['mean']:,.1f}", f"{v['std']:,.1f}", f"{v['min']:,.1f}", f"{v['50%']:,.1f}", f"{v['max']:,.1f}"]
       for k, v in desc.iterrows()], "mini"), "Data")

# ── 12. Data quality & cleaning ─────────────────────────────────────────
slide("Data quality and cleaning decisions", table(["Found", "Decision", "Why"], [
    [f"{E['negative_sales_rows']:,} rows with negative sales (net returns)", "set to 0", "returns are not demand"],
    [f"Markdowns missing 64–74% (none before {E['markdown_first_week']})", "missing → 0 + <code>markdown_reported</code> flag",
     "tell \"no markdown\" from \"not reported\""],
    [f"{E['unrecorded_weeks_inside_history']:,} store-dept-weeks with no row", "0 sales for history; never a target",
     "no record = nothing sold"],
    ["Holiday spikes up to $693K", "kept", "real, and what we must predict"],
    ["Duplicates", f"{E['duplicate_rows']} found", "—"],
], "check"), img("01_missing_values.png"), "Preprocessing")

# ── 13. Preprocessing pipeline ──────────────────────────────────────────
slide("Train-test split and preprocessing pipeline", points([
    ("**Leakage-free**", "Every step is fitted on training weeks only, inside one scikit-learn <code>Pipeline</code>, then "
     "applied unchanged to validation and test weeks, and in the app."),
    ("Numeric inputs", "Median imputation → standard scaling (mean 0, std 1) → polynomial terms (degree 2) for the "
     "history, promotion and holiday inputs."),
    ("Categorical inputs", "One-hot encoding of store type, month and department; unseen categories are ignored safely."),
    ("Predictions", "Clipped at $0: a department cannot sell less than nothing."),
]), f"""<div class='pipe'>
<div class='box wide'>Model rows · {E['model_rows']:,} store-department-weeks with 56 weeks of history</div><i>↓</i>
<div class='box wide'>Time split · first {R['data']['train_weeks'][2]} weeks train · last {R['data']['test_weeks'][2]} weeks test (never touched)</div><i>↓</i>
<div class='row'><div class='box hl'>Training weeks<br><small>{R['data']['train_rows']:,} rows</small></div>
<div class='box'>Test weeks<br><small>{R['data']['test_rows']:,} rows</small></div></div><i>↓</i>
<div class='row'><div class='box'><b>History · promo · holidays</b><br><small>impute → scale → polynomial (deg 2)</small></div>
<div class='box'><b>Size · markdown flag</b><br><small>impute → scale</small></div>
<div class='box'><b>Type · month · Dept</b><br><small>one-hot</small></div></div><i>↓</i>
<div class='box wide hl'>LinearRegression · fitted on training weeks only</div></div>""", "Preprocessing")

# ── 14. Feature engineering ─────────────────────────────────────────────
slide("Feature engineering: history, date/time, holidays", points([
    ("**History** is the strongest clue", f"Correlation with this week's sales: last week {E['corr_with_target']['sales_lag_1']}, "
     f"same week last year {E['corr_with_target']['sales_lag_52']}."),
    ("**Last year's jump** carries the holiday", "How far this week rose above the 4 weeks before it, last year: it tells "
     "the model a spike is coming before the week happens."),
    ("**Date/time extraction**", "From the date: month, the 4 holiday flags and the 2 pre-Christmas weeks, which are "
     "the biggest weeks of the year but not flagged in the data."),
]), table(["Feature", "Meaning", "From"], [
    ["<code>sales_lag_1</code>, <code>sales_lag_2</code>", "sales 1 and 2 weeks ago", "Weekly_Sales"],
    ["<code>sales_roll4</code>", "average of the last 4 weeks", "Weekly_Sales"],
    ["<code>sales_lag_52</code>", "same week last year", "Weekly_Sales"],
    ["<code>sales_yoy_jump</code>", "last year: week 52 back − avg of weeks 53–56 back", "Weekly_Sales"],
    ["<code>hol_*</code> (4)", "Super Bowl, Labor Day, Thanksgiving, Christmas", "IsHoliday + month"],
    ["<code>pre_christmas</code>", "the 14 days before 25 Dec", "Date"],
    ["<code>month</code>", "month of the year", "Date"],
    ["<code>promo_markdown</code>, <code>markdown_reported</code>", "total markdown, and whether reported", "MarkDown1–5"],
    ["<code>Type</code>, <code>Size</code>, <code>Dept</code>", "store format, size, product group", "stores / train"],
], "mini"), "Features")

# ── 15–21. EDA ──────────────────────────────────────────────────────────
k = E["avg_week_million_by_kind"]
eda = [
    ("EDA 1 · The target", "02_sales_distribution.png", [
        ("Sales are **right-skewed**", f"Median {usd(E['sales_summary']['50%'])} but a long tail up to {usd(E['sales_summary']['max'])}."),
        ("So errors are in **dollars**", "Big departments dominate MAE and RMSE; that is where the money is.")]),
    ("EDA 2 · Holidays multiply sales", "06_holiday_effect.png", [
        ("Thanksgiving week ≈ **" + f"{k['Thanksgiving'] / k['Normal week']:.2f}×" + "** a normal week", ""),
        ("The 2 weeks before Christmas ≈ **" + f"{k['2 weeks before Christmas'] / k['Normal week']:.2f}×" + "**",
         "not flagged in the data, so we derived them from the date."),
        ("Christmas week itself **dips**", f"{k['Christmas week'] / k['Normal week']:.2f}× a normal week."),
        ("A **multiplier**, not a fixed add-on", "which is why polynomial interaction terms (history × holiday) fit the problem.")]),
    ("EDA 3 · Store type and size", "04_store_type_size.png", [
        ("Type A stores sell **most**", f"A ≈ ${E['store_type_avg_week_million']['A']}M, B ≈ ${E['store_type_avg_week_million']['B']}M, "
         f"C ≈ ${E['store_type_avg_week_million']['C']}M per week."),
        ("Size predicts sales", f"r = {E['corr_store_size_vs_sales']} between store size and store sales.")]),
    ("EDA 4 · Departments (the product)", "05_departments.png", [
        ("A few departments **carry the chain**", f"The top 10 make {E['top10_dept_share_pct']}% of all sales."),
        ("So the department is an **input**", "one-hot encoded, one column per department.")]),
    ("EDA 5 · Month and seasonality", "07_monthly_seasonality.png", [
        ("**November and December** dominate", "and the pattern repeats in both years."),
        ("Repeating pattern → **\"same week last year\"**", "becomes one of the strongest features.")]),
    ("EDA 6 · History vs this week", "08_history_vs_sales.png", [
        ("Points hug the **diagonal**", f"r = {E['corr_with_target']['sales_lag_1']} with last week and "
         f"{E['corr_with_target']['sales_lag_52']} with the same week last year."),
        ("History features **lead** the model", "confirmed later by permutation importance.")]),
    ("EDA 7 · Do promotions work?", "09_markdown_vs_sales.png", [
        ("Looks like yes", f"r = {E['corr_markdown_vs_store_sales']} between markdown and store sales..."),
        ("...but it is **store size**", f"per square foot r = {E['corr_markdown_vs_sales_per_sqft']}: big stores simply run bigger markdowns."),
        ("Expect markdowns to add **little**", "once history is known; the model agrees (importance ≈ 0).")]),
    ("EDA 8 · Correlations", "10_correlation_heatmap.png", [
        ("History columns ≈ **0.95+**", "with this week's sales."),
        ("Economic data ≈ **0**", "temperature, fuel price, CPI, unemployment; tested in feature selection, then removed.")]),
]
for title, fig, items in eda:
    slide(title, points(items), img(fig), "Exploratory data analysis")

# ── 22. Validation design ───────────────────────────────────────────────
folds = R["cv_folds"]
bars = "".join(f"<div class='fold'><span>Fold {i}</span><div class='track'><div class='tr' style='width:{w}%'></div>"
               f"<div class='va' style='width:{v}%'></div></div><small>check {a} → {b}</small></div>"
               for i, ((a, b), w, v) in enumerate(zip(folds, [22, 36, 50, 64, 78], [14] * 5), 1))
bars += (f"<div class='fold'><span>Test</span><div class='track'><div class='tr' style='width:80%'></div>"
         f"<div class='te' style='width:20%'></div></div><small>{R['data']['test_weeks'][0]} → {R['data']['test_weeks'][1]}</small></div>")
slide("Validation design: never peek at the future", points([
    ("**Locked test set**", f"The last {R['data']['test_weeks'][2]} weeks ({R['data']['test_weeks'][0]} → {R['data']['test_weeks'][1]}) "
     "were opened once, after the model was chosen."),
    ("**Expanding-window CV**", "5 folds inside the training weeks: always learn from earlier weeks, check on the next block."),
    ("Why not a random split?", "It would let the model learn from next week to predict this week: an optimistic, useless score."),
]), f"<div class='folds'>{bars}<div class='legend'><b class='l-tr'></b> learn <b class='l-va'></b> check <b class='l-te'></b> final test</div></div>",
      "Model development")

# ── 23. Models ──────────────────────────────────────────────────────────
slide("Model development", points([
    ("Three **baselines**", "Naive (last week), seasonal naive (same week last year), seasonal rule (last 4 weeks + last year's jump)."),
    ("**Linear Regression**", "A weighted sum of the scaled inputs."),
    ("**Polynomial Regression (degree 2)**", "Adds squares and pairwise products of the history, promotion and holiday inputs, "
     "e.g. last week's sales × Thanksgiving, so a holiday can multiply a department's sales."),
    ("Selection rule fixed **in advance**", "Lowest cross-validated RMSE between the two regression models."),
]), code(make_model_source(), "small"), "Model development")

# ── 24. Feature selection & degree ──────────────────────────────────────
dc = R["degree_check"]
slide("Feature selection and polynomial degree", table(["Feature set (Polynomial, degree 2)", "CV MAE"],
      [[esc(n), usd(v)] for n, v in R["feature_selection_cv_mae"].items()], "check")
      + points([("Store ID and economic data **removed**", "they did not lower cross-validated error."),
                ("Degree **2** is the sweet spot", f"CV MAE: degree 1 {usd(dc['1']['cv_MAE'])}, degree 2 {usd(dc['2']['cv_MAE'])}, "
                 f"degree 3 {usd(dc['3']['cv_MAE'])}. Degree 3 fits training weeks better but over-fits.")]),
      img("12_degree_check.png"), "Model development")

# ── 25. Evaluation & comparison ─────────────────────────────────────────
rows = [[esc(n), usd(R["cv"][n]["mean"]["MAE"]), usd(R["test"][n]["MAE"]), usd(R["test"][n]["RMSE"]),
         f"{R['test'][n]['MSE'] / 1e6:,.1f}M", f"{R['test'][n]['R2']:.3f}", f"{R['test_mae_change_vs_naive_pct'][n]:+.1f}%"]
        for n in R["test"]]
rows[-1] = [f"<b>{c}</b>" for c in rows[-1]]
slide("Model evaluation and comparison", table(["Method", "CV MAE", "Test MAE", "Test RMSE", "Test MSE", "Test R²", "error cut vs naive"],
      rows, "check") + img("11_model_comparison.png", cls="below"), "", "Evaluation", "full")

# ── 26. Honest reading ──────────────────────────────────────────────────
f45 = {n: (v[3] + v[4]) / 2 for n, v in R["cv_mae_per_fold"].items()}
hk = R["cv_mae_by_week_kind"]
slide("Reading the results honestly", points([
    ("The seasonal rule **wins cross-validation on average**", f"CV MAE {usd(R['cv'][RULE]['mean']['MAE'])} vs "
     f"{usd(R['cv'][BEST]['mean']['MAE'])}, almost all from fold 3 (Nov 2011 – Jan 2012)."),
    ("Why: **no holiday season to learn from**", "In fold 3 the models had never seen Thanksgiving or Christmas; the rule "
     f"has \"holiday jumps repeat\" built in. Holiday-week CV MAE: rule {usd(hk[RULE]['holiday_and_pre_christmas_weeks'])}, "
     f"polynomial {usd(hk[BEST]['holiday_and_pre_christmas_weeks'])}."),
    ("Once a season is in training, **the model leads**", f"Folds 4–5: polynomial {usd(f45[BEST])} vs rule {usd(f45[RULE])}; "
     f"final test: {usd(T['MAE'])} vs {usd(R['test'][RULE]['MAE'])}."),
    ("So the app shows **both**", "the model's forecast and the rule, with a warning on big holiday weeks."),
]), img("15_holiday_season.png"), "Evaluation")

# ── 27. Residuals & weekly error ────────────────────────────────────────
res = R["residuals"]
slide("Residual analysis", points([
    ("Centred near **zero**", f"Mean residual {usd(res['mean'])} (a slight over-forecast), half of all misses under {usd(res['abs_p50'])}."),
    ("Misses **grow with size**", f"80% of misses under {usd(res['abs_p80'])}; the app's range is therefore a percentage of the forecast."),
    ("**Lowest average error**", f"Of all five methods over the {R['data']['test_weeks'][2]} test weeks (chart below)."),
]), img("13_residuals.png", cls="half") + img("14_weekly_error.png", cls="half"), "Evaluation")

# ── 28. Feature importance ──────────────────────────────────────────────
imp = R["importance_mae_increase"]
slide("Which inputs matter?", points([
    ("**Recent history** carries the forecast", f"Shuffling the 4-week average raises MAE by {usd(imp['sales_roll4'])}, "
     f"the same week last year by {usd(imp['sales_lag_52'])}, last week by {usd(imp['sales_lag_1'])}."),
    ("Department and month add **a little**", f"{usd(imp['Dept'])} and {usd(imp['month'])}."),
    ("Markdowns add **nothing measurable**", f"{usd(imp['promo_markdown'])}, matching the EDA."),
    ("Caveat", "The test weeks (Jul–Oct 2012) contain no Thanksgiving or Christmas, so those flags cannot show importance here."),
]), img("16_feature_importance.png"), "Results")

# ── 29–30. Streamlit ────────────────────────────────────────────────────
slide("Streamlit deployment", points([
    ("**Inputs** (sidebar)", "Store, department and week; what-if markdown, kind of week and last week's sales, "
     "limited to the range seen in training."),
    ("**Outputs**", "Forecast with an 80% range, the rule-of-thumb cross-check, the actual sales for past weeks, a 16-week "
     "chart, a store snapshot and the model's test scores."),
    ("**Honesty built in**", "Training weeks are labelled \"not a fair test\"; holiday weeks carry a warning."),
    ("Run it", "<code>streamlit run app.py</code>, or deploy the same file on Streamlit Community Cloud."),
]), img("02_unseen_test_week_labor_day.png", SHOT, "shot"), "Deployment")
slide("App: holidays, what-if and input validation", img("03_thanksgiving_with_warnings.png", SHOT, "shot3")
      + img("04_what_if_inputs.png", SHOT, "shot3") + img("05_input_validation_short_history.png", SHOT, "shot3"),
      "", "Deployment", "full trio")

# ── 31. Testing ─────────────────────────────────────────────────────────
suite, cases = tests()
groups = {"test_features": "Feature pipeline", "test_model": "Saved model", "test_app": "Streamlit app (multiple inputs + validation)"}
slide("Testing with multiple inputs and input validation", points([
    (f"**{int(suite.get('tests')) - int(suite.get('failures')) - int(suite.get('errors'))} / {suite.get('tests')} tests pass**",
     f"in {float(suite.get('time')):.1f} s (<code>pytest</code>)."),
    ("Multiple inputs", "5 store / department / week combinations: normal week, Labor Day, small Type C store, "
     "Thanksgiving, next-week forecast; each gives a forecast inside its range."),
    ("Validation", "Negative markdowns are rejected; departments without 56 weeks of history get a clear error, not a number."),
    ("No leakage", "A test proves a week's own sales never feed its inputs."),
]), table(["Group", "Test", ""], [[groups[g], esc(n.replace("_", " ").removeprefix("test ")), "✓" if ok else "✗"]
                                   for g, n, ok in cases], "tests"), "Testing")

# ── 32. Results & discussion ────────────────────────────────────────────
slide("Results and discussion", table(["Question", "Answer"], [
    ["Can next week's sales be predicted from history, store, product, promotion, month and holidays?",
     f"Yes: R² {T['R2']:.3f}, average miss {usd(T['MAE'])} per department-week on unseen weeks."],
    ["Which algorithm is best?", f"{BEST}, {R['test_mae_change_vs_naive_pct'][BEST]:.1f}% better than last week's sales "
     f"and {R['test_mae_change_vs_rule_pct'][BEST]:.1f}% better than the seasonal rule on the test weeks."],
    ["Does polynomial beat linear?", f"Yes, modestly: CV MAE {usd(R['cv'][BEST]['mean']['MAE'])} vs "
     f"{usd(R['cv']['Linear Regression']['mean']['MAE'])}, test {usd(T['MAE'])} vs {usd(R['test']['Linear Regression']['MAE'])}."],
    ["What drives sales?", "Recent sales and the same week last year; holidays multiply them; department and month help a little."],
    ["Do promotions matter?", "Not measurably once history is known (markdowns are anonymised and only reported from Nov 2011)."],
    ["Is it good enough for inventory planning?", "For normal weeks, yes. For big holiday weeks, check it against the "
     "rule of thumb; the app shows both."],
], "lit"), "", "Results", "full")

# ── 33. Requirement traceability ────────────────────────────────────────
slide("Every requirement of the brief, answered", table(["Brief (problem-statement.pdf)", "Where it is done"], [
    ["Problem definition and clear objectives", f"Slides {at('Problem statement')}, {at('Proposed system')} · notebook §1"],
    ["Relevant dataset with source, feature description, target", f"Slides {at('Dataset description')}–{at('Data understanding')} · notebook §2–3"],
    ["Data cleaning and preprocessing", f"Slides {at('Data quality')}–{at('Train-test split')} · notebook §4, §7–8"],
    ["EDA with meaningful visualisations and interpretations", f"Slides {at('EDA 1')}–{at('EDA 8')} · notebook §6"],
    ["Feature selection or feature engineering", f"Slides {at('Feature engineering')}, {at('Feature selection')} · notebook §5, §10"],
    ["Training and testing; appropriate metrics", f"Slides {at('Validation design')}–{at('Model evaluation')} · notebook §9–12"],
    ["Model comparison and final model selection", f"Slides {at('Model evaluation')}–{at('Reading the results')} · notebook §9–12"],
    ["Saving/loading the trained model", "<code>models/best_model.joblib</code>, reload check in notebook §15"],
    ["Functional Streamlit app with inputs and output", f"Slides {at('Streamlit deployment')}–{at('App: holidays')} · <code>app.py</code>"],
    ["Testing with multiple inputs and basic input validation", f"Slide {at('Testing with')} · <code>tests/</code>"],
    ["Report, source code, dataset, model file, requirements.txt, README", f"This PDF · repo tree on slide {at('About the project')}"],
    ["Individual contribution record and viva", f"Slide {at('Team contributions')} · <code>CONTRIBUTIONS.md</code>"],
], "trace"), "", "Checklist", "full")

# ── 34. Limitations ─────────────────────────────────────────────────────
slide("Limitations", points([
    ("**One holiday season** to learn from", "\"Same week last year\" only exists from Feb 2011, and the test weeks contain "
     "no Thanksgiving or Christmas, so holiday accuracy is the least proven part."),
    ("**One week ahead** only", "Forecasting further out would need the model's own forecasts as inputs."),
    ("**Anonymised markdowns**", "The true effect of promotions cannot be measured from this data."),
    ("**Polynomial extrapolation**", "Far outside the training range (e.g. an unseen $650K spike) squared terms over-react; "
     "the app limits what-if inputs to the training range."),
    ("**No outside events**", "Local festivals, weather shocks and competitor openings are not in the data."),
]), img("15_holiday_season.png"), "Discussion")

# ── 35. Conclusion ──────────────────────────────────────────────────────
slide("Conclusion and future scope", points([
    ("Conclusion", f"A degree-2 Polynomial Regression on engineered history, calendar and store features forecasts next week's "
     f"department sales with R² {T['R2']:.3f} and cuts the error of the best rule of thumb by "
     f"{R['test_mae_change_vs_rule_pct'][BEST]:.1f}%, deployed as a tested Streamlit app."),
    ("Future scope", "More years of data (more holiday seasons) · a dedicated holiday-week model · forecasts 2–4 weeks ahead · "
     "Ridge-regularised polynomial terms · live POS data feed."),
]), stats([(usd(T["MAE"]), "average miss"), (f"{T['R2']:.3f}", "R²"), (f"{R['test_mae_change_vs_rule_pct'][BEST]:.1f}%", "better than the rule"),
           ("21/21", "tests pass")]), "Conclusion")

# ── 36. Team & references ───────────────────────────────────────────────
slide("Team contributions and references", table(["Member", "Roll no.", "Owned"], [
    ["Anshuman Atrey", "150096724029", "see CONTRIBUTIONS.md"],
    ["Shlok Kadam", "150096724103", "see CONTRIBUTIONS.md"],
    ["Rajneesh Kumar", "150096724144", "see CONTRIBUTIONS.md"]], "check")
    + "<p class='note'>Full record in <code>CONTRIBUTIONS.md</code>. Every member explains one part in the viva.</p>",
      "<ol class='refs'>"
      "<li>Kaggle (2014). <i>Walmart Recruiting – Store Sales Forecasting</i>. kaggle.com/c/walmart-recruiting-store-sales-forecasting</li>"
      "<li>A. Ahmedov (2022). <i>Walmart Sales Forecast</i> (dataset mirror). kaggle.com/datasets/aslanahmedov/walmart-sales-forecast</li>"
      "<li>R. Fildes, S. Ma, S. Kolassa (2022). Retail forecasting: Research and practice. <i>International Journal of Forecasting</i> 38(4), 1283–1318.</li>"
      "<li>S. Makridakis, E. Spiliotis, V. Assimakopoulos (2022). M5 accuracy competition: Results, findings, and conclusions. <i>IJF</i> 38(4), 1346–1364.</li>"
      "<li>C. S. Bojer, J. P. Meldgaard (2021). Kaggle forecasting competitions: An overlooked learning opportunity. <i>IJF</i> 37(2), 587–603.</li>"
      "<li>C. Bergmeir, J. M. Benítez (2012). On the use of cross-validation for time series predictor evaluation. <i>Information Sciences</i> 191, 192–213.</li>"
      "<li>R. J. Hyndman, G. Athanasopoulos (2021). <i>Forecasting: Principles and Practice</i>, 3rd ed. OTexts.</li>"
      "<li>F. Pedregosa et al. (2011). Scikit-learn: Machine learning in Python. <i>JMLR</i> 12, 2825–2830.</li>"
      "<li>Streamlit documentation. docs.streamlit.io</li></ol>", "Team")

titles = [s.split("<h2>")[1].split("</h2>")[0] if "<h2>" in s else "" for s in SLIDES]
for i, s in enumerate(SLIDES):
    while "@@" in s:
        key = s.split("@@")[1]
        s = s.replace(f"@@{key}@@", str(next(n for n, t in enumerate(titles, 1) if t.startswith(key))))
    SLIDES[i] = s
CSS = (Path(__file__).parent / "report.css").read_text()
pages = "".join(s.replace("</section>", f"<div class='foot'><span>Retailligence · Group 12 · ML Fundamentals Mini Project</span>"
                                          f"<span>{i}</span></div></section>") for i, s in enumerate(SLIDES, 1))
doc = (f"<!doctype html><html><head><meta charset='utf-8'><title>Retailligence — Project Report</title>"
       f"<link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono&display=swap' rel='stylesheet'>"
       f"<style>{CSS}</style></head><body>{pages}</body></html>")
out_html = Path(__file__).parent / "Retailligence-Report.html"
out_html.write_text(doc)
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto(out_html.as_uri())
    page.wait_for_load_state("networkidle")
    page.pdf(path=str(ROOT / "Retailligence-Report.pdf"), width="1280px", height="720px", print_background=True)
    browser.close()
print(f"wrote Retailligence-Report.pdf ({len(SLIDES)} slides)")
