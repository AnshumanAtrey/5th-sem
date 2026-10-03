# Assignment 4: Student Exam Score Prediction (summary)

**Anshuman Atrey** · Roll No. 150096724029 · B.Tech CSE 2024-28, Semester V · Machine Learning Fundamentals

| | |
|---|------------------|
| **dataset** | [Student Habits vs Academic Performance](https://www.kaggle.com/datasets/jayaantanaath/student-habits-vs-academic-performance) (kaggle), 1,000 students |
| **my subset** | male students: 477. "study hours >= 5" (roll mod 5 + 1) left 80, fewer than 150, so that rule was dropped |
| **cleaning** | 37 missing `parental_education_level` values set to "Unknown", no duplicates, text columns one-hot encoded, gender constant so it drops out |
| **final model** | Linear Regression on 7 daily habits: study hours, social media, netflix, attendance, sleep, exercise, mental health |

## results (80/20 split)

| version | test R² | 5-fold CV R² |
|---|---|---|
| v1 study hours only | 0.710 | 0.658 |
| v2 + sleep, attendance, social media | 0.752 | 0.713 |
| v3 + all daily habits | 0.916 | 0.897 |
| v4 + text columns (no gain) | 0.913 | 0.896 |
| **v5 weak features dropped (final)** | **0.916** (train 0.905) | **0.898 ± 0.012** |

feature scaling (v6) gives exactly the same R², as it always does for linear regression. test RMSE 5.17 marks, MAE 4.17. **pass condition (test R² >= 0.70): passed**, no train-test gap.

## which habits mattered most

- **study hours:** about +9.6 marks per extra hour a day, by far the strongest (alone it explains about 70%)
- **mental health:** +2.0 marks per rating point, a clear second
- **sleep:** 7 to 8 hours is the best band (74 average, against 65 under 5 hours), +1.9 marks per hour
- **exercise:** +1.5 marks per weekly session
- **screen time:** -2.3 per daily hour of social media, -2.2 per hour of netflix
- **part-time job and attendance:** small (about -2 marks and +0.15 per percent)

## why the model performs as it does

the habits hardly move together (no pair above 0.08), so each one explains a different part of the score and a straight line on all 7 fits well. limits: the data looks synthetic and very clean, and scores are capped at 100, which squeezes the top end.
