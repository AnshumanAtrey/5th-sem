# Assignment 3 - Used Car Price Prediction

| field | value |
|-------|-------|
| platform | Google Classroom, course "ML(Elon Musk)" |
| due | 2026-08-18 18:29 UTC |
| points | 10 |
| status when saved | not turned in (late) |
| link | https://classroom.google.com/c/ODcxODMzMTg3Mjky/a/ODU1ODI1NzM4MDY0/details |
| attachment | `handout.pdf` |

> **Question:** Assignment 3: Used Car Price Prediction, CarDekho Dataset. Full task in `handout.pdf` (page 3).
> Also posted on Lisa as `Assignment-3` (upload slot, due 2026-09-30, trainer Swapnil Wable).

## Personalised subset (mandatory, done first)

- fuel type from roll number mod 3: 150096724029 mod 3 = **0 -> Petrol**
- if fewer than 150 rows, add Petrol cars until 150 (already Petrol)

## Tasks (from the handout)

1. EDA: data types, missing values, duplicate listings, outliers in `selling_price` and `km_driven`
2. Clean: `car_age` from the year, encode fuel, seller_type, transmission, owner
3. 5+ labelled plots with insights: price distribution, price by transmission (boxplot), car_age vs price, km_driven vs price, correlation heatmap
4. Linear Regression: selling_price from car_age, km_driven, fuel, transmission, owner
5. 80/20 split, test R-squared + RMSE, improve (log price, outliers, features). report train and test R-squared
6. half-page summary of what reduced resale value the most

**Pass condition:** test R-squared >= 0.75. **Deliverables:** notebook (.ipynb) + 1-page PDF summary (+ doc file of code and output).
**Grading:** EDA & cleaning 2 · visualisations 3 · model performance 3 · code clarity + summary 2.
