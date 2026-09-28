# 🛒 Retail Store Sales Prediction — Group 12

**Machine Learning Fundamentals · Semester V · Problem statement = ML Case Study 28** (`problem-statement.pdf`)

> **The whole project in one breath:** A shop chain wants to know *"how much will this store sell next month?"* so it can stock the right amount of goods and roster the right number of staff. We gave a computer 3 years of monthly sales from 48 shops, let 5 different "prediction methods" learn the pattern, then tested them on **12 shops they had never seen**. The winner — **Polynomial Regression** — predicts a new shop's monthly sales with a typical miss of **±₹1.5 lakh on ~₹21.6 lakh (≈7%)**, and it correctly discovered that **promotion money stops working after a point**.

---

## 1. What exactly are we predicting? (the "target")

The **target** is the one number we want the machine to guess: **`monthly_sales_lakh`** — one store's total sales in one month, in ₹ lakh.

Everything else is an **input** (a clue):

| Input (clue) | Meaning | Example |
|---|---|---|
| `store_size_sqft` | Floor area of the shop | 6,950 sq ft |
| `num_staff` | People working there | 10 |
| `location_type` | Urban / Semi-Urban / Rural | Urban |
| `promo_spend_k` | Money spent on ads & offers that month (₹ thousand) | 82.5 → ₹82,500 |
| `competitor_distance_km` | How far the nearest rival shop is | 1.15 km |
| `month` | Which month (1–12) | 6 = June |

**Why "sales as a target" is special:** it's a *number that can be anything* (₹6.3 L, ₹21.3 L, ₹45.9 L…), not a yes/no. Guessing a number is called **regression**. (Guessing a category like "spam / not spam" is *classification* — that's a different kind of problem.)

**Think of it like this:** the model is a very fast shop-manager who has seen 1,728 monthly reports. You describe a shop → it says "this shop should do about ₹19.6 lakh this month, give or take ₹2.4 lakh."

---

## 2. The data — where it came from and why it's honest

The case study says: *"BigMart Sales Data (Kaggle) is the closest public match, although its attributes differ… Otherwise students may generate synthetic data with the same attributes… and must explain how it was generated."*

BigMart has *product* sales, no staff count, no competitor distance, no promo spend — so it can't answer the questions asked. We therefore **generated realistic data with exactly the requested attributes** (`src/generate_data.py`, fixed seed = 42, so it's the same every run).

**How it was generated (the hidden "rulebook"):**

| Rule | What it means in plain words |
|---|---|
| Base sales = `3 + 0.0011 × size` | Every extra 1,000 sq ft ≈ +₹1.1 lakh (before location/season) |
| Location multiplier: Urban ×1.20, Semi-Urban ×1.00, Rural ×0.80 | Same shop sells 20% more in a city, 20% less in a village |
| Staff: +₹0.25 lakh per person | More hands → more customers served |
| Promo: `6 × (1 − e^(−promo/120))` | **Saturates.** First ₹120k gives ~₹3.8 L; after that each rupee helps less and less; max possible +₹6 L |
| Competitor: `+1.2 × log(1 + km)` | Rival far away helps, but going from 10 km → 12 km barely matters |
| Season: Oct ×1.18, **Nov ×1.22** (Diwali), Dec ×1.12, Jan ×0.92, Jul ×0.95… | Indian retail calendar |
| Hidden store quality ×(1 ± 5%) | Good vs bad store manager — **we don't give this to the model** |
| Random noise ×(1 ± 6%) | Weather, a cricket match, luck |
| 8% of competitor distances + 6% of promo values deleted | Real data has holes (the case asks us to handle this) |

Also realistic: bigger shops get more staff (size and staff are **92.5% correlated**).

**Why this is actually a strength in the viva:** because *we* wrote the rules, we can **check whether each model rediscovered the truth** — something you can never do with Kaggle data. You'll see "model says vs. truth says" comparisons throughout.

**Size:** 60 stores × 36 months (Jan 2023 – Dec 2025) = **2,160 rows**.
- **Training:** 48 stores → **1,728 rows** (what the model learns from)
- **Testing:** 12 completely unseen stores (S01, S06, S13, S14, S34, S37, S46, S47, S49, S51, S55, S58) → **432 rows** (the final exam)

---

## 3. How to run it

```bash
pip install -r requirements.txt          # or:  uv run --with-requirements requirements.txt <command>
python src/generate_data.py              # 1. make data/retail_sales.csv
python src/eda.py                        # 2. charts → figures/01-07, facts → reports/eda.json
python src/train.py                      # 3. train 5 models → figures/08-12, reports/results.json, models/best_model.joblib
streamlit run app.py                     # 4. open the prediction web app in the browser
```

---

## 4. EDA — "looking before you leap"

**EDA (Exploratory Data Analysis)** = looking at the data with charts *before* building any model. It's like a doctor reading your reports before prescribing. Every finding below **changed a decision** we made.

### 4.1 Missing values → we must fill the holes (`figures/01_missing_values.png`)
- Promo spend missing in **6.2%** of rows, competitor distance in **8.0%**.
- **Decision:** fill each hole with the **median** (the middle value), *and* add a yes/no flag "was this missing?" so the model knows the value was guessed. (Median, not average, because one crazy value can drag an average but not the middle.)

### 4.2 What does "normal" sales look like? (`02_target_distribution.png`)
- Average **₹21.75 L**, middle value **₹21.32 L**, range ₹6.3 L → ₹45.9 L.
- Slightly more very-big months than very-small ones (skew = 0.5 — mild, festival months pull the tail right).
- **Decision:** mild skew → no need to transform the target.

### 4.3 What moves together? (`03_correlation_heatmap.png`)
Correlation is a score from −1 to +1: "when this goes up, does sales go up too?"

| Input | Correlation with sales | Plain meaning |
|---|---|---|
| Store size | **0.79** | Strong: bigger shop → clearly more sales |
| Staff | 0.74 | Strong — *but see below* |
| Promo spend | 0.30 | Moderate |
| Month | 0.28 | Moderate (festive months) |
| Competitor distance | 0.14 | Weak |

⚠️ **Size and staff are 0.925 correlated with each other** — they almost always move together. **Decision/warning:** the model will struggle to tell *which one* is really causing sales (this shows up later in §9 — it's called *multicollinearity*: two clues that always travel together, so you can't tell whose fingerprint is whose).

### 4.4 Location — raw averages can lie (`04_sales_by_location.png`)
| | Urban | Semi-Urban | Rural |
|---|---|---|---|
| Average sales | ₹22.12 L | **₹22.66 L** | ₹20.29 L |

Semi-Urban beats Urban?! But our rulebook gives Urban **+20%**. Why? In this sample, the Urban shops happen to be *smaller*. The chart mixes "location effect" with "size effect".
**Lesson:** a simple average compares apples to oranges. A model looks at location *while holding size fixed* — and in §9 it correctly finds Urban > Rural by ~₹5 L for the same shop.

### 4.5 Seasonality (`05_seasonality.png`)
Jan ₹19.6 L (lowest) → **Nov ₹25.9 L (Diwali peak)** → Dec ₹24.1 L. July dips to ₹20.1 L (monsoon).
**Decision:** month must be an input, and treated as a *category* (see §5), because November isn't "11 times" January.

### 4.6 Promo vs sales — does the curve flatten? (`06_promo_vs_sales.png`)
Average sales per promo bucket:

| Promo (₹k) | 0–40 | 40–80 | 80–120 | 120–160 | 160–200 | 200–240 | 280–320 | 360–400 | 400–440 |
|---|---|---|---|---|---|---|---|---|---|
| Sales (₹ L) | 17.9 | 19.7 | 20.9 | 21.4 | 22.1 | 22.2 | 22.6 | 24.2 | **28.4** |

- First ₹40k→80k adds **+₹1.8 L**; 200k→240k adds only **+₹0.2 L** → **flattening = diminishing returns.**
- 🚩 Then a jump at ₹400k+?! That's a **trap**: spends above ₹400k only happen in Oct–Dec (festive budgets are 30% bigger). The jump is *Diwali* wearing a promo costume. **Correlation ≠ cause.**
- **Decision:** a straight line can't fit a bending curve → we need Polynomial Regression / trees. And we must include month so the model can separate "festival" from "promo".

### 4.7 Size vs sales (`07_size_vs_sales.png`)
A clear upward cloud, with Rural dots sitting lower → confirms size is the #1 driver and location shifts the whole line.

---

## 5. Preparing the data (so a computer can read it)

| Step | Why | Example |
|---|---|---|
| **Fill missing values (median + flag)** | Models crash on blanks | Competitor distance blank → filled with 2.6 km (the training median) + flag "was_missing = 1"; promo blank → ₹208.8k |
| **One-hot encoding** for location & month | Computers need numbers, but "Urban=1, Semi=2, Rural=3" would falsely say Rural is "3× Urban" | Urban → `[1, 0, 0]`, Semi-Urban → `[0, 1, 0]`, Rural → `[0, 0, 1]`. Month 11 → twelve slots with a 1 in the "Nov" slot |
| **Scaling** (standardise) | Size is in thousands (2000–15000), staff is 5–30. Without scaling, the big numbers bully the small ones in the maths | 6,950 sq ft → "0.3 steps above average" |

All of this is inside one **pipeline** — a fixed recipe applied identically to training data, test data and the app, so nothing leaks or gets forgotten.

---

## 6. The 5 algorithms — in plain words

### 6.1 Linear Regression — "draw the best straight line"
- **Idea:** sales = a fixed amount + (a fixed ₹ per sq ft) + (a fixed ₹ per staff) + (a fixed ₹ per ₹ of promo) + …
- **Analogy:** a taxi meter — every km always costs the same.
- **In our data it learned:** every ₹100k of promo = **+₹1.15 L, always** — whether it's your first ₹100k or your fourth. That's wrong (the truth is +₹3.5 L for the first, +₹0.3 L for the fourth).
- **Result:** new-store R² **0.832** — good, because most effects (size, location) *are* roughly straight. Loses points on the promo curve.

### 6.2 Polynomial Regression (degree 2) — "allow the line to bend" ⭐ winner
- **Idea:** same as linear, but also gives it *squared* terms (promo², size², size×staff…). A squared term lets the line curve — like a ball thrown upward: rising fast, then slowing.
- **Analogy:** eating rasgullas 🍬 — the 1st one is amazing, the 5th one barely adds happiness. A curve can say that; a straight line can't.
- **In our data:** promo gains per ₹100k = **+₹2.62 L → +₹1.75 L → +₹0.88 L → +₹0.01 L**. It found the flattening. ✅
- **Weakness:** a squared curve eventually *comes back down*. Beyond ₹350k it starts predicting *lower* sales for more promo — nonsense (real returns flatten, they don't fall). The app warns you above ₹400k.
- **Result:** new-store R² **0.852**, test **0.849** — best, and very close to the best possible (§8.5).

### 6.3 Decision Tree — "a flowchart of yes/no questions"
- **Idea:** "Is size > 8,000? → Yes → Is it Oct/Nov? → Yes → Is it Urban? → predict ₹31 L." It keeps splitting shops into groups and predicts each group's average.
- **Analogy:** the game *20 Questions*.
- **Weakness here:** we only have **48 training shops**. The tree learns rules like "size between 6,900 and 7,000 sq ft = ₹18.9 L" — i.e. it memorises *individual shops*. A brand-new shop with a size it's never seen falls into the wrong box. Predictions also come in "steps", not smooth amounts.
- **Result:** new-store R² **0.506** — worst.

### 6.4 Random Forest — "ask 300 trees and take the average"
- **Idea:** build 300 different decision trees, each on a random sample of the data, and average their answers.
- **Analogy:** asking 300 friends to guess the number of sweets in a jar — the average of the crowd beats most individuals.
- **Result:** new-store R² **0.613**. Better than one tree, but still **memorises shops**: on training data it scores 0.961 (near-perfect) but 0.613 on new shops → **overfitting** (like a student who memorised last year's answer key but can't solve a new question).

### 6.5 Gradient Boosting — "each new tree fixes the previous one's mistakes"
- **Idea:** tree #1 makes a rough guess; tree #2 learns *only the error* of tree #1; tree #3 learns what's still wrong… 400 small trees, each correcting the last.
- **Analogy:** a sculptor — rough shape first, then finer and finer chisel strokes.
- **Result:** new-store R² **0.756**. Best of the trees, still behind the polynomial here because 48 shops is too few for trees to generalise shop-level patterns.

---

## 7. How we tested — and the trap we avoided

### 7.1 Train / test split *by store*
We locked away **12 whole stores** (all 36 months of each). The model never sees them until the final exam. This answers the case question *"How well does the model perform on a new store?"* honestly.

### 7.2 K-fold cross-validation (k = 5)
Instead of trusting one exam, we split the 48 training stores into **5 groups of ~10 stores**. Train on 4 groups, test on the 5th — **repeat 5 times** so every store gets to be "the unseen one" once — then average the 5 scores. It's like giving 5 different mock exams instead of one: a lucky/unlucky single test can't fool us.

### 7.3 🚨 The trap: splitting by random *rows* instead of by *store*
If you shuffle rows randomly, store S34's **June** can be in training while its **July** is in the test. The model has literally seen that shop — it's recognising, not predicting. Watch what happens:

| Model | Score if we test on random rows (cheating) | Score on truly new stores (honest) |
|---|---|---|
| Gradient Boosting | **0.935** 🥇 looks like the winner | 0.756 |
| Random Forest | 0.903 | 0.613 |
| Polynomial | 0.906 | **0.852** 🥇 real winner |

**The random-row test would have picked the wrong model.** Tree models memorise shop identity (each shop has a unique size) — great on shops they've seen, bad on new ones. This is called **data leakage**, and catching it is one of the strongest points you can make in the viva.

---

## 8. The scorecards — MAE, MSE, RMSE, R² (in rupees, not jargon)

"Error" (or **residual**) = **actual − predicted**. Here are 4 real predictions from unseen stores:

| Store | Month | Actual | Predicted | Error | Error² |
|---|---|---|---|---|---|
| S14 (Rural) | Aug | ₹16.99 L | ₹13.86 L | **+3.13** | 9.80 |
| S58 (Semi-Urban) | Feb | ₹25.06 L | ₹24.32 L | +0.74 | 0.55 |
| S51 (Urban) | May | ₹19.23 L | ₹19.15 L | +0.08 | 0.01 |
| S55 (Semi-Urban) | Aug | ₹15.56 L | ₹15.52 L | +0.04 | 0.00 |

### 8.1 MAE — Mean Absolute Error: "on average, how far off am I?"
Ignore the + / − sign, take the average: (3.13 + 0.74 + 0.08 + 0.04) ÷ 4 = **₹1.00 L**.
Over all 432 test rows: **MAE = ₹1.51 L**. → *"On a typical month, our guess is about ₹1.5 lakh off."* Easiest one to explain to a shop owner.

### 8.2 MSE — Mean Squared Error: "punish big misses extra"
Square each error first, then average: (9.80 + 0.55 + 0.01 + 0.00) ÷ 4 = **2.59**.
Squaring makes a ₹3 L miss count **9×**, not 3×. The one bad S14 prediction dominates. Useful because in inventory, one huge miss (empty shelves in Diwali!) hurts more than many small ones. **Downside:** the unit is "lakh²" — meaningless to humans. Over all test rows: **MSE = 3.71**.

### 8.3 RMSE — Root Mean Squared Error: "MSE, back in rupees"
Square-root of MSE: √2.59 = **₹1.61 L** (on the 4 rows). All test rows: **RMSE = ₹1.93 L**.
RMSE is always ≥ MAE. **The gap tells you about big misses:** our 1.93 vs 1.51 → a few months are missed by a lot (festival spikes, unusually good managers).

### 8.4 R² — "how much better than just guessing the average?"
The laziest possible model: always predict the average (₹21.61 L). Its squared error on the test stores = **24.51** (that's the "variance").
Our model's squared error = **3.71**.
**R² = 1 − 3.71 ÷ 24.51 = 0.849.**
In words: *"Our model removes 85% of the guessing error that a lazy average would make."*
- R² = 1 → perfect. R² = 0 → no better than the average. R² < 0 → worse than the average (possible!).

### 8.5 The noise floor — how good could *any* model get?
Remember the hidden store quality (±5%) and random luck (±6%)? No model can predict those. We computed the score of a **perfect model that knows our exact rulebook** (but not the luck): **R² = 0.869, RMSE = ₹1.79 L**.
Our polynomial reaches **0.849** — i.e. **~98% of the way to perfect**. The remaining gap is mostly luck, not a bad model. (It's also why a model scoring 0.99 on this data would be *suspicious* — it would have to be cheating.)

---

## 9. Results

### 9.1 All models (5-fold CV on unseen stores, then final test on the 12 locked-away stores)

| Model | CV R² | CV RMSE (₹L) | CV MSE | CV MAE (₹L) | Train R² | **Test R²** | Test RMSE | Test MAE |
|---|---|---|---|---|---|---|---|---|
| Linear Regression | 0.832 | 2.25 | 5.15 | 1.78 | 0.889 | 0.814 | 2.13 | 1.65 |
| **Polynomial (deg 2)** ⭐ | **0.852** | **2.14** | **4.64** | **1.69** | 0.911 | **0.849** | **1.93** | **1.51** |
| Decision Tree | 0.506 | 3.79 | 14.45 | 3.08 | 0.884 | 0.643 | 2.96 | 2.34 |
| Random Forest | 0.613 | 3.36 | 11.35 | 2.76 | 0.961 | 0.801 | 2.21 | 1.72 |
| Gradient Boosting | 0.756 | 2.71 | 7.47 | 2.22 | 0.962 | 0.786 | 2.29 | 1.75 |

(`figures/08_model_comparison.png`)

**Why Polynomial wins (justification):**
1. Lowest error on unseen stores in cross-validation *and* the final test — both agree.
2. Smallest gap between train (0.911) and test (0.849) → it's **learning, not memorising**. Random Forest's gap is 0.961 → 0.613.
3. It captures the one curve that matters (promo saturation) while staying simple enough to work with just 48 shops.
4. It's **explainable** — you can say exactly why it predicts what it predicts.

### 9.2 Residual analysis — are the mistakes random? (`figures/09_residuals.png`)
A good model's mistakes should look like random noise: centred on zero, no pattern.
- Average error = **+₹0.41 L** (slight under-prediction — the 12 test shops happen to be a bit better-run than average; the model can't see manager quality).
- Errors form a bell shape around 0 ✅. Actual-vs-predicted dots hug the diagonal ✅.
- **Error range for the app:** 50% of predictions within **±₹1.29 L**, 80% within **±₹2.36 L**, 90% within **±₹3.11 L**. Average % miss (MAPE) = **7.4%**.

**The Linear model's residuals tell the promo story** (`figures/10_linear_residual_vs_promo.png`): its average error vs promo spend forms a **hill** — it *under*-predicts in the middle (+₹1.30 L at ₹160–200k) and *over*-predicts at both ends (−₹1.01 L at ₹0–40k, −₹0.38 L at ₹360–400k). A pattern in residuals = "you assumed the wrong shape". A straight line is wrong for promo.

---

## 10. Does promo spending show diminishing returns? — **Yes.** (`figures/11_promo_saturation.png`)

We took all the test shops and asked each model: "what if *everyone* spent ₹0, ₹25k, ₹50k… ₹500k?" and watched average predicted sales.

| Extra sales from each ₹100k block | 0→100k | 100→200k | 200→300k | 300→400k |
|---|---|---|---|---|
| **TRUE rule** | +₹3.49 L | +₹1.51 L | +₹0.66 L | +₹0.29 L |
| **Polynomial** (winner) | +₹2.62 L | +₹1.75 L | +₹0.88 L | +₹0.01 L |
| Linear | +₹1.15 L | +₹1.15 L | +₹1.15 L | +₹1.15 L |

- The **first ₹100k is ~12× more valuable than the fourth** (truth: 3.49 vs 0.29).
- Linear says "every ₹100k = ₹1.15 L forever" → it would tell the chain to keep spending. **Wrong and expensive.**
- **Business meaning:** ₹1 lakh of promo that returns ₹0.29 lakh of *sales* (not even profit) is a loss. The sweet spot is roughly **₹100–200k/month** per store.
- **Does polynomial regression improve the fit?** Yes: R² 0.832 → 0.852, RMSE ₹2.25 L → ₹2.14 L, and it gets the *shape* right.

---

## 11. What moves sales — "if this moves, that moves"

### 11.1 Which clue matters most? (`figures/12_feature_importance.png`)
Method (**permutation importance**): shuffle one column randomly (destroying its information) and see how much worse the predictions get. The more it hurts, the more that clue mattered.

| Scramble this… | Error (RMSE) grows by | Rank |
|---|---|---|
| Store size | **+₹5.31 L** | 🥇 by far the biggest |
| Staff | +₹1.58 L | 🥈 |
| Month | +₹1.50 L | 🥉 |
| Location | +₹1.45 L | |
| Promo spend | +₹1.04 L | |
| Competitor distance | +₹0.30 L | smallest |

**Answer to "which factor most influences sales?" → store size.**

### 11.2 What-if experiments on one real shop
Store **S34** (one of the 12 unseen shops), **June 2024**: Urban, 6,950 sq ft, 10 staff, ₹82.5k promo, competitor 1.15 km away.
**Actual sales: ₹18.81 L. Model predicted: ₹18.91 L** (off by just ₹0.10 L).

Now we change **one thing at a time** and compare the model with the true rulebook:

| If this moves… | Model says sales go to | Model: change | True rule: change | Verdict |
|---|---|---|---|---|
| Promo **+₹50k** (82.5k → 132.5k) | ₹19.99 L | **+₹1.08 L** | ≈ +₹1.00 L | ✅ spot on |
| Promo **cut to ₹0** | ₹16.66 L | **−₹2.26 L** | ≈ −₹2.89 L | ✅ right direction, a bit under |
| Promo **raised to ₹400k** (5× more!) | ₹22.07 L | +₹3.16 L | ≈ +₹2.72 L | ✅ — spending ₹3.2 lakh more to earn ~₹3 lakh more sales = bad deal |
| Location **Urban → Rural** | ₹13.62 L | **−₹5.29 L** | ≈ −₹4.13 L | ✅ big drop, correctly |
| Same shop in **November** | ₹24.17 L | **+₹5.26 L** | ≈ +₹4.79 L | ✅ Diwali effect |
| Competitor **2 km farther** | ₹19.35 L | +₹0.43 L | ≈ +₹0.77 L | ✅ direction right |
| Competitor opens **next door (0.2 km)** | ₹18.69 L | −₹0.22 L | ≈ −₹0.68 L | ✅ direction right, under-estimates |
| Store **+1,000 sq ft** | ₹20.97 L | +₹2.05 L | ≈ +₹1.28 L | ⚠️ over-estimates |
| **+2 staff** (same size) | ₹18.31 L | **−₹0.60 L** | ≈ +₹0.48 L | ❌ wrong direction! |

("≈" because the true rule assumes average manager quality.)

**The honest lesson from the last two rows:** size and staff move together 92.5% of the time in the data. The model gave most of the credit to *size* (so +1,000 sq ft looks too good) and got confused about *staff alone* (it has almost never seen "same size, more staff"). So: **trust the model for "a typical shop like this", not for "change staff but nothing else"**. To answer the staff question properly, the chain would need to *experiment* — add staff in some shops and not others.

**How to read it for inventory:** for S34 in June, stock for **~₹18.9 L ± ₹2.4 L** of sales. For November, plan for **~₹24.2 L** — about 28% more stock.

---

## 12. The web app (`app.py`)

`streamlit run app.py` → sliders for size, staff, location, promo, competitor distance, month → shows:
- **Predicted monthly sales** — e.g. defaults (7,000 sq ft, 10 staff, Urban, ₹100k promo, competitor 2 km, June) → **₹19.60 L**
- **Expected error range** — "8 out of 10 new-store predictions landed within ±₹2.36 L" (straight from the test results)
- **Selected model** name
- A live **promo what-if curve** for that shop — e.g. first ₹100k adds ₹2.66 L, last ₹100k adds ₹0.05 L
- Warnings when promo > ₹400k (curve unreliable) or competitor distance is unknown (median filled in)

---

## 13. Answers to the case study's questions

| Question | Answer (with evidence) |
|---|---|
| Can store sales be predicted from store attributes? | **Yes** — R² 0.849 on shops never seen, typical miss ₹1.5 L (7%). 98% of the way to the theoretical best (0.869). |
| Which factor most influences sales? | **Store size** — scrambling it adds ₹5.3 L of error, 3× more than anything else. |
| Does promo spending show diminishing returns? | **Yes, strongly** — first ₹100k ≈ +₹3.5 L, fourth ₹100k ≈ +₹0.3 L. Polynomial recovers this; linear can't. |
| Does polynomial regression improve the fit? | **Yes** — R² 0.832 → 0.852 (CV), 0.814 → 0.849 (test); and it fixes the "hill" in linear's residuals. |
| Which algorithm achieves the highest R²? | **Polynomial Regression (deg 2)** on new stores. (Gradient Boosting looks best only if you let it cheat with random-row splits — §7.3.) |
| How well does it perform on a new store? | Tested on 12 fully unseen stores: R² 0.849, RMSE ₹1.93 L, MAE ₹1.51 L. |
| Can it be deployed for inventory planning? | **Yes, for monthly stock ranges** (use prediction ± ₹2.4 L as the 80% band). Not for single-lever decisions like "add 2 staff" (§11.2). |

---

## 14. Limitations — said honestly

1. **Synthetic data.** The data follows rules we wrote, so the models were tested on a world we designed. This is allowed by the case study and lets us *verify* the models, but real shops will be messier. The next step is running the same pipeline on real POS data.
2. **Only 48 training shops.** Tree models need more shops to generalise; with 500 shops, Gradient Boosting might win.
3. **Correlated inputs (size ↔ staff)** → the model can't separate their individual effects.
4. **The polynomial curve bends down past ~₹350k promo** — extrapolation is unreliable; the app warns.
5. **No outside-world data:** inflation, fuel prices, a new mall opening, local festivals, weather, economic slowdowns — none of these are inputs. The case study asks about this: a recession would lower *all* shops' sales and the model wouldn't know why.
6. **Unobserved manager quality** (±5%) is why even a perfect model misses by ~₹1.8 L.
7. **Correlation, not guaranteed cause** — e.g. the ₹400k+ promo "jump" in raw data was really Diwali.

---

## 15. Viva cheat-sheet

- **What is regression?** Predicting a number (₹ sales), not a category.
- **Why split by store?** To test on *new* shops; random rows leak the same shop into both sides (GB: 0.935 fake vs 0.756 real).
- **Overfitting?** Memorising instead of learning: Random Forest 0.961 train → 0.613 new stores.
- **MAE vs RMSE?** MAE = typical miss (₹1.51 L). RMSE = typical miss with extra punishment for big misses (₹1.93 L). RMSE ≥ MAE always.
- **R² = 0.849 means?** We remove 85% of the error you'd make by always guessing the average.
- **Why not 0.99?** Luck + unobserved manager quality cap any model at ~0.87 here.
- **Why median for missing values?** It isn't dragged by extreme values; plus a "was missing" flag so the model knows.
- **Why one-hot encoding?** So "Rural = 3" doesn't mean "3× Urban".
- **Why scale?** So square-feet (thousands) don't drown out staff (tens) in the maths.
- **Diminishing returns proof?** Linear residuals form a hill; polynomial's gains shrink 2.62 → 1.75 → 0.88 → 0.01 per ₹100k.

---

## 16. Folder structure

```
Retail Sales Prediction - Group 12/
├── problem-statement.pdf      ← official ML Case Study 28 (2 pages)
├── README.md                  ← this file
├── requirements.txt
├── app.py                     ← Streamlit prediction web app
├── src/
│   ├── generate_data.py       ← creates the dataset (the hidden rulebook)
│   ├── eda.py                 ← charts 01–07 + reports/eda.json
│   └── train.py               ← 5 models, CV, residuals, saturation, importance, what-if
├── data/retail_sales.csv      ← 2,160 rows
├── figures/                   ← 12 charts used above
├── reports/                   ← eda.json + results.json (every number in this README)
└── models/best_model.joblib   ← the trained Polynomial Regression pipeline
```
