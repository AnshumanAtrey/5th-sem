"""Generate the synthetic retail-store dataset (Case Study 28 allows this — see README §2).

60 stores x 36 months (Jan 2023 - Dec 2025) = 2,160 rows of monthly sales.
Every rule below is the *hidden truth* the models have to rediscover.
"""
from pathlib import Path

import numpy as np
import pandas as pd

SEED = 42
N_STORES = 60
MONTHS = pd.period_range("2023-01", "2025-12", freq="M")

LOCATION_SHARE = {"Urban": 0.40, "Semi-Urban": 0.35, "Rural": 0.25}
LOCATION_MULT = {"Urban": 1.20, "Semi-Urban": 1.00, "Rural": 0.80}
COMPETITOR_MEAN_KM = {"Urban": 1.5, "Semi-Urban": 4.0, "Rural": 9.0}
# Indian retail calendar: Diwali in Oct/Nov, year-end in Dec, slow Jan/Feb and monsoon.
SEASON = {1: 0.92, 2: 0.94, 3: 1.00, 4: 1.00, 5: 0.98, 6: 0.97,
          7: 0.95, 8: 1.00, 9: 1.03, 10: 1.18, 11: 1.22, 12: 1.12}


def promo_effect(promo_k):
    """Saturating returns: max +₹6 lakh, ~63% of it reached by ₹120k spend."""
    return 6.0 * (1 - np.exp(-promo_k / 120.0))


def main():
    rng = np.random.default_rng(SEED)

    # ── fixed per-store attributes ────────────────────────────────────────────
    loc = rng.choice(list(LOCATION_SHARE), size=N_STORES, p=list(LOCATION_SHARE.values()))
    size = rng.uniform(2000, 15000, N_STORES).round(-1)
    staff = np.clip(np.round(4 + size / 1000 * 1.1 + rng.normal(0, 1.5, N_STORES)), 5, 30).astype(int)
    comp = np.clip([rng.exponential(COMPETITOR_MEAN_KM[l]) for l in loc], 0.1, 25).round(2)
    hidden_quality = rng.normal(1.0, 0.05, N_STORES)  # manager quality etc. — NOT given to the model

    rows = []
    for s in range(N_STORES):
        for p in MONTHS:
            m = p.month
            promo = rng.uniform(0, 400) * (1.3 if m in (10, 11, 12) else 1.0)
            core = (3 + 0.0011 * size[s]) * LOCATION_MULT[loc[s]] \
                + 0.25 * staff[s] + promo_effect(promo) + 1.2 * np.log1p(comp[s])
            sales = core * SEASON[m] * hidden_quality[s] * rng.normal(1.0, 0.06)
            rows.append({
                "store_id": f"S{s + 1:02d}", "year": p.year, "month": m,
                "store_size_sqft": size[s], "location_type": loc[s], "num_staff": staff[s],
                "promo_spend_k": round(promo, 1), "competitor_distance_km": comp[s],
                "monthly_sales_lakh": round(sales, 2),
            })
    df = pd.DataFrame(rows)

    # Real data has holes: the case study asks us to handle missing competitor + promo values.
    df.loc[rng.random(len(df)) < 0.08, "competitor_distance_km"] = np.nan
    df.loc[rng.random(len(df)) < 0.06, "promo_spend_k"] = np.nan

    out = Path(__file__).resolve().parents[1] / "data" / "retail_sales.csv"
    out.parent.mkdir(exist_ok=True)
    df.to_csv(out, index=False)
    print(f"wrote {len(df)} rows × {df.shape[1]} cols → {out.name}")


if __name__ == "__main__":
    main()
