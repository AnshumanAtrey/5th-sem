# Assignment 4 - Student Exam Score Prediction

| field | value |
|-------|-------|
| platform | Google Classroom, course "ML(Elon Musk)" |
| due | 2026-08-18 18:29 UTC |
| points | 10 |
| status when saved | not turned in (late) |
| link | https://classroom.google.com/c/ODcxODMzMTg3Mjky/a/ODcyMjI2NDgyODU0/details |
| attachment | `handout.pdf` |

> **Question:** Assignment 4: Student Exam Score Prediction, Study Habits Dataset. Full task in `handout.pdf` (page 4).
> Also posted on Lisa as `Assignment-4` (upload slot, due 2026-09-30, trainer Swapnil Wable).

## Personalised subset (mandatory, done first)

- rows where gender matches the student's own gender (**to confirm with Anshuman**)
- AND study_hours >= (roll mod 5) + 1 = (150096724029 mod 5) + 1 = **5**
- if fewer than 150 rows, drop the study-hours rule and keep the gender filter only

## Tasks (from the handout)

1. EDA: missing values, duplicates, outliers in exam scores and study hours
2. Clean: missing values, encode categorical fields (part-time job, internet access, ...)
3. 5+ labelled plots with insights: score distribution, study_hours vs score, score by part-time job (boxplot), correlation heatmap, average score by sleep-hours bucket
4. Linear Regression: exam score from study_hours + at least 3 other features
5. 80/20 split, test R-squared + RMSE, refine (scaling, drop weak features, outliers)
6. half-page summary of which habits mattered most

**Pass condition:** test R-squared >= 0.70. **Deliverables:** notebook (.ipynb) + 1-page PDF summary (+ doc file of code and output).
**Grading:** EDA & cleaning 2 · visualisations 3 · model performance 3 · code clarity + summary 2.
