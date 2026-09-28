"""Train + compare the 5 regression models from Case Study 28, then explain the winner.

Outputs: models/best_model.joblib, reports/results.json, figures/08-12_*.png
"""
import json
from pathlib import Path

import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import GradientBoostingRegressor, RandomForestRegressor
from sklearn.impute import SimpleImputer
from sklearn.inspection import permutation_importance
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.model_selection import GroupKFold, GroupShuffleSplit, KFold, cross_validate
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, PolynomialFeatures, StandardScaler
from sklearn.tree import DecisionTreeRegressor

from generate_data import LOCATION_MULT, SEASON, promo_effect

ROOT = Path(__file__).resolve().parents[1]
FIG, REP, MOD = ROOT / "figures", ROOT / "reports", ROOT / "models"
NUM = ["store_size_sqft", "num_staff", "promo_spend_k", "competitor_distance_km"]
CAT = ["location_type", "month"]
FEATURES = NUM + CAT
TARGET = "monthly_sales_lakh"
SEED = 42


def preprocessor(poly=False):
    steps = [("impute", SimpleImputer(strategy="median", add_indicator=True)), ("scale", StandardScaler())]
    if poly:
        steps.append(("poly", PolynomialFeatures(degree=2, include_bias=False)))
    return ColumnTransformer([
        ("num", Pipeline(steps), NUM),
        ("cat", OneHotEncoder(handle_unknown="ignore"), CAT),
    ])


MODELS = {
    "Linear Regression": lambda: Pipeline([("prep", preprocessor()), ("model", LinearRegression())]),
    "Polynomial Regression (deg 2)": lambda: Pipeline([("prep", preprocessor(poly=True)), ("model", LinearRegression())]),
    "Decision Tree": lambda: Pipeline([("prep", preprocessor()), ("model", DecisionTreeRegressor(max_depth=8, min_samples_leaf=10, random_state=SEED))]),
    "Random Forest": lambda: Pipeline([("prep", preprocessor()), ("model", RandomForestRegressor(n_estimators=300, min_samples_leaf=3, n_jobs=-1, random_state=SEED))]),
    "Gradient Boosting": lambda: Pipeline([("prep", preprocessor()), ("model", GradientBoostingRegressor(n_estimators=400, learning_rate=0.05, max_depth=3, subsample=0.9, random_state=SEED))]),
}
SCORING = {"r2": "r2", "mse": "neg_mean_squared_error", "rmse": "neg_root_mean_squared_error", "mae": "neg_mean_absolute_error"}


def metrics(y, p):
    return {"R2": r2_score(y, p), "MSE": mean_squared_error(y, p), "RMSE": mean_squared_error(y, p) ** 0.5, "MAE": mean_absolute_error(y, p)}


def true_sales(row):
    """The hidden rule from generate_data.py, without noise and with average store quality (=1)."""
    core = (3 + 0.0011 * row["store_size_sqft"]) * LOCATION_MULT[row["location_type"]] \
        + 0.25 * row["num_staff"] + promo_effect(row["promo_spend_k"]) + 1.2 * np.log1p(row["competitor_distance_km"])
    return core * SEASON[int(row["month"])]


def rnd(d, n=3):
    return {k: (round(float(v), n) if isinstance(v, (float, np.floating)) else v) for k, v in d.items()}


def main():
    for p in (FIG, REP, MOD):
        p.mkdir(exist_ok=True)
    df = pd.read_csv(ROOT / "data" / "retail_sales.csv")
    X, y, groups = df[FEATURES], df[TARGET], df["store_id"]

    # Hold out 20% of STORES (not rows) — the model never sees these shops at all.
    tr, te = next(GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=SEED).split(X, y, groups))
    Xtr, Xte, ytr, yte, gtr = X.iloc[tr], X.iloc[te], y.iloc[tr], y.iloc[te], groups.iloc[tr]
    out = {"data": {"rows": len(df), "train_rows": len(tr), "test_rows": len(te),
                    "train_stores": int(gtr.nunique()), "test_stores": int(groups.iloc[te].nunique()),
                    "test_store_ids": sorted(groups.iloc[te].unique().tolist())}}

    # ── 1. 5-fold cross-validation on the training stores ─────────────────────
    cv_store = GroupKFold(n_splits=5)                             # each fold = unseen stores
    cv_rows = KFold(n_splits=5, shuffle=True, random_state=SEED)  # each fold = random rows (easier)
    comparison = {}
    for name, make in MODELS.items():
        r = cross_validate(make(), Xtr, ytr, groups=gtr, cv=cv_store, scoring=SCORING)
        rr = cross_validate(make(), Xtr, ytr, cv=cv_rows, scoring={"r2": "r2", "rmse": "neg_root_mean_squared_error"})
        fitted = make().fit(Xtr, ytr)
        comparison[name] = {
            "cv_new_store": rnd({"R2": r["test_r2"].mean(), "R2_std": r["test_r2"].std(), "MSE": -r["test_mse"].mean(),
                                 "RMSE": -r["test_rmse"].mean(), "MAE": -r["test_mae"].mean()}),
            "cv_random_rows": rnd({"R2": rr["test_r2"].mean(), "RMSE": -rr["test_rmse"].mean()}),
            "train": rnd(metrics(ytr, fitted.predict(Xtr))),
            "test_unseen_stores": rnd(metrics(yte, fitted.predict(Xte))),
        }
        print(f"{name:32s} CV(new-store) R2={comparison[name]['cv_new_store']['R2']:.3f} RMSE={comparison[name]['cv_new_store']['RMSE']:.3f}"
              f" | test R2={comparison[name]['test_unseen_stores']['R2']:.3f}")
    out["comparison"] = comparison
    best_name = min(comparison, key=lambda n: comparison[n]["cv_new_store"]["RMSE"])
    out["best_model"] = best_name
    best = MODELS[best_name]().fit(Xtr, ytr)
    fitted = {n: MODELS[n]().fit(Xtr, ytr) for n in ("Linear Regression", "Polynomial Regression (deg 2)")}
    fitted[best_name] = best

    names = list(comparison)
    fig, ax = plt.subplots(1, 2, figsize=(11, 4))
    ax[0].barh(names, [comparison[n]["cv_new_store"]["R2"] for n in names], color="#5cb85c")
    ax[0].set(title="R² (higher = better)", xlim=(0, 1))
    ax[1].barh(names, [comparison[n]["cv_new_store"]["RMSE"] for n in names], color="#d9534f")
    ax[1].set(title="RMSE in Rs lakh (lower = better)")
    fig.suptitle("5-fold cross-validation on stores the model never saw")
    plt.tight_layout(); plt.savefig(FIG / "08_model_comparison.png", dpi=130); plt.close()

    # ── 2. Residual analysis of the best model ───────────────────────────────
    pred = best.predict(Xte)
    res = yte.values - pred
    absr = np.abs(res)
    out["residuals"] = rnd({"mean": res.mean(), "std": res.std(), "abs_p50": np.percentile(absr, 50),
                            "abs_p80": np.percentile(absr, 80), "abs_p90": np.percentile(absr, 90),
                            "mape_pct": np.mean(absr / yte.values) * 100})
    fig, ax = plt.subplots(1, 3, figsize=(15, 4))
    ax[0].scatter(pred, res, s=8, alpha=0.5); ax[0].axhline(0, color="red")
    ax[0].set(title="Residual vs predicted", xlabel="Predicted sales (Rs lakh)", ylabel="Actual − predicted")
    ax[1].hist(res, bins=30, color="#337ab7"); ax[1].set(title="Residuals are centred on 0", xlabel="Error (Rs lakh)")
    ax[2].scatter(yte, pred, s=8, alpha=0.5); lim = [yte.min(), yte.max()]
    ax[2].plot(lim, lim, color="red"); ax[2].set(title="Actual vs predicted", xlabel="Actual", ylabel="Predicted")
    fig.suptitle(f"{best_name} on {out['data']['test_stores']} unseen stores")
    plt.tight_layout(); plt.savefig(FIG / "09_residuals.png", dpi=130); plt.close()

    # Linear-model residuals vs promo: a curve here = the straight-line assumption is wrong.
    lin_res = yte.values - fitted["Linear Regression"].predict(Xte)
    d = pd.DataFrame({"promo": Xte.promo_spend_k.values, "res": lin_res}).dropna()
    d["bin"] = pd.cut(d.promo, bins=np.arange(0, 560, 40))
    b = d.groupby("bin", observed=True).res.mean()
    out["linear_residual_by_promo_bin"] = {str(k): round(float(v), 3) for k, v in b.items()}
    plt.figure(figsize=(7, 4))
    plt.scatter(d.promo, d.res, s=8, alpha=0.3); plt.axhline(0, color="grey")
    plt.plot([i.mid for i in b.index], b.values, color="red", marker="o", lw=2, label="average error per bucket")
    plt.title("Linear model errors vs promo — a hill shape = not a straight line")
    plt.xlabel("Promo spend (Rs thousand)"); plt.ylabel("Actual − predicted (Rs lakh)"); plt.legend()
    plt.tight_layout(); plt.savefig(FIG / "10_linear_residual_vs_promo.png", dpi=130); plt.close()

    # ── 3. Does promo spend saturate? (partial dependence) ───────────────────
    grid = np.arange(0, 501, 25)
    Xpd = Xte.dropna().copy()
    curves = {}
    for n, m in fitted.items():
        vals = []
        for g in grid:
            Xpd["promo_spend_k"] = g
            vals.append(float(m.predict(Xpd).mean()))
        curves[n] = vals
    base = Xte.dropna().copy()
    truth = []
    for g in grid:
        base["promo_spend_k"] = g
        truth.append(float(base.apply(true_sales, axis=1).mean()))
    curves["TRUE hidden rule"] = truth

    def gain(c, a, b_):
        return round(c[list(grid).index(b_)] - c[list(grid).index(a)], 2)
    out["promo_saturation"] = {n: {"0→100k": gain(c, 0, 100), "100→200k": gain(c, 100, 200),
                                   "200→300k": gain(c, 200, 300), "300→400k": gain(c, 300, 400)} for n, c in curves.items()}
    plt.figure(figsize=(8, 4.5))
    for n, c in curves.items():
        plt.plot(grid, c, lw=3 if n.startswith("TRUE") else 2, ls="--" if n.startswith("TRUE") else "-", label=n)
    plt.axvspan(400, 500, color="grey", alpha=0.12, label="rare: only festive months")
    plt.title("What happens to average predicted sales as promo spend increases?")
    plt.xlabel("Promo spend (Rs thousand / month)"); plt.ylabel("Avg predicted sales (Rs lakh)"); plt.legend(fontsize=8)
    plt.tight_layout(); plt.savefig(FIG / "11_promo_saturation.png", dpi=130); plt.close()

    # ── 4. Which inputs matter most? (permutation importance on unseen stores)
    pi = permutation_importance(best, Xte, yte, n_repeats=15, random_state=SEED, scoring="neg_root_mean_squared_error")
    imp = pd.Series(pi.importances_mean, index=FEATURES).sort_values()
    out["importance_rmse_increase"] = {k: round(float(v), 3) for k, v in imp.sort_values(ascending=False).items()}
    imp.plot.barh(color="#f0ad4e", figsize=(7, 3.5))
    plt.title("If we scramble this column, error grows by … (Rs lakh)"); plt.xlabel("Increase in RMSE")
    plt.tight_layout(); plt.savefig(FIG / "12_feature_importance.png", dpi=130); plt.close()

    # ── 5. The noise floor: how good could ANY model get? ────────────────────
    clean = df.iloc[te].dropna()
    oracle = clean.apply(true_sales, axis=1)
    out["noise_floor"] = rnd(metrics(clean[TARGET], oracle))

    # ── 6. What-if on one real store-month from the unseen stores ─────────────
    cand = df.iloc[te].dropna()
    cand = cand[(cand.month == 6) & (cand.promo_spend_k.between(80, 140))]
    row = cand.iloc[(cand[TARGET] - cand[TARGET].median()).abs().argsort().iloc[0]]
    x0 = row[FEATURES].to_frame().T.astype({"store_size_sqft": float, "num_staff": int, "promo_spend_k": float,
                                            "competitor_distance_km": float, "month": int})
    p0, t0 = float(best.predict(x0)[0]), true_sales(x0.iloc[0])
    other_loc = "Urban" if row.location_type != "Urban" else "Rural"
    scenarios = {
        "Promo +₹50k": {"promo_spend_k": row.promo_spend_k + 50},
        "Promo cut to ₹0": {"promo_spend_k": 0.0},
        "Promo raised to ₹400k": {"promo_spend_k": 400.0},
        "Store +1,000 sq ft": {"store_size_sqft": row.store_size_sqft + 1000},
        "+2 staff": {"num_staff": row.num_staff + 2},
        "Competitor 2 km farther": {"competitor_distance_km": row.competitor_distance_km + 2},
        "Competitor opens next door (0.2 km)": {"competitor_distance_km": 0.2},
        f"Location → {other_loc}": {"location_type": other_loc},
        "Same store in November": {"month": 11},
    }
    whatif = []
    for label, change in scenarios.items():
        x1 = x0.copy()
        for k, v in change.items():
            x1[k] = v
        p1 = float(best.predict(x1)[0])
        whatif.append({"scenario": label, "model_pred": round(p1, 2), "model_change": round(p1 - p0, 2),
                       "true_rule_change": round(true_sales(x1.iloc[0]) - t0, 2)})
    out["whatif"] = {"store_id": row.store_id, "year": int(row.year), "month": int(row.month),
                     "inputs": {k: (v.item() if hasattr(v, "item") else v) for k, v in row[FEATURES].items()},
                     "actual_sales": round(float(row[TARGET]), 2), "predicted_sales": round(p0, 2), "scenarios": whatif}

    # ── 7. Save the deployable model (trained on the training stores) ────────
    out["feature_ranges"] = {c: [float(df[c].min()), float(df[c].max())] for c in NUM}
    joblib.dump({"pipeline": best, "name": best_name, "error_p80": out["residuals"]["abs_p80"],
                 "error_p90": out["residuals"]["abs_p90"], "ranges": out["feature_ranges"]}, MOD / "best_model.joblib")
    (REP / "results.json").write_text(json.dumps(out, indent=2, ensure_ascii=False))
    print(json.dumps({k: out[k] for k in ("best_model", "residuals", "noise_floor", "promo_saturation", "importance_rmse_increase", "whatif")},
                     indent=1, ensure_ascii=False))


if __name__ == "__main__":
    main()
