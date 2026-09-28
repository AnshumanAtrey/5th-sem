"""Exploratory Data Analysis: charts → figures/, key numbers → reports/eda.json."""
import json
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

ROOT = Path(__file__).resolve().parents[1]
FIG, REP = ROOT / "figures", ROOT / "reports"
NUM = ["store_size_sqft", "num_staff", "promo_spend_k", "competitor_distance_km", "month"]
TARGET = "monthly_sales_lakh"
MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]


def save(name):
    plt.tight_layout()
    plt.savefig(FIG / name, dpi=130)
    plt.close()


def main():
    FIG.mkdir(exist_ok=True)
    REP.mkdir(exist_ok=True)
    df = pd.read_csv(ROOT / "data" / "retail_sales.csv")
    sns.set_theme(style="whitegrid")
    facts = {"rows": len(df), "stores": df.store_id.nunique(), "months": int(df.groupby("store_id").size().iloc[0])}

    # 1. Missing values
    miss = df.isna().mean().mul(100).round(1)
    facts["missing_pct"] = miss[miss > 0].to_dict()
    miss[miss > 0].plot.bar(color="#d9534f", figsize=(5, 3.2), title="Missing values (%)")
    plt.ylabel("% of rows")
    save("01_missing_values.png")

    # 2. Target distribution
    s = df[TARGET]
    facts["sales"] = {k: round(float(v), 2) for k, v in s.describe().items()}
    facts["sales_skew"] = round(float(s.skew()), 2)
    ax = sns.histplot(s, bins=40, kde=True, color="#337ab7")
    ax.axvline(s.mean(), color="red", ls="--", label=f"mean Rs {s.mean():.1f}L")
    ax.axvline(s.median(), color="green", ls="--", label=f"median Rs {s.median():.1f}L")
    ax.set(title="Monthly sales per store (target)", xlabel="Monthly sales (Rs lakh)")
    ax.legend()
    save("02_target_distribution.png")

    # 3. Correlation heatmap
    corr = df[NUM + [TARGET]].corr()
    facts["corr_with_sales"] = corr[TARGET].drop(TARGET).round(3).sort_values(ascending=False).to_dict()
    facts["corr_size_staff"] = round(float(corr.loc["store_size_sqft", "num_staff"]), 3)
    plt.figure(figsize=(6.5, 5))
    sns.heatmap(corr, annot=True, fmt=".2f", cmap="coolwarm", vmin=-1, vmax=1)
    plt.title("Correlation (−1 … +1)")
    save("03_correlation_heatmap.png")

    # 4. Sales by location
    order = ["Urban", "Semi-Urban", "Rural"]
    facts["mean_sales_by_location"] = df.groupby("location_type")[TARGET].mean().round(2).reindex(order).to_dict()
    sns.boxplot(data=df, x="location_type", y=TARGET, hue="location_type", order=order, palette="Set2", legend=False)
    plt.title("Sales by location type")
    plt.ylabel("Monthly sales (Rs lakh)")
    save("04_sales_by_location.png")

    # 5. Seasonality
    by_m = df.groupby("month")[TARGET].mean()
    facts["mean_sales_by_month"] = {MONTH_NAMES[m - 1]: round(float(v), 2) for m, v in by_m.items()}
    plt.figure(figsize=(7, 3.5))
    plt.plot(MONTH_NAMES, by_m.values, marker="o")
    plt.axhline(s.mean(), color="grey", ls="--", lw=1)
    plt.title("Average sales by month (festive peak Oct–Dec)")
    plt.ylabel("Rs lakh")
    save("05_seasonality.png")

    # 6. Promo vs sales — the saturation question
    d = df.dropna(subset=["promo_spend_k"]).copy()
    d["promo_bin"] = pd.cut(d.promo_spend_k, bins=np.arange(0, 560, 40))
    binned = d.groupby("promo_bin", observed=True)[TARGET].mean()
    facts["mean_sales_by_promo_bin"] = {str(k): round(float(v), 2) for k, v in binned.items()}
    plt.figure(figsize=(7, 4))
    plt.scatter(d.promo_spend_k, d[TARGET], s=6, alpha=0.25, label="each store-month")
    plt.plot([i.mid for i in binned.index], binned.values, color="red", marker="o", lw=2, label="average per Rs 40k bucket")
    plt.title("Promo spend vs sales — does the curve flatten?")
    plt.xlabel("Promotional spend (Rs thousand / month)")
    plt.ylabel("Monthly sales (Rs lakh)")
    plt.legend()
    save("06_promo_vs_sales.png")

    # 7. Size vs sales, coloured by location
    sns.scatterplot(data=df, x="store_size_sqft", y=TARGET, hue="location_type", hue_order=order, s=10, alpha=0.5)
    plt.title("Bigger stores sell more")
    save("07_size_vs_sales.png")

    (REP / "eda.json").write_text(json.dumps(facts, indent=2))
    print(json.dumps(facts, indent=2))


if __name__ == "__main__":
    main()
