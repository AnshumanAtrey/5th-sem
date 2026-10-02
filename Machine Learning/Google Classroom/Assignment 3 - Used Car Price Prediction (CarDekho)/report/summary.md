# Assignment 3: Used Car Price Prediction (summary)

**Anshuman Atrey** · Roll No. 150096724029 · B.Tech CSE 2024-28, Semester V · Machine Learning Fundamentals

| | |
|---|------------------|
| **dataset** | [Vehicle dataset from CarDekho](https://www.kaggle.com/datasets/nehalbirla/vehicle-dataset-from-cardekho) (kaggle), `CAR DETAILS FROM CAR DEKHO.csv`, 4,340 listings |
| **my subset** | roll number 150096724029 mod 3 = 0, so **Petrol** cars: 2,123 listings |
| **cleaning** | 406 duplicate listings dropped (1,717 left), `car_age` = 2020 - year, brand and model from `name`, categories one-hot encoded (fuel is constant, so it drops out) |
| **final model** | Linear Regression: log(price) from car age, km driven, transmission, owner, seller type, brand and model, on 1,667 cars after removing the extreme 1% |

## results (80/20 split)

| step | test R² | 5-fold CV R² |
|---|---|---|
| v1 handout features, price as is | 0.418 | 0.350 |
| v2 log of price | 0.621 | 0.629 |
| v3-v4 + outliers removed + seller type | 0.664 | 0.643 |
| v5 + brand | 0.703 | 0.722 |
| **v6 + model (final)** | **0.840** (train 0.868) | **0.848 ± 0.016** |

final test RMSE 0.89 lakh, MAE 0.55 lakh (median test price 2.5 lakh). **pass condition (test R² >= 0.75): passed**, train-test gap 0.028.

## what reduced resale value the most

- **age:** -8.6% for every extra year (holding everything else fixed). on a log scale price falls in a straight line with age
- **gearbox:** a manual sells for 14.2% less than the same car as an automatic
- **seller:** individuals get 10.9% less than dealers
- **km driven:** -2.1% per 10,000 km, smaller than it looks, because high-km cars are mostly old cars too
- **which car it is:** brand and model took test R² from 0.66 to 0.84

## why the model performs as it does

cars lose value in percentages, so a straight line on raw rupees fits badly (0.42). log(price) makes the age effect a straight line, and brand and model tell the model what kind of car it is. limits: models seen fewer than 10 times are grouped as "other", and the typical error is about 55,000 rupees.
