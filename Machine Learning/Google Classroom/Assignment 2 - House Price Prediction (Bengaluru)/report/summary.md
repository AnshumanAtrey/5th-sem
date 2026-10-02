# Assignment 2: House Price Prediction (summary)

**Anshuman Atrey** · Roll No. 150096724029 · B.Tech CSE 2024-28, Semester V · Machine Learning Fundamentals

| | |
|---|------------------|
| **dataset** | [Bengaluru House price data](https://www.kaggle.com/datasets/amitabhajoy/bengaluru-house-price-data) (kaggle), 13,320 listings |
| **my subset** | locations starting with "A" (568 rows, 85 locations). "bathrooms >= 9" left 1 row, so that rule was dropped |
| **cleaning** | `total_sqft` ranges to midpoints, 3 land-unit plots dropped, BHK from `size`, duplicates and missing rows dropped (536 left), `price_per_sqft` added |
| **final model** | Linear Regression: log(price) from log(area), BHK, bathrooms, location (one-hot, rare locations grouped), on 411 rows after outlier rules |

## results (80/20 split)

| step | test R² | 5-fold CV R² |
|---|---|---|
| v1 cleaned data, price as is | 0.403 | -1.887 |
| v2 log of price | 0.787 | 0.702 |
| v4 + outlier rules (sanity, price per sqft band) | 0.849 | 0.801 |
| **v6 + rare locations grouped + log of area** | **0.897** (train 0.873) | **0.855 ± 0.026** |

final test RMSE 34.0 lakh, MAE 13.9 lakh (median test price 66 lakh). **pass condition (test R² >= 0.75): passed**, with no train-test gap.

## what affected price the most

- **area:** the biggest driver. a 10% bigger flat costs about 11.5% more (correlation with price 0.71)
- **location:** average prices differ over 5 times between "A" areas. the model puts locations from 37% below to 92% above the baseline (AECS Layout)
- **BHK and bathrooms:** almost nothing once area is known (-2% and +2%). they move together (0.89), and more bedrooms in the same space just means smaller rooms

## why the model performs as it does

the raw prices are hugely skewed and a few listings are impossible or priced far off their neighbourhood, which wrecks a straight line (test R² 0.40). logs of price and area turn the relationship into a straight line, and the outlier rules remove listings no simple model should chase. the limits: those rules removed 125 listings, so the model is for typical flats, not luxury homes, and locations seen fewer than 3 times are lumped into "other".
