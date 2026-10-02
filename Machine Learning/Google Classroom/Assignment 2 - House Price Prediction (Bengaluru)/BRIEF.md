# Assignment 2 - House Price Prediction

| field | value |
|-------|-------|
| platform | Google Classroom, course "ML(Elon Musk)" |
| due | 2026-08-18 18:29 UTC |
| points | 10 |
| status when saved | not turned in (late) |
| link | https://classroom.google.com/c/ODcxODMzMTg3Mjky/a/ODcyMjI0MTE3MTE3/details |
| attachment | `handout.pdf` |

> **Question:** Assignment 2: House Price Prediction, Bengaluru Housing Data. Full task in `handout.pdf` (page 1).

## Personalised subset (mandatory, done first)

- locations whose name starts with **A** (first letter of Anshuman)
- AND bathrooms >= **9** (last digit of roll number 150096724029)
- if that leaves fewer than 150 rows, drop the bathroom rule and keep the location filter only

## Tasks (from the handout)

1. EDA: shape, data types, missing values, duplicates, outliers in price and area
2. Clean: missing values, convert `total_sqft` ranges (e.g. `2100-2850`) to one number, add `price_per_sqft`
3. 5+ labelled plots with a 2-3 line insight each: price distribution, price by BHK (boxplot), area vs price, correlation heatmap, average price by location
4. Linear Regression: price from area, BHK, bathrooms, location (one-hot)
5. 80/20 split, test R-squared + RMSE, iterate (outliers, log price, features). report train and test R-squared
6. half-page summary of what drives price

**Pass condition:** test R-squared >= 0.75 without overfitting. **Deliverables:** notebook (.ipynb) + 1-page PDF summary (+ doc file of code and output).
**Grading:** EDA & cleaning 2 · visualisations 3 · model performance 3 · code clarity + summary 2.
