"""The saved model is the one that was evaluated, and the headline claims hold."""
import sys
from pathlib import Path

import joblib
import numpy as np
import pytest
import sklearn
from sklearn.metrics import mean_absolute_error

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "src"))
from features import TARGET, build_table, load_raw, model_rows  # noqa: E402


@pytest.fixture(scope="module")
def bundle():
    return joblib.load(ROOT / "models" / "best_model.joblib")


@pytest.fixture(scope="module")
def test_weeks(bundle):
    df = model_rows(build_table(*load_raw()))
    return df[df.Date >= bundle["test_weeks"][0]]


def test_saved_model_reproduces_its_reported_test_score(bundle, test_weeks):
    pred = np.clip(bundle["pipeline"].predict(test_weeks[bundle["features"]]), 0, None)
    assert len(test_weeks) > 50000
    assert mean_absolute_error(test_weeks[TARGET], pred) == pytest.approx(bundle["test_metrics"]["MAE"], abs=0.01)
    assert (pred >= 0).all()


def test_model_beats_both_simple_rules_on_the_test_weeks(bundle):
    assert bundle["test_metrics"]["MAE"] < bundle["rule_test_metrics"]["MAE"] < bundle["naive_test_metrics"]["MAE"]


def test_model_file_matches_installed_scikit_learn(bundle):
    assert bundle["sklearn_version"] == sklearn.__version__
