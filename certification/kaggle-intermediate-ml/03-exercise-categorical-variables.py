# Kaggle Learn — Intermediate Machine Learning
# Exercise: Categorical Variables
# Source: 03-exercise-categorical-variables.ipynb

# --- Cell 1 ---
import pandas as pd
from sklearn.model_selection import train_test_split

# Read the data
X = pd.read_csv('../input/train.csv', index_col='Id') 
X_test = pd.read_csv('../input/test.csv', index_col='Id')

# Remove rows with missing target, separate target from predictors
X.dropna(axis=0, subset=['SalePrice'], inplace=True)
y = X.SalePrice
X.drop(['SalePrice'], axis=1, inplace=True)

# To keep things simple, we'll drop columns with missing values
cols_with_missing = [col for col in X.columns if X[col].isnull().any()] 
X.drop(cols_with_missing, axis=1, inplace=True)
X_test.drop(cols_with_missing, axis=1, inplace=True)

# Break off validation set from training data
X_train, X_valid, y_train, y_valid = train_test_split(X, y,
                                                      train_size=0.8, test_size=0.2,
                                                      random_state=0)

# --- Cell 2 ---
X_train.head()

# --- Cell 3 ---
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error

# function for comparing different approaches
def score_dataset(X_train, X_valid, y_train, y_valid):
    model = RandomForestRegressor(n_estimators=100, random_state=0)
    model.fit(X_train, y_train)
    preds = model.predict(X_valid)
    return mean_absolute_error(y_valid, preds)

# --- Cell 4 ---
# Step 1: Drop columns with categorical data

# 获取所有类别型列名
categorical_cols = [col for col in X_train.columns if X_train[col].dtype == "object"]

# 从训练集和验证集中删除这些列
drop_X_train = X_train.drop(categorical_cols, axis=1)
drop_X_valid = X_valid.drop(categorical_cols, axis=1)

# 检查是否正确
step_1.check()

# --- Cell 5 ---
# Lines below will give you a hint or solution code
#step_1.hint()
#step_1.solution()

# --- Cell 6 ---
print("MAE from Approach 1 (Drop categorical variables):")
print(score_dataset(drop_X_train, drop_X_valid, y_train, y_valid))

# --- Cell 7 ---
print("Unique values in 'Condition2' column in training data:", X_train['Condition2'].unique())
print("\nUnique values in 'Condition2' column in validation data:", X_valid['Condition2'].unique())

# --- Cell 8 ---
# Check your answer (Run this code cell to receive credit!)
step_2.a.check()

# --- Cell 9 ---
#step_2.a.hint()

# --- Cell 10 ---
# Categorical columns in the training data
object_cols = [col for col in X_train.columns if X_train[col].dtype == "object"]

# Columns that can be safely ordinal encoded
good_label_cols = [col for col in object_cols if 
                   set(X_valid[col]).issubset(set(X_train[col]))]
        
# Problematic columns that will be dropped from the dataset
bad_label_cols = list(set(object_cols)-set(good_label_cols))
        
print('Categorical columns that will be ordinal encoded:', good_label_cols)
print('\nCategorical columns that will be dropped from the dataset:', bad_label_cols)

# --- Cell 11 ---
from sklearn.preprocessing import OrdinalEncoder

# Drop categorical columns that will not be encoded
label_X_train = X_train.drop(bad_label_cols, axis=1)
label_X_valid = X_valid.drop(bad_label_cols, axis=1)

# Apply ordinal encoder
encoder = OrdinalEncoder()
label_X_train[good_label_cols] = encoder.fit_transform(label_X_train[good_label_cols])
label_X_valid[good_label_cols] = encoder.transform(label_X_valid[good_label_cols])

# Check your answer
step_2.b.check()

# --- Cell 12 ---
# Lines below will give you a hint or solution code
#step_2.b.hint()
#step_2.b.solution()

# --- Cell 13 ---
print("MAE from Approach 2 (Ordinal Encoding):") 
print(score_dataset(label_X_train, label_X_valid, y_train, y_valid))

# --- Cell 14 ---
# Get number of unique entries in each column with categorical data
object_nunique = list(map(lambda col: X_train[col].nunique(), object_cols))
d = dict(zip(object_cols, object_nunique))

# Print number of unique entries by column, in ascending order
sorted(d.items(), key=lambda x: x[1])

# --- Cell 15 ---
high_cardinality_numcols = 3
num_cols_neighborhood = 25

# Check your answers
step_3.a.check()

# --- Cell 16 ---
# Lines below will give you a hint or solution code
#step_3.a.hint()
#step_3.a.solution()

# --- Cell 17 ---
OH_entries_added = 990000
label_entries_added = 0

# Check your answers
step_3.b.check()

# --- Cell 18 ---
# Lines below will give you a hint or solution code
#step_3.b.hint()
#step_3.b.solution()

# --- Cell 19 ---
# Columns that will be one-hot encoded
low_cardinality_cols = [col for col in object_cols if X_train[col].nunique() < 10]

# Columns that will be dropped from the dataset
high_cardinality_cols = list(set(object_cols)-set(low_cardinality_cols))

print('Categorical columns that will be one-hot encoded:', low_cardinality_cols)
print('\nCategorical columns that will be dropped from the dataset:', high_cardinality_cols)

# --- Cell 20 ---
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer

# Apply one-hot encoder to each column with low cardinality
OH_encoder = OneHotEncoder(handle_unknown='ignore', sparse=False)

# Use column transformer to apply one-hot encoding only to low_cardinality_cols
OH_cols_train = X_train[low_cardinality_cols]
OH_cols_valid = X_valid[low_cardinality_cols]

# Remaining columns that are not categorical
num_X_train = X_train.drop(object_cols, axis=1)
num_X_valid = X_valid.drop(object_cols, axis=1)

# Fit and transform training data, transform validation data
OH_X_train = pd.DataFrame(OH_encoder.fit_transform(OH_cols_train))
OH_X_valid = pd.DataFrame(OH_encoder.transform(OH_cols_valid))

# One-hot encoding removes index; put it back
OH_X_train.index = X_train.index
OH_X_valid.index = X_valid.index

# Add numerical columns back
OH_X_train = pd.concat([num_X_train, OH_X_train], axis=1)
OH_X_valid = pd.concat([num_X_valid, OH_X_valid], axis=1)

# Check your answer
step_4.check()

# --- Cell 21 ---
# Lines below will give you a hint or solution code
#step_4.hint()
#step_4.solution()

# --- Cell 22 ---
print("MAE from Approach 3 (One-Hot Encoding):") 
print(score_dataset(OH_X_train, OH_X_valid, y_train, y_valid))

# --- Cell 23 ---
# (Optional) Your code here

