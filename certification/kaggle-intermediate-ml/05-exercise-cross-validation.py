# Kaggle Learn — Intermediate Machine Learning
# Exercise: Cross-Validation
# Source: 05-exercise-cross-validation.ipynb

# --- Cell 1 ---
import pandas as pd
from sklearn.model_selection import train_test_split

# Read the data
train_data = pd.read_csv('../input/train.csv', index_col='Id')
test_data = pd.read_csv('../input/test.csv', index_col='Id')

# Remove rows with missing target, separate target from predictors
train_data.dropna(axis=0, subset=['SalePrice'], inplace=True)
y = train_data.SalePrice              
train_data.drop(['SalePrice'], axis=1, inplace=True)

# Select numeric columns only
numeric_cols = [cname for cname in train_data.columns if train_data[cname].dtype in ['int64', 'float64']]
X = train_data[numeric_cols].copy()
X_test = test_data[numeric_cols].copy()

# --- Cell 2 ---
X.head()

# --- Cell 3 ---
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer

my_pipeline = Pipeline(steps=[
    ('preprocessor', SimpleImputer()),
    ('model', RandomForestRegressor(n_estimators=50, random_state=0))
])

# --- Cell 4 ---
from sklearn.model_selection import cross_val_score

# Multiply by -1 since sklearn calculates *negative* MAE
scores = -1 * cross_val_score(my_pipeline, X, y,
                              cv=5,
                              scoring='neg_mean_absolute_error')

print("Average MAE score:", scores.mean())

# --- Cell 5 ---
from sklearn.ensemble import RandomForestRegressor
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.model_selection import cross_val_score

def get_score(n_estimators):
    """Return the average MAE over 3 CV folds of random forest model."""
    model = RandomForestRegressor(n_estimators=n_estimators, random_state=0)

    my_pipeline = Pipeline(steps=[
        ('imputer', SimpleImputer()),
        ('model', model)
    ])

    scores = -1 * cross_val_score(my_pipeline, X, y,
                                  cv=3,
                                  scoring='neg_mean_absolute_error')
    return scores.mean()


# Check your answer
step_1.check()

# --- Cell 6 ---
# Lines below will give you a hint or solution code
#step_1.hint()
#step_1.solution()

# --- Cell 7 ---
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import cross_val_score

def get_score(n_estimators):
    """Return the average MAE over 3 CV folds of random forest model."""
    my_pipeline = Pipeline(steps=[
        ('imputer', SimpleImputer()),
        ('model', RandomForestRegressor(n_estimators=n_estimators, random_state=0))
    ])
    # scoring='neg_mean_absolute_error' 代表使用 MAE
    scores = -1 * cross_val_score(my_pipeline, X, y,
                                  cv=3,
                                  scoring='neg_mean_absolute_error')
    return scores.mean()
results = {n: get_score(n) for n in [50, 100, 150, 200, 250, 300, 350, 400]} # Your code here

# Check your answer
step_2.check()

# --- Cell 8 ---
# Lines below will give you a hint or solution code
#step_2.hint()
#step_2.solution()

# --- Cell 9 ---
import matplotlib.pyplot as plt
%matplotlib inline

plt.plot(list(results.keys()), list(results.values()))
plt.show()

# --- Cell 10 ---
n_estimators_best = 200

# Check your answer
step_3.check()

# --- Cell 11 ---
# Lines below will give you a hint or solution code
#step_3.hint()
#step_3.solution()

