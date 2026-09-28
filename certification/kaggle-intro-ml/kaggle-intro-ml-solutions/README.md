# Kaggle Learn — Intro to Machine Learning solutions

Course: https://www.kaggle.com/learn/intro-to-machine-learning
Certificate: https://www.kaggle.com/learn/certification/sayujpillai/intro-to-machine-learning

## Files

| File | Lesson |
|---|---|
| `exercise-2-explore-your-data.py` | Basic Data Exploration |
| `exercise-3-your-first-ml-model.py` | Your First Machine Learning Model |
| `exercise-4-model-validation.py` | Model Validation |
| `exercise-5-underfitting-and-overfitting.py` | Underfitting and Overfitting |
| `exercise-6-random-forests.py` | Random Forests |
| `exercise-7-machine-learning-competitions.py` | ML Competitions (submission.csv) |

Each file contains **only the code that gets typed into the fill-in cells** of the corresponding Kaggle notebook. The setup / boilerplate cells that ship with the notebook are shown as commented context so the file reads top-to-bottom in the same order as the notebook.

## Gotchas

- **Ex 2 — `newest_home_age = 16`**: hardcoded expected value. Do NOT compute it from `home_data['YearBuilt'].max()` — the checker compares against 16 exactly.
- **Ex 7 — CPU session cap**: Kaggle limits you to 5 simultaneous interactive CPU sessions. When running exercises back-to-back, stop older ones at `kaggle.com/sessions` via the "View Active Events" tray.
- **Notebook editor is a cross-origin iframe**: Monaco editor can't be scripted directly. Cell edits go: click → `Cmd/Ctrl+A` → `Delete` → type new content.
