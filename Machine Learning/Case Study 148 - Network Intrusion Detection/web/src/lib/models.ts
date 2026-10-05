// The 11 models in plain words. Names match the notebook's comparison table (data.results.comparison), so each panel
// can show that model's real training time, size and catch rate. The code lines are the notebook's, minus
// random_state=42 (every model gets it, so each run is repeatable) and n_jobs where it only sets the core count.

export type Sketch = "linear" | "knn" | "tree" | "kmeans" | "forest" | "bagging" | "adaboost" | "boost" | "neuron" | "mlp" | "bayes"

export type ModelStory = {
  name: string // as in the comparison table
  module: string // syllabus module
  sketch: Sketch
  oneLine: string
  problem: string // why this model exists: what it fixes
  how: string[] // how it decides, step by step
  code: string // the exact scikit-learn line
  settings: { name: string; value: string; means: string }[]
  learns: string // what training works out (the parameters)
  good: string
  bad: string
}

export const MODULES: Record<string, string> = {
  V: "Module V · Classification",
  VII: "Module VII · Unsupervised learning",
  VIII: "Module VIII · Ensembles",
  IX: "Module IX · Neural networks",
  "case study": "Asked for by the case study",
}

export const MODEL_STORIES: ModelStory[] = [
  {
    name: "Logistic Regression", module: "V", sketch: "linear",
    oneLine: "Gives every column a weight, adds them up into one score, and squashes the score into a 0–100% chance.",
    problem: "Linear regression predicts any number (a price, a temperature). For a yes/no question we need a chance between 0% and 100%, so logistic regression bends the straight-line score into an S-curve.",
    how: [
      "Multiply each of the 45 numbers by its weight and add them up (plus a starting value).",
      "A big positive total means 'attack', a big negative one 'normal'.",
      "The S-curve (sigmoid) turns the total into a chance: 0 → 50%, +2 → 88%, −2 → 12%.",
    ],
    code: 'from sklearn.linear_model import LogisticRegression\nmodel = LogisticRegression(max_iter=2000)',
    settings: [{ name: "max_iter", value: "2000", means: "the most improvement rounds it may take while searching for the best weights" }],
    learns: "45 weights + 1 starting value = 46 numbers.",
    good: "Fast, tiny, and you can read which columns push towards 'attack'.",
    bad: "One weighted sum draws a straight dividing line, so it can't capture combinations like 'tiny packets AND short connections'.",
  },
  {
    name: "KNN (k=5)", module: "V", sketch: "knn",
    oneLine: "Finds the 5 most similar rows it has seen before and goes with their majority answer.",
    problem: "Some patterns are easier to recognise by resemblance than by a formula: if a new flow looks like 5 known floods, it is probably a flood.",
    how: [
      "Store the training rows.",
      "For a new row, measure its distance to every stored row (all 45 numbers count).",
      "Take the 5 closest; the chance of attack is the share of them that were attacks (3 of 5 = 60%).",
    ],
    code: 'from sklearn.neighbors import KNeighborsClassifier\nmodel = KNeighborsClassifier(n_neighbors=5)',
    settings: [
      { name: "n_neighbors", value: "5", means: "how many similar rows get a vote" },
      { name: "rows stored", value: "50,000", means: "a fair slice of the training rows: it compares every exam row with every stored row, so all 344,246 would take hours" },
    ],
    learns: "Nothing is learned in advance: it simply remembers the rows. All the work happens when it answers.",
    good: "No assumptions about the shape of the data; easy to explain.",
    bad: "Slow to answer and large to store. Depends heavily on step 3's scaling, because distance needs every column on one scale.",
  },
  {
    name: "Decision Tree", module: "V", sketch: "tree",
    oneLine: "A flowchart of yes/no questions, like 'is rst_count above 113?', that it works out by itself.",
    problem: "Writing detection rules by hand (like firewall rules) is slow and misses things. A decision tree writes its own rule chain from the examples.",
    how: [
      "Look at every column and every possible cut-off; pick the question that best separates attacks from normal traffic (the one that leaves each side least mixed, measured with 'Gini').",
      "Repeat inside each side, and again, until the groups are pure or too small to split.",
      "A new row follows the questions down to an end point; the share of attacks there is its chance.",
    ],
    code: 'from sklearn.tree import DecisionTreeClassifier\nmodel = DecisionTreeClassifier(min_samples_leaf=5)',
    settings: [{ name: "min_samples_leaf", value: "5", means: "every end point must hold at least 5 training rows, so it can't make a rule for one odd row" }],
    learns: "The questions and their cut-off values: thousands of them.",
    good: "Readable: you can follow exactly why it decided.",
    bad: "One tree memorises quirks of its training rows (overfitting), and a small change in the data can grow a completely different tree.",
  },
  {
    name: "K-Means detector", module: "VII", sketch: "kmeans",
    oneLine: "Learns 20 'typical' kinds of normal traffic, and flags anything far from all of them. It never sees a single attack.",
    problem: "Every other model learns from labelled attacks, so it can only spot attacks like the ones it saw. An anomaly detector only learns what normal looks like, so in principle it can flag anything new.",
    how: [
      "Take only the normal training rows and group them into 20 clusters (K-Means): 20 'typical normal' centre points.",
      "Measure how far each normal row is from its nearest centre; the distance that 99% of normal rows stay within becomes the alarm line.",
      "A new row further than that line from every centre is flagged as an attack.",
    ],
    code: 'from sklearn.cluster import KMeans          # scikit-learn does the clustering\ncentres = KMeans(20).fit(normal_rows)       # our small KMeansDetector adds the alarm line',
    settings: [
      { name: "k", value: "20", means: "number of clusters, chosen with the elbow method: past 20, extra clusters stopped helping much" },
      { name: "alarm line", value: "99th percentile", means: "1% of normal training rows sit beyond it, which sets the false-alarm level" },
    ],
    learns: "20 centre points × 45 numbers = 900 numbers, plus 1 alarm distance.",
    good: "Needs no attack examples at all, so it is the only model here that could flag a brand-new kind of attack.",
    bad: "Only catches attacks that look clearly abnormal (floods). Quiet attacks sit close to normal traffic and slip under the line.",
  },
  {
    name: "Random Forest", module: "VIII", sketch: "forest",
    oneLine: "200 different decision trees each give an answer, and the forest averages their votes.",
    problem: "One decision tree overfits and is unstable (see the decision tree). Many trees that each make different mistakes, averaged, cancel most of those mistakes out.",
    how: [
      "Tree 1 gets a random resample of the 344,246 training rows: drawn with replacement, so some rows appear twice and about a third are left out (this is called bootstrapping).",
      "While growing, at every question the tree may only look at about 6 random columns out of 45, so the trees can't all lean on the same few clues.",
      "Repeat for all 200 trees, each with its own random resample and random columns. For a new row, the chance of attack is the average of the 200 trees' answers.",
    ],
    code: 'from sklearn.ensemble import RandomForestClassifier\nmodel = RandomForestClassifier(n_estimators=200, n_jobs=-1)',
    settings: [
      { name: "n_estimators", value: "200", means: "how many trees to grow. This is the only real choice we made" },
      { name: "n_jobs", value: "-1", means: "use every processor core, to grow trees in parallel" },
    ],
    learns: "200 complete decision trees. We don't build any of them by hand and there is no formula of ours: scikit-learn grows all 200 when we call .fit(), each with the same method as the single decision tree.",
    good: "Much more accurate and stable than one tree; tied for the best catch rate here.",
    bad: "Big: 200 full trees saved to a 106 MB file, too heavy to send to a browser.",
  },
  {
    name: "Bagging", module: "VIII", sketch: "bagging",
    oneLine: "100 decision trees, each grown on a random half of the rows, then a vote. Random forest's simpler parent.",
    problem: "Same as random forest: average many unstable trees into one stable answer. 'Bagging' is short for bootstrap aggregating: resample, then combine.",
    how: [
      "Each of the 100 trees gets a random half of the training rows.",
      "Unlike random forest, every tree may use all 45 columns at every question.",
      "The answers are averaged.",
    ],
    code: 'from sklearn.ensemble import BaggingClassifier\nmodel = BaggingClassifier(DecisionTreeClassifier(), n_estimators=100, max_samples=0.5)',
    settings: [
      { name: "n_estimators", value: "100", means: "how many trees" },
      { name: "max_samples", value: "0.5", means: "each tree sees a random half of the training rows" },
    ],
    learns: "100 complete decision trees, grown by scikit-learn.",
    good: "Tied for the best catch rate, and a smaller file than random forest.",
    bad: "Its trees are more alike than random forest's (they can all use the same strong columns), so they share more mistakes.",
  },
  {
    name: "AdaBoost", module: "VIII", sketch: "adaboost",
    oneLine: "200 one-question trees built one after another, each paying extra attention to the rows the earlier ones got wrong.",
    problem: "Averaging (random forest, bagging) builds trees independently. Boosting builds them in a chain, so each new one is aimed at the remaining mistakes.",
    how: [
      "Start with every training row equally important; build a 'stump' (a tree with just one question).",
      "Rows the stump got wrong become more important; the next stump focuses on them.",
      "After 200 stumps, they vote, and the more accurate stumps get a bigger say.",
    ],
    code: 'from sklearn.ensemble import AdaBoostClassifier\nmodel = AdaBoostClassifier(n_estimators=200)',
    settings: [{ name: "n_estimators", value: "200", means: "how many one-question trees to chain" }],
    learns: "200 questions with cut-offs, plus 200 vote weights.",
    good: "Tiny, and simple pieces add up to a decent model.",
    bad: "One question at a time is a weak building block for this data, and it was the slowest to train.",
  },
  {
    name: "Gradient Boosting", module: "VIII", sketch: "boost",
    oneLine: "300 small trees added one at a time; each one predicts the error still left over, and their scores add up.",
    problem: "Like AdaBoost, a chain of trees aimed at the remaining mistakes, but each tree directly predicts how far off the running score still is, which works much better.",
    how: [
      "Start every row at the same score: the share of attacks in the training rows (73.7%).",
      "Tree 1 predicts, for every row, how much to raise or lower its score to get closer to the truth. Add a tenth of that.",
      "Tree 2 does the same for what is still wrong, and so on, 300 times. The final score becomes a chance with the S-curve. (Follow a real row below.)",
    ],
    code: 'from sklearn.ensemble import HistGradientBoostingClassifier\nmodel = HistGradientBoostingClassifier(max_iter=300)',
    settings: [
      { name: "max_iter", value: "300", means: "how many trees to add" },
      { name: "learning rate", value: "0.1 (default)", means: "each tree's correction is shrunk to a tenth, so no single tree dominates" },
      { name: "end points per tree", value: "up to 31 (default)", means: "keeps each tree small" },
      { name: "early stopping", value: "on (default)", means: "keeps 10% of its training rows aside to check it is still improving; it never needed to stop before 300" },
    ],
    learns: "300 small trees: 18,300 questions and end-point scores.",
    good: "Near the top catch rate, the fewest false alarms of the top group, and a 0.5 MB file: this is the model running on this website.",
    bad: "Harder to explain than one tree, and the trees must be built one after another.",
  },
  {
    name: "Perceptron", module: "IX", sketch: "neuron",
    oneLine: "One artificial neuron: a weighted sum of the 45 numbers, then a hard yes or no.",
    problem: "The simplest model of a brain cell, and the building block of neural networks: it fires (attack) when the weighted evidence passes a threshold.",
    how: [
      "Multiply each number by its weight and add them up.",
      "Above zero means 'attack', otherwise 'normal'. No in-between chance.",
      "While training, whenever it answers wrong, nudge the weights towards the right answer.",
    ],
    code: 'from sklearn.linear_model import Perceptron\nmodel = Perceptron()',
    settings: [{ name: "defaults", value: "all", means: "no settings changed" }],
    learns: "45 weights + 1 = 46 numbers.",
    good: "The smallest, fastest model here.",
    bad: "A straight line again, and only yes/no: you can't move its alarm threshold.",
  },
  {
    name: "Neural Network (MLP)", module: "IX", sketch: "mlp",
    oneLine: "Layers of neurons feeding each other: 45 inputs → 64 neurons → 32 neurons → 1 answer.",
    problem: "One neuron can only draw a straight line. Stacking layers lets the network build curved, combined patterns out of simple pieces.",
    how: [
      "Each of the 64 neurons in the first layer makes its own weighted sum of the 45 numbers and bends it (negative becomes zero).",
      "The 32 neurons in the next layer do the same with those 64 results; the last neuron turns them into a chance.",
      "Training (backpropagation) adjusts all the weights a little after each batch of rows, to make the answers less wrong.",
    ],
    code: 'from sklearn.neural_network import MLPClassifier\nmodel = MLPClassifier(hidden_layer_sizes=(64, 32), early_stopping=True, max_iter=200)',
    settings: [
      { name: "hidden_layer_sizes", value: "(64, 32)", means: "two hidden layers, of 64 and 32 neurons" },
      { name: "early_stopping", value: "True", means: "keeps 10% of its training rows aside and stops when they stop improving, so it doesn't memorise" },
      { name: "max_iter", value: "200", means: "at most 200 passes over the training rows" },
    ],
    learns: "45×64+64 + 64×32+32 + 32+1 = 5,057 weights.",
    good: "Nearly as good as the best tree ensembles, in a 0.1 MB file.",
    bad: "A black box: the 5,057 weights don't explain themselves.",
  },
  {
    name: "Naive Bayes", module: "case study", sketch: "bayes",
    oneLine: "Asks 'how likely are these values in normal traffic, and in attacks?', column by column, and multiplies the answers.",
    problem: "The classic spam-filter idea: weigh the evidence from each clue and combine it. Very fast and needs little data.",
    how: [
      "For each column, learn the average and spread of normal rows and of attack rows (two bell curves).",
      "For a new row, read off how likely each of its 45 values is under each bell curve.",
      "Multiply the 45 likelihoods for each answer, and pick the bigger. It assumes the columns are independent, which is the 'naive' part.",
    ],
    code: 'from sklearn.naive_bayes import GaussianNB\nmodel = GaussianNB()',
    settings: [{ name: "defaults", value: "all", means: "no settings changed" }],
    learns: "For each of 2 answers: an average and a spread per column = 180 numbers.",
    good: "Its alarms are almost always right (99.86% precision).",
    bad: "The columns are far from independent (step 2 found exact copies), so it counts the same clue many times and ends up answering 'normal' for most attacks.",
  },
]
