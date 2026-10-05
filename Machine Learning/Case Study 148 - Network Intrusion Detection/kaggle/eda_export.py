"""The numbers behind the web app's Explore tab, computed on the exact sample the notebook uses.

Same sampling function, same seed, same cleaning, same split as intrusion_detection.ipynb, so every chart on the site
matches the notebook's figures. Writes reports/eda.json. Runs on Kaggle (python3 kaggle/run_on_kaggle.py eda); run
locally it falls back to whatever CSV parts are in data/ (a quick stand-in, not the real numbers).
"""
import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.cluster.hierarchy import dendrogram, linkage
from sklearn.decomposition import PCA
from sklearn.model_selection import train_test_split

sys.path.insert(0, "src")
from flows import BENIGN, CATEGORIES, COLUMNS, FEATURES, LABEL, category, pipeline, sample_flows  # noqa: E402

SEED = 42
ON_KAGGLE = Path("/kaggle/input").exists()
paths = sorted((Path("/kaggle/input") if ON_KAGGLE else Path("data")).rglob("part-*.csv"))
caps = (12_000, 120_000) if ON_KAGGLE else (1_500, 15_000)

# 1. the same sample and cleaning as notebook sections 2 and 3
raw, full_counts = sample_flows(paths, *caps, seed=SEED)
df = raw.drop_duplicates()
df = df[~df.duplicated(COLUMNS, keep=False)].reset_index(drop=True)
df["family"] = df[LABEL].map(category)
if ON_KAGGLE:
    assert len(df) == 458_995, "must be the notebook's exact sample"
shuffled = df.sample(frac=1, random_state=SEED)

# 2. how the families differ: the spread of a few telling columns per family (raw values)
KEY = ["Rate", "Tot size", "flow_duration", "Header_Length", "rst_count", "syn_count", "urg_count", "IAT"]
QS = [0.05, 0.25, 0.5, 0.75, 0.95]
spread = {col: {fam: [float(v) for v in df.loc[df.family == fam, col].quantile(QS)] for fam in CATEGORIES}
          for col in KEY}

# 3. which columns say the same thing (notebook section 4: correlation of log(1 + x))
varying = [c for c in COLUMNS if df[c].nunique() > 1]
corr = np.log1p(df[varying]).corr()
pairs = corr.abs().where(np.triu(np.ones(corr.shape, dtype=bool), 1)).stack().sort_values(ascending=False)

# 4. the 2-D map (notebook section 4: up to 2,500 rows per family, log, standardise, PCA)
pca_rows = shuffled[shuffled.groupby("family").cumcount() < 2500]
pca_x = np.log1p(pca_rows[FEATURES])
z = (pca_x - pca_x.mean()) / pca_x.std().replace(0, 1)
pca = PCA(n_components=2, random_state=SEED)
xy = pca.fit_transform(z)
keep_cum = np.cumsum(PCA(random_state=SEED).fit(z).explained_variance_ratio_)
shown = (pca_rows.groupby("family").cumcount() < 400).to_numpy()      # 400 dots per family is plenty to see the shape

# 5. the family tree (notebook section 12: each label's average row after the training-only cleaning, Ward linkage)
X_train, _, yl_train, _ = train_test_split(df[FEATURES], df[LABEL], test_size=0.25, random_state=SEED, stratify=df[LABEL])
prep = pipeline(None)[:-1].fit(X_train)
profiles = pd.DataFrame(prep.transform(X_train), index=X_train.index).groupby(yl_train).mean()
tree = dendrogram(linkage(profiles, method="ward"), labels=profiles.index.tolist(), no_plot=True)

# 6. the cheating column: IAT values per family (notebook section 5 draws up to 3,000 per family)
look = shuffled[shuffled.groupby("family").cumcount() < 250]

eda = {
    "rows": len(df), "on_kaggle": ON_KAGGLE,
    "spread": {"quantiles": QS, "columns": spread},
    "corr": {"columns": varying, "matrix": corr.round(3).to_numpy().tolist(),
             "top": [{"a": a, "b": b, "r": round(float(r), 3)} for (a, b), r in pairs.head(12).items()]},
    "pca": {"x": xy[shown, 0].round(3).tolist(), "y": xy[shown, 1].round(3).tolist(),
            "family": pca_rows.family[shown].tolist(), "explained": [round(float(v), 4) for v in pca.explained_variance_ratio_],
            "cumulative": [round(float(v), 4) for v in keep_cum], "rows": len(pca_rows)},
    "tree": {"icoord": tree["icoord"], "dcoord": tree["dcoord"], "leaves": tree["ivl"],
             "families": [category(label) for label in tree["ivl"]]},
    "iat": {fam: look.loc[look.family == fam, "IAT"].round(0).astype(int).tolist() for fam in CATEGORIES},
}
Path("reports").mkdir(exist_ok=True)
Path("reports/eda.json").write_text(json.dumps(eda))
print(f"reports/eda.json: {len(df):,} rows, {len(varying)} varying columns, {int(shown.sum())} map dots, "
      f"{len(tree['ivl'])} tree leaves")
