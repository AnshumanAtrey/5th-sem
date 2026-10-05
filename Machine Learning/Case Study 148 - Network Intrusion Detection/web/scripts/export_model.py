"""Export the trained models and results for the web app, so it predicts in the browser with no Python server.

The gradient-boosting models are plain lists of decision trees: each tree's nodes go to JSON, plus the cleaning
numbers (training medians, scaler means and spreads). Before writing anything, the same maths is redone here in plain
numpy and checked against sklearn's own predict_proba, and the web app's tests check the TypeScript version against
the same flows (tests/parity.json).

Run from the case study folder, after the notebook has saved models/ids_bundle.joblib:

    python web/scripts/export_model.py
"""
import json
import re
import shutil
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parents[2]
WEB = ROOT / "web"
sys.path.insert(0, str(ROOT / "src"))
from flows import FEATURES, LEAKY  # noqa: E402

bundle = joblib.load(ROOT / "models" / "ids_bundle.joblib")
results = json.loads((ROOT / "reports" / "results.json").read_text())
demo = pd.read_csv(ROOT / "data" / "demo_flows.csv")


def trees(model):
    """[[tree for each class] for each boosting round], each tree as parallel arrays of its nodes."""
    out = []
    for round_ in model._predictors:
        out.append([{"feature": p.nodes["feature_idx"].tolist(), "threshold": p.nodes["num_threshold"].tolist(),
                     "left": p.nodes["left"].tolist(), "right": p.nodes["right"].tolist(),
                     "leaf": p.nodes["is_leaf"].astype(int).tolist(), "value": p.nodes["value"].tolist(),
                     "missingLeft": p.nodes["missing_go_to_left"].astype(int).tolist()} for p in round_])
    return out


def export(pipe):
    model = pipe[-1]
    assert model.is_categorical_ is None or not model.is_categorical_.any(), "the browser code has no categorical splits"
    return {"baseline": model._baseline_prediction.ravel().tolist(), "trees": trees(model),
            "classes": [str(c) for c in model.classes_]}


def prep_numbers(pipe):
    return {"median": pipe.named_steps["fill"].statistics_.tolist(), "mean": pipe.named_steps["scale"].mean_.tolist(),
            "scale": pipe.named_steps["scale"].scale_.tolist()}


def numpy_proba(model_json, prep, X):
    """The browser's maths, in numpy: clean -> median fill -> log(1 + x) -> standardise -> sum of trees -> link."""
    x = X.to_numpy(dtype=float).copy()
    x[~np.isfinite(x) | (x < 0)] = np.nan
    x = np.where(np.isnan(x), prep["median"], x)
    x = (np.log1p(x) - prep["mean"]) / prep["scale"]
    raw = np.tile(model_json["baseline"], (len(x), 1))
    for round_ in model_json["trees"]:
        for k, t in enumerate(round_):
            for i, row in enumerate(x):
                node = 0
                while not t["leaf"][node]:
                    v = row[t["feature"][node]]
                    go_left = t["missingLeft"][node] if np.isnan(v) else v <= t["threshold"][node]
                    node = t["left"][node] if go_left else t["right"][node]
                raw[i, k] += t["value"][node]
    if raw.shape[1] == 1:
        p = 1 / (1 + np.exp(-raw[:, 0]))
        return np.column_stack([1 - p, p])
    e = np.exp(raw - raw.max(1, keepdims=True))
    return e / e.sum(1, keepdims=True)


binary, family = bundle["binary"], bundle["family"]
for a, b in zip(prep_numbers(binary).values(), prep_numbers(family).values()):
    assert np.allclose(a, b), "both models were trained on the same split, so their cleaning numbers must match"
model = {"features": FEATURES, "leaky": LEAKY, "prep": prep_numbers(binary), "binary": export(binary),
         "family": export(family)}

check = demo[FEATURES].head(200)
for name, pipe in (("binary", binary), ("family", family)):
    ours = numpy_proba(model[name], model["prep"], check)
    theirs = pipe.predict_proba(check)
    gap = np.abs(ours - theirs).max()
    assert gap < 1e-9, f"{name}: numpy re-implementation is off by {gap}"
    print(f"{name}: numpy version matches sklearn on {len(check)} flows (largest gap {gap:.1e})")

(WEB / "public").mkdir(exist_ok=True)
(WEB / "public" / "model.json").write_text(json.dumps(model, separators=(",", ":")))
shutil.copy(ROOT / "data" / "demo_flows.csv", WEB / "public" / "demo_flows.csv")

parity = {"flows": demo[FEATURES].head(300).to_dict("records"),
          "binary": binary.predict_proba(demo[FEATURES].head(300))[:, 1].tolist(),
          "family": family.predict_proba(demo[FEATURES].head(300)).tolist()}
(WEB / "tests").mkdir(exist_ok=True)
(WEB / "tests" / "parity.json").write_text(json.dumps(parity))

def dataset_counts():
    """Rows per label in the full dataset and in our sample: the table the notebook printed in section 2."""
    nb = json.loads((ROOT / "intrusion_detection.ipynb").read_text())
    cell = next(c for c in nb["cells"] if c["cell_type"] == "code" and "overview = pd.DataFrame" in "".join(c["source"]))
    html = next("".join(o["data"]["text/html"]) for o in cell["outputs"] if "text/html" in o.get("data", {}))
    cells = re.findall(r"<th[^>]*>([^<]+)</th>\s*<td[^>]*>([^<]+)</td>\s*<td[^>]*>(\d+)</td>\s*<td[^>]*>(\d+)</td>", html)
    rows = [{"label": label, "family": family, "full": int(full), "sample": int(kept)} for label, family, full, kept in cells]
    assert sum(r["full"] for r in rows) == results["flows_full"] and len(rows) == 34, "counts must match results.json"
    return rows


app = {key: bundle[key] for key in ("top_features", "examples", "thresholds", "comparison", "family_report", "unseen",
                                    "test", "n_train", "n_test", "dataset")}
app["results"] = results
app["counts"] = dataset_counts()
(WEB / "src" / "data").mkdir(parents=True, exist_ok=True)
(WEB / "src" / "data" / "app.json").write_text(json.dumps(app, indent=1, default=float, allow_nan=False))
size = (WEB / "public" / "model.json").stat().st_size / 1e6
print(f"wrote web/public/model.json ({size:.1f} MB), web/public/demo_flows.csv, web/tests/parity.json, "
      "web/src/data/app.json")
