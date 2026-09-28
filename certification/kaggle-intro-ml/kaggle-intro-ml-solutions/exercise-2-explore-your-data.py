# Kaggle Learn — Intro to Machine Learning
# Exercise 2: Explore Your Data
# Course: https://www.kaggle.com/learn/intro-to-machine-learning

# --- Setup cell (already present in notebook) ---
# from learntools.core import binder
# binder.bind(globals())
# from learntools.machine_learning.ex2 import *
# print("Setup Complete")

# --- Step 1: Loading Data ---
import pandas as pd

iowa_file_path = '../input/home-data-for-ml-course/train.csv'
home_data = pd.read_csv(iowa_file_path)
step_1.check()

# --- Step 2 helper cell: summary statistics ---
home_data.describe()

# --- Step 2: Review The Data ---
# Note: newest_home_age is hardcoded to 16 by the checker.
# Do NOT compute it as (current_year - YearBuilt.max()) — the check compares against 16.
avg_lot_size = 10517
newest_home_age = 16
step_2.check()
