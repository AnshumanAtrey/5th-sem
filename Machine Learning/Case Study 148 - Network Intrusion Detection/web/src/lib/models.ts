// The 11 models in plain words. Names match the notebook's comparison table (data.results.comparison), so each panel
// can show that model's real training time, size and catch rate. The code lines are the notebook's, minus
// random_state=42 (every model gets it, so each run is repeatable) and n_jobs where it only sets the core count.
// Any technical word is explained in brackets the first time a panel uses it, so no ML background is needed.

export type Sketch = "linear" | "knn" | "tree" | "kmeans" | "forest" | "bagging" | "adaboost" | "boost" | "neuron" | "mlp" | "bayes"

export type ModelStory = {
  name: string // as in the comparison table
  module: string // syllabus module
  sketch: Sketch
  oneLine: string
  problem: string // why this model exists: what it fixes
  how: string[] // how it decides, step by step
  faq?: { q: string; a: string }[] // the questions a newcomer asks
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
      "Multiply each of the 45 numbers by its weight (a number saying how much that column counts, and in which direction) and add them all up, plus a starting value.",
      "A big positive total means 'attack', a big negative one 'normal'.",
      "The S-curve (the sigmoid: a fixed formula that turns any total into a value between 0 and 1) gives the chance: a total of 0 → 50%, +2 → 88%, −2 → 12%.",
    ],
    faq: [{ q: "Who decides the weights?", a: "Nobody types them in. Training starts with all weights at zero and keeps adjusting them (up to 2,000 rounds) until the chances it gives match the real answers of the training rows as closely as possible." }],
    code: 'from sklearn.linear_model import LogisticRegression\nmodel = LogisticRegression(max_iter=2000)',
    settings: [{ name: "max_iter", value: "2000", means: "the most adjustment rounds it may take while searching for the best weights" }],
    learns: "45 weights + 1 starting value = 46 numbers.",
    good: "Fast, tiny, and you can read which columns push towards 'attack'.",
    bad: "One weighted sum can only draw a straight dividing line through the data, so it can't capture combinations like 'tiny packets AND short connections'.",
  },
  {
    name: "KNN (k=5)", module: "V", sketch: "knn",
    oneLine: "Finds the 5 most similar rows it has seen before and goes with their majority answer.",
    problem: "Some patterns are easier to recognise by resemblance than by a formula: if a new flow looks like 5 known floods, it is probably a flood.",
    how: [
      "Store the training rows (that's all its 'training' is).",
      "For a new row, measure its distance to every stored row (how different two rows are, worked out from the gaps between their 45 numbers: small distance = very alike).",
      "Take the 5 closest (its 'nearest neighbours'); the chance of attack is the share of them that were attacks: 3 of 5 = 60%.",
    ],
    code: 'from sklearn.neighbors import KNeighborsClassifier\nmodel = KNeighborsClassifier(n_neighbors=5)',
    settings: [
      { name: "n_neighbors", value: "5", means: "how many similar rows get a vote (this 5 is the 'k' in KNN)" },
      { name: "rows stored", value: "50,000", means: "a fair slice of the training rows: it compares every exam row with every stored row, so all 344,246 would take hours" },
    ],
    learns: "Nothing is learned in advance: it simply remembers the rows. All the work happens when it answers.",
    good: "No assumptions about the shape of the data; easy to explain.",
    bad: "Slow to answer and large to store. Depends heavily on step 3's scaling, because a distance only makes sense when every column is on the same scale.",
  },
  {
    name: "Decision Tree", module: "V", sketch: "tree",
    oneLine: "A flowchart of yes/no questions, like 'is rst_count above 113?', that it works out by itself.",
    problem: "Writing detection rules by hand (like firewall rules) is slow and misses things. A decision tree writes its own chain of if/else rules from the examples.",
    how: [
      "Try every column and every possible cut-off (the number in a question, like the 113 in 'rst_count > 113?'), and pick the question that splits the rows into the two least-mixed groups (mixing is scored with 'Gini': 0 = the group is all attacks or all normal).",
      "Repeat inside each group, and again inside those, until the groups are pure or too small to split.",
      "A new row answers the questions from the top down until it reaches an end point (a 'leaf': a bottom box with no more questions); the share of attacks among the training rows that ended there is its chance.",
    ],
    code: 'from sklearn.tree import DecisionTreeClassifier\nmodel = DecisionTreeClassifier(min_samples_leaf=5)',
    settings: [{ name: "min_samples_leaf", value: "5", means: "every end point must hold at least 5 training rows, so it can't make a rule for one odd row" }],
    learns: "The questions and their cut-off values: thousands of them, all chosen by the library from the data.",
    good: "Readable: you can follow exactly why it decided.",
    bad: "One tree memorises quirks of its training rows (overfitting: great on what it studied, worse on new rows), and a small change in the data can grow a completely different tree.",
  },
  {
    name: "K-Means detector", module: "VII", sketch: "kmeans",
    oneLine: "Learns 20 'typical' kinds of normal traffic, and flags anything far from all of them. It never sees a single attack.",
    problem: "Every other model learns from labelled attacks, so it can only spot attacks like the ones it saw. An anomaly detector (a model that only learns what 'normal' looks like and flags anything unusual) could in principle flag something brand new.",
    how: [
      "Take only the normal training rows and let K-Means group them into 20 clusters (groups of similar rows). Each cluster has a centre: the average row of its group, one 'typical normal' example.",
      "Measure how far each normal row is from its nearest centre. The alarm line is the 99th percentile: the distance that 99 of every 100 normal rows stay within.",
      "A new row further than that line from every centre is flagged as an attack.",
    ],
    faq: [{ q: "Is this one ready-made too?", a: "Half and half. The clustering is scikit-learn's KMeans. Turning clusters into an alarm (the 99th-percentile line) is our own short wrapper of about 15 lines, called KMeansDetector, because scikit-learn doesn't ship K-Means as a detector." }],
    code: 'from sklearn.cluster import KMeans          # scikit-learn does the clustering\ncentres = KMeans(20).fit(normal_rows)       # our small KMeansDetector adds the alarm line',
    settings: [
      { name: "k", value: "20", means: "number of clusters, chosen with the elbow method (try several numbers and stop where adding clusters stops helping much): past 20 it barely helped" },
      { name: "alarm line", value: "99th percentile", means: "1 in 100 normal training rows sits beyond it, which sets how often it raises a false alarm" },
    ],
    learns: "20 centre points × 45 numbers = 900 numbers, plus 1 alarm distance.",
    good: "Needs no attack examples at all, so it is the only model here that could flag a brand-new kind of attack.",
    bad: "Only catches attacks that look clearly abnormal (floods). Quiet attacks sit close to normal traffic and slip under the line.",
  },
  {
    name: "Random Forest", module: "VIII", sketch: "forest",
    oneLine: "200 different decision trees each give an answer, and the forest averages their votes.",
    problem: "One decision tree overfits (memorises its training rows) and is unstable (see the decision tree above). Many trees that each make different mistakes, averaged, cancel most of those mistakes out, like asking 200 analysts instead of one.",
    how: [
      "Tree 1 gets its own random resample of the 344,246 training rows: rows are drawn at random one by one, and a drawn row can be drawn again, so some appear twice and about a third are left out. This is called bootstrapping.",
      "The tree is grown with the same method as the single decision tree, with one twist: at every question it may only look at about 6 randomly picked columns out of 45, so the trees can't all lean on the same few clues.",
      "Repeat for all 200 trees, each with its own random resample and random columns. For a new row, each tree gives its chance and the forest averages the 200 (its 'vote').",
    ],
    faq: [
      { q: "Where do the 200 trees come from? Do we build them?", a: "No. scikit-learn already contains the code to build one decision tree (the same code as model 3 above). RandomForestClassifier simply runs that tree-building code 200 times in a loop, handing each run a different random resample of the rows. We wrote neither the tree logic nor the loop: we only set the number 200. When we call .fit(), the library builds all 200, and it took 94 seconds." },
      { q: "Why are the 200 trees different if the method is the same?", a: "Because each one sees different rows (its own random resample) and, at every question, a different random handful of columns. Same recipe, different ingredients, so different trees." },
    ],
    code: 'from sklearn.ensemble import RandomForestClassifier\nmodel = RandomForestClassifier(n_estimators=200, n_jobs=-1)',
    settings: [
      { name: "n_estimators", value: "200", means: "how many trees to grow. This is the only real choice we made" },
      { name: "n_jobs", value: "-1", means: "use every processor core (each core is one worker inside the computer's chip), so several trees grow at the same time" },
    ],
    learns: "200 complete decision trees, every question and cut-off chosen by the library from the data.",
    good: "Much more accurate and stable than one tree; tied for the best catch rate here.",
    bad: "Big: 200 full trees saved to a 106 MB file, too heavy to send to a browser.",
  },
  {
    name: "Bagging", module: "VIII", sketch: "bagging",
    oneLine: "100 decision trees, each grown on a random half of the rows, then a vote. Random forest's simpler parent.",
    problem: "Same as random forest: average many unstable trees into one stable answer. 'Bagging' is short for bootstrap aggregating: random resamples (bootstrap), then combine the answers (aggregate).",
    how: [
      "Each of the 100 trees gets a random half of the training rows.",
      "Unlike random forest, every tree may look at all 45 columns at every question.",
      "For a new row, the 100 trees' answers are averaged.",
    ],
    faq: [{ q: "Where do the 100 trees come from?", a: "The same way as the forest: we hand BaggingClassifier the ready-made DecisionTreeClassifier as its building block, and it runs it 100 times, each time on a different random half of the rows. We only chose 100 and 'half'." }],
    code: 'from sklearn.ensemble import BaggingClassifier\nmodel = BaggingClassifier(DecisionTreeClassifier(), n_estimators=100, max_samples=0.5)',
    settings: [
      { name: "DecisionTreeClassifier()", value: "", means: "the building block: what kind of model to make 100 of" },
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
    problem: "Random forest and bagging build their trees independently, side by side. Boosting builds them in a chain, so each new one is aimed at the mistakes that are still left.",
    how: [
      "Start with every training row equally important, and build a stump (a tree with just one question, like 'Tot size ≤ 60?').",
      "The rows that stump got wrong are made more important; the next stump is built to get those right.",
      "After 200 stumps, they all vote, and the more accurate stumps get a bigger say (their 'vote weight').",
    ],
    faq: [{ q: "Where do the 200 stumps come from?", a: "AdaBoostClassifier builds them itself, one after another, using scikit-learn's ready-made one-question tree. We only set 200." }],
    code: 'from sklearn.ensemble import AdaBoostClassifier\nmodel = AdaBoostClassifier(n_estimators=200)',
    settings: [{ name: "n_estimators", value: "200", means: "how many one-question trees to chain" }],
    learns: "200 questions with cut-offs, plus 200 vote weights.",
    good: "Tiny, and simple pieces add up to a decent model.",
    bad: "One question at a time is a weak building block for this data, and it was the slowest to train.",
  },
  {
    name: "Gradient Boosting", module: "VIII", sketch: "boost",
    oneLine: "300 small trees added one at a time; each one corrects what the trees before it still get wrong, and their scores add up.",
    problem: "Like AdaBoost, a chain of trees aimed at the remaining mistakes. But instead of re-weighting rows, each new tree directly predicts how far off the current answer still is, which works much better.",
    how: [
      "Every row starts with the same score: the one that matches the share of attacks in the training rows (73.7%).",
      "Tree 1 is built to predict, for each row, how much its score should go up or down to get closer to the right answer. A tenth of that correction is added (the 'learning rate').",
      "Tree 2 does the same for what is still wrong, and so on, 300 times. The final score is turned into a chance with the S-curve (see logistic regression). You can follow a real row below.",
    ],
    faq: [
      { q: "Where do the 300 trees come from?", a: "HistGradientBoostingClassifier builds them itself, one after another, each one aimed at the errors still left. We only set 300. ('Hist' is short for histogram: before building, it sorts each column's values into 255 buckets, so it can try cut-offs much faster.)" },
      { q: "What is the 'error still left'?", a: "For every training row: the gap between its current score and its real answer. Each tree's job is to shrink those gaps a little; the word 'gradient' refers to the maths that measures which way to nudge." },
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
    bad: "Harder to explain than one tree, and the trees must be built one after another, not side by side.",
  },
  {
    name: "Perceptron", module: "IX", sketch: "neuron",
    oneLine: "One artificial neuron: a weighted sum of the 45 numbers, then a hard yes or no.",
    problem: "The simplest imitation of a brain cell, and the building block of neural networks: it 'fires' (says attack) when the weighted evidence passes a threshold.",
    how: [
      "Multiply each number by its weight (how much that column counts) and add them up.",
      "Above zero means 'attack', otherwise 'normal'. No in-between chance.",
      "While training, whenever it answers a row wrong, it nudges the weights a little towards the right answer, and repeats over the rows.",
    ],
    code: 'from sklearn.linear_model import Perceptron\nmodel = Perceptron()',
    settings: [{ name: "defaults", value: "all", means: "no settings changed" }],
    learns: "45 weights + 1 = 46 numbers.",
    good: "The smallest, fastest model here.",
    bad: "Again a straight dividing line, and only yes/no: you can't move its alarm threshold.",
  },
  {
    name: "Neural Network (MLP)", module: "IX", sketch: "mlp",
    oneLine: "Layers of artificial neurons feeding each other: 45 inputs → 64 neurons → 32 neurons → 1 answer.",
    problem: "One neuron (the perceptron) can only draw a straight line. Stacking layers of them lets the network build curved, combined patterns out of simple pieces. MLP stands for multi-layer perceptron.",
    how: [
      "Each of the 64 neurons in the first layer (a row of neurons working side by side) makes its own weighted sum of the 45 numbers, and bends it: negative results become zero.",
      "The 32 neurons in the next layer do the same with those 64 results; the last neuron turns them into a chance with the S-curve.",
      "Training adjusts all the weights a little after each batch of rows, working backwards from the error at the output (this is called backpropagation), until the answers stop improving.",
    ],
    code: 'from sklearn.neural_network import MLPClassifier\nmodel = MLPClassifier(hidden_layer_sizes=(64, 32), early_stopping=True, max_iter=200)',
    settings: [
      { name: "hidden_layer_sizes", value: "(64, 32)", means: "two hidden layers (the ones between input and output), of 64 and 32 neurons" },
      { name: "early_stopping", value: "True", means: "keeps 10% of its training rows aside and stops when they stop improving, so it doesn't memorise" },
      { name: "max_iter", value: "200", means: "at most 200 passes over the training rows" },
    ],
    learns: "45×64+64 + 64×32+32 + 32+1 = 5,057 weights.",
    good: "Nearly as good as the best tree ensembles, in a 0.1 MB file.",
    bad: "A black box (you can't read why it decided): its 5,057 weights don't explain themselves.",
  },
  {
    name: "Naive Bayes", module: "case study", sketch: "bayes",
    oneLine: "Asks 'how likely are these values in normal traffic, and in attacks?', column by column, and multiplies the answers.",
    problem: "The classic spam-filter idea: weigh the evidence from each clue and combine it. Very fast and needs little data.",
    how: [
      "For each column, learn the average and spread of the normal rows and of the attack rows. Each pair draws a bell curve (the usual hump shape: most values near the average, fewer further out).",
      "For a new row, read off how likely (how common) each of its 45 values is on each bell curve.",
      "Multiply the 45 likelihoods for 'normal' and for 'attack', and pick the bigger. Multiplying like this assumes the columns are independent (they don't influence each other), which is the 'naive' part.",
    ],
    code: 'from sklearn.naive_bayes import GaussianNB\nmodel = GaussianNB()',
    settings: [{ name: "defaults", value: "all", means: "no settings changed ('Gaussian' is the mathematician's name for the bell curve)" }],
    learns: "For each of 2 answers: an average and a spread per column = 180 numbers.",
    good: "Its alarms are almost always right (99.86% precision: of all its alarms, almost every one was a real attack).",
    bad: "The columns are far from independent (step 2 found exact copies), so it counts the same clue many times and ends up answering 'normal' for most attacks.",
  },
]

/** Words used across the Train tab, explained once, at the top. */
export const TRAIN_WORDS: { term: string; means: string }[] = [
  { term: "Library", means: "Ready-made code someone else wrote and shared, which we install and use, like an npm package. We don't write the algorithms ourselves." },
  { term: "scikit-learn (sklearn)", means: "The free, open-source Python library that contains all 11 algorithms used here. It is the standard ML library taught in the course." },
  { term: "Class", means: "A ready-made blueprint in the library, like RandomForestClassifier. We create one with our settings, then use it." },
  { term: ".fit(rows, answers)", means: "The one command that makes a model learn: it hands the training rows and their answers to the library, which does the rest." },
  { term: "Model", means: "The result of training: a function that takes a row's 45 numbers and gives back a chance of attack." },
  { term: "Weight", means: "A number the model learns for each column, saying how much that column counts and in which direction." },
  { term: "Decision tree", means: "A flowchart of yes/no questions about the columns, ending in end points (leaves) that say normal or attack." },
  { term: "Cut-off", means: "The number inside a question, like the 113 in 'rst_count > 113?'. The library picks it." },
  { term: "Random resample", means: "A new pile of rows drawn at random from the training rows, where a row can be picked more than once (also called a bootstrap sample)." },
  { term: "Vote / average", means: "Combining many models' answers into one: the share of trees that say 'attack', or the average of their chances." },
  { term: "S-curve (sigmoid)", means: "A fixed formula that turns any score into a chance between 0% and 100%: score 0 → 50%." },
  { term: "Chance of attack", means: "The model's answer, from 0% to 100%. At 50% or more we call it an attack (that 50% is the alarm threshold)." },
]
