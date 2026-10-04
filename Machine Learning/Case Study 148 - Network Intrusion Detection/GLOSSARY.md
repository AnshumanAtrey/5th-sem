# the project in plain words, with a glossary

for someone who knows networks, security and building software, but has never done machine learning (ML). every term
is explained the way you'd explain it to a developer, then shown with an example from **this** project. the long,
detailed version is [HOW-IT-WORKS.md](HOW-IT-WORKS.md).

---

## the whole project in 12 lines

1. a university lab recorded the traffic of 105 smart devices (cameras, plugs, speakers) while attacking them 33 ways.
2. they turned the recordings into a big table: **46.7 million lines**, like a giant access log. each line describes a
   small batch of packets with **46 numbers** (speed, packet sizes, which TCP flags, which protocol) plus a **tag**
   saying what it really was: normal, or which attack.
3. that's too much to work with, so we **took a smaller, fair part**: every line of the rare attacks, a slice of the
   huge floods, **458,995 lines** in total.
4. we **checked it for junk** (duplicate lines, empty cells, impossible values). it was clean.
5. we **found a field that cheats** (`IAT`, which secretly gives away *when* each attack was recorded), and **threw
   it out**. 45 numbers left.
6. we **put a quarter of the lines aside and didn't touch them** (114,749 lines), to grade the models at the end on
   lines they had never seen.
7. we **converted all 45 numbers to the same scale**, so "4,642 packets per second" doesn't drown out "TCP: 1".
8. we gave the remaining **344,246 lines** to **11 different learning methods**. each one studied the lines and wrote
   its own "rule" for telling attacks from normal traffic.
9. each rule then judged the 114,749 put-aside lines.
10. we compared every judgement with the true tag and **counted**: attacks caught, attacks missed, false alarms.
11. the best practical rule (gradient boosting: catches **95.95%** of attacks) was **saved as a file**.
12. that file runs inside a **website** you can try at https://walrus-flow-sentinel.pages.dev/.

---

## glossary

each entry: **what it means**, then **in our project**.

### the data

**dataset**
a collection of recorded examples, usually a big table.
*in our project:* CICIoT2023, by the Canadian Institute for Cybersecurity (2023). 169 CSV files, 46,686,579 lines.

**row** (also: sample, record, flow)
one line of the table, like one line of an access log. here a row is not one packet; it's a **summary of a small
batch of 10 or 100 packets**, averaged together. that's why some counts are decimals.
*in our project:* one row says "this batch went at 4,642 packets per second, used UDP, packets were 50 bytes, and it
was a DoS UDP flood."

**column** (also: feature, field)
one measurement that every row has, like a field in a log line (`status`, `bytes`, `user_agent`).
*in our project:* 46 columns, e.g. `Rate` (packets per second), `syn_count` (how many packets had the SYN flag),
`TCP` (1 if the batch used TCP, else 0), `Tot size` (packet size). after removing `IAT`, the models use 45.

**label** (also: tag, target, ground truth)
the correct answer for a row, written down by the people who made the data. the thing we want the model to learn to
guess.
*in our project:* the last column, `label`, with 34 possible values: `BenignTraffic` or one of 33 attack names like
`DDoS-ICMP_Flood`.

**BenignTraffic** (benign = harmless)
the label for **normal, everyday traffic with no attack going on**: a camera streaming video, a smart plug checking in
with its cloud, a speaker fetching music.
*in our project:* 1,098,195 benign rows in the full data (only 2.4%); we kept 120,539. in our model, benign = **0**,
any attack = **1**.

**the attack families** (the 33 attacks are grouped into 7)

| family | plain meaning | how it looks in our data |
|---|---|---|
| **DoS** (denial of service) | **one** machine floods a target with junk traffic until it can't serve real users | `DoS-UDP_Flood` row: 4,642 packets per second, all UDP, tiny 50-byte packets |
| **DDoS** (distributed DoS) | the same flood, from **many** machines at once | 12 kinds (ICMP, UDP, SYN floods…); 33.9 million rows, the biggest family |
| **Mirai** | a real botnet that hijacks smart devices and uses them as a flooding army; the lab ran its actual code | 3 kinds; caught 100% of the time by most models |
| **Recon** (reconnaissance) | scanning before an attack: which devices exist, which ports are open, which OS they run (`nmap`) | the hardest to catch: `Recon-OSScan` is missed 33% of the time |
| **Spoofing** | pretending to be someone else: fake ARP replies (man-in-the-middle) or fake DNS answers | second hardest: `DNS_Spoofing` missed 21% |
| **Web** | attacks through a website's forms: SQL injection, XSS, command injection, malicious uploads | only 24,829 rows in all 46.7 million, so we kept every one |
| **BruteForce** | guessing passwords from a word list | 13,064 rows |

**CSV**
a plain text table: one row per line, values separated by commas. you'd open it in Excel.
*in our project:* the 169 data files, about 3 GB in total.

**PCAP**
a raw recording of every packet on a network, what Wireshark saves.
*in our project:* the lab recorded PCAPs first, then computed the 46 numbers per batch from them. we only use the
CSVs.

### the shape of the data

**dimensions**
the size of a table, written **rows × columns**. also used to mean just "how many columns": 45 columns = 45
dimensions, because each row is a point in a 45-axis space (like a point on a map has 2 dimensions, x and y).
*in our project:* full data 46,686,579 × 47 → our sample 458,995 × 47 → the training part **344,246 × 45** → the
test part **114,749 × 45**.

**matrix**
a grid of numbers with rows and columns. a table that holds only numbers *is* a matrix.
*in our project:*
- the training data, 344,246 rows × 45 columns of numbers
- the **correlation matrix**, 45 × 45 (how much each pair of columns moves together)
- the **confusion matrix**, 2 × 2 (see "scoring")

**vector**
a single list of numbers: one row, or one column.
*in our project:* one flow's 45 numbers is a vector; so is the list of 344,246 correct answers (0s and 1s).

**DataFrame / NumPy array**
the two ways Python holds these tables. a **pandas DataFrame** is a table with named columns, like a spreadsheet in
code. a **NumPy array** is a bare grid of numbers, faster for maths.
*in our project:* the CSV is read into a DataFrame (`pd.read_csv`); after cleaning it becomes a NumPy array that the
models actually use.

### getting the data ready

**sampling** (taking a smaller, fair part)
using a subset instead of everything. done carefully, so rare things don't vanish.
*in our project:* a plain random 1% would keep about 72,000 ICMP floods but only about 12 upload attacks. so we took
**up to 12,000 rows of each attack type** (all of them if there were fewer) and 120,000 benign rows. 46.7 million →
458,995.

**cleaning**
finding and fixing junk: duplicate lines, empty cells, impossible values (a negative packet count).
*in our project:* 0 duplicates, 0 empty cells, 0 negatives. one column (`SMTP`) was always 0, so it carries no
information. `Rate` and `Srate` were exact copies.

**encoding / mapping**
turning text into numbers, because models only do maths. like turning an enum string into an int.
*in our project:* `"BenignTraffic"` → 0, any attack name → 1. and each of the 34 names → its family:
`"DoS-SYN_Flood"` → DoS, `"Recon-PortScan"` → Recon.

**data leak** (a field that cheats)
a column that gives the answer away for a reason that won't exist in real use. like a test that passes because the
expected output is hard-coded in the input.
*in our project:* `IAT` is supposed to be "time since the previous packet", but its values track **when** in the
recording a row was captured. each attack was run at its own time, so `IAT` alone names the attack **87.7%** of the
time, more than all 45 real columns together (74.9%). on a live network a new attack happens at a new time, so this
clue disappears. **we deleted it.**

**train / test split** ("locking away the final exam")
before any learning, you set aside part of the data and **never show it to the model** during learning. at the end
you grade the model only on that part. same idea as keeping a test suite your code was never tuned against, or a
teacher not handing out the exam questions with the study material. a model that only memorised what it studied looks
perfect on what it studied and fails on new data; the untouched part catches that.
*in our project:* 75% for learning (**344,246 rows**), 25% put aside (**114,749 rows**: 84,614 attacks, 30,135
normal). no model saw those 114,749 rows until the final grading.

**stratify**
when splitting, keep the same mix of answers in both parts.
*in our project:* each of the 34 attack types has the same share in the learning part and the test part (73.7%
attacks in both), so no attack type ends up only on one side.

**random seed** (`random_state = 42`)
a fixed starting number for anything random, so the same "random" choices happen every run. like seeding a test's
random generator so results reproduce.
*in our project:* the sample, the split and every model use 42, which is why rerunning the whole notebook gave
identical numbers.

**scaling** (feature scaling, standardization)
putting all columns on the same scale. like converting ms, seconds and minutes to one unit before comparing them.
*in our project:* `Rate` goes into the millions, `TCP` is 0 or 1. two steps:
1. **shrink big numbers** with a log: 2,256 → 7.72
2. **compare to the typical value**: (7.72 − 3.66 average) ÷ 2.48 spread = **+1.64**, meaning "faster than usual"

after this, every column is centred around 0, roughly −3 to +3.

**median / imputation** (filling empty cells)
if a value is missing, fill it with a sensible typical value. the median is the middle value.
*in our project:* the data had no gaps, but if someone types "abc" into the website, that cell gets the median from
the learning rows, e.g. `Rate` = 29.61.

**pipeline**
a fixed chain of steps every row goes through, in order, like a middleware chain. the same chain runs during
learning, during testing and inside the website.
*in our project:* clean → fill gaps → shrink → compare to typical → model.

**fit only on the training rows**
the averages and medians used for scaling come only from the learning rows; the test rows are processed with those
same numbers. otherwise the "final exam" would leak into the studying.

### learning

**model**
a function that takes a row's 45 numbers and returns an answer. normally you write detection rules by hand (a Snort
signature, a WAF rule); a model works its rules out **from examples**.
*in our project:* in: a flow's 45 numbers. out: "93% chance this is an attack."

**training** (learning, fitting)
running the learning method on the learning rows, where it adjusts itself until its guesses match the known answers
as well as possible.
*in our project:* each of the 11 methods trained on the same 344,246 rows, in between 0.4 seconds (KNN) and 235
seconds (AdaBoost).

**prediction** (inference)
using a trained model on a new row.
*in our project:* the website does this in your browser every time you change a number in the detector.

**probability / score**
how sure the model is, from 0 to 1 (0% to 100%).
*in our project:* the normal row in the guide gets **16.1%**, the SlowLoris attack row gets **99.7%**.

**threshold**
the cut-off that turns a score into a yes/no, like a SIEM alert threshold.
*in our project:* default **50%**: 50% and above means "attack". the website's slider moves it. at 90% you get far
fewer false alarms (0.85% of normal traffic) but miss more attacks (catch only 87.5%).

**parameters vs settings** (hyperparameters)
- **settings** are what *you* choose before training, like config values: "use 200 trees", "look at the 5 nearest
  rows"
- **parameters** are what the *training* works out: the weights, the if/else rules

*in our project:* the neural network has settings "2 layers, 64 and 32 cells" and **5,057 learned weights**.
gradient boosting has the setting "300 trees" and learned **18,300** questions-and-answers inside them.

**supervised vs unsupervised**
- **supervised:** the model learns from rows **with** the correct answer (like learning from labelled incidents)
- **unsupervised:** it gets **no answers** and has to find structure on its own

*in our project:* 10 models are supervised. K-Means is unsupervised (it only ever sees normal traffic, never an
attack), and so are PCA and the family tree (hierarchical clustering).

**classification vs regression**
- **classification:** the answer is a category ("attack or normal", "which family")
- **regression:** the answer is a number (a price, a temperature)

*in our project:* this is classification. that's why polynomial regression (a regression method) isn't used.

**binary vs multi-class**
binary = 2 possible answers; multi-class = more than 2.
*in our project:* job 1 is binary (normal / attack). job 2 is 8-class (benign + 7 families).

**overfitting**
memorising the study material instead of learning the pattern, like a regex that matches exactly the 10 test strings
and nothing else. scores great on what it studied, badly on anything new. the put-aside test rows exist to catch this.

### the 11 learning methods (models)

each one compared on the same 114,749 test rows. "caught" = share of real attacks it flagged.

| model | how it works, in dev / security terms | caught |
|---|---|---|
| **logistic regression** | a weighted risk score, like a fraud score: each of the 45 fields gets a weight, add them up, squash to 0–100%. training finds the 45 weights | 91.55% |
| **KNN** (k nearest neighbours) | similarity search: for a new flow, find the **5 most similar** flows it has stored and go with their majority. no real "learning", it just stores 50,000 rows and compares | 93.37% |
| **decision tree** | a learned chain of if/else rules, like a firewall rule chain that writes itself: "if rst_count > 113 and flow_duration ≤ 133 and Rate > 265 → …" | 94.91% |
| **random forest** | 200 decision trees, each built from a random shuffle of the rows and only allowed to look at ~6 random fields per question, then a **majority vote**. like 200 analysts who each saw different evidence | 96.35% |
| **bagging** | 100 decision trees, each built from a random **half** of the rows (all fields), then a vote. random forest is bagging plus the random-fields trick | **96.35%** (best) |
| **AdaBoost** (boosting) | 200 one-question rules in a row; each new rule focuses on the flows the previous ones got **wrong**, and better rules get a bigger say | 93.36% |
| **gradient boosting** (boosting) | 300 small trees in a row; each adds a small correction to a running score, fixing what the earlier ones still get wrong. sum the 300 corrections → a % | 95.95% (**on the website**) |
| **perceptron** | one artificial "neuron": a weighted sum and a hard yes/no, with no percentage in between | 87.37% |
| **neural network** (MLP) | layers of those neurons feeding each other (45 inputs → 64 → 32 → 1 answer), so it can learn curved, combined patterns | 95.85% |
| **naive bayes** | how a classic spam filter works: "how likely is this value in normal traffic vs in attacks?", multiplied across all fields, assuming each field is independent (they aren't, which hurts it) | 27.89% |
| **K-Means detector** | baseline anomaly detection: learn **20 typical profiles of normal traffic**, then flag anything far from all of them. never sees an attack while learning | 57.69% |

**why gradient boosting is on the website, not bagging:** only 0.4% fewer attacks caught, but the fewest false
alarms of the top group, and its saved file is **0.5 MB** instead of 23 MB (bagging) or 106 MB (random forest), small
enough to ship to a browser.

**ensemble**
any model made of many smaller models that vote or add up. random forest, bagging, AdaBoost and gradient boosting are
ensembles. in our results they were the strongest group.

### judging the models (scoring)

**confusion matrix**
a 2 × 2 table of every possible outcome of an alert. gradient boosting on the 114,749 test rows:

| | said "normal" | said "attack" |
|---|---|---|
| **really normal** (30,135) | 27,567 ✅ correctly ignored | 2,568 ❌ **false alarm** |
| **really an attack** (84,614) | 3,430 ❌ **missed attack** | 81,184 ✅ **caught** |

**true / false positive / negative**
- **true positive** = a real attack, alerted (81,184)
- **false positive** = a false alarm on normal traffic (2,568)
- **false negative** = a missed attack (3,430). the dangerous one
- **true negative** = normal traffic, correctly left alone (27,567)

**recall** (catch rate, detection rate)
of the real attacks, how many did it catch? 81,184 ÷ 84,614 = **95.95%**. the most important number for an intrusion
detector, because every miss is an attacker getting through.

**precision**
of the alerts it raised, how many were real attacks? 81,184 ÷ (81,184 + 2,568) = **96.93%**. low precision =
alert fatigue for the security team.

**false alarm rate**
of the normal traffic, how much got flagged? 2,568 ÷ 30,135 = **8.52%**.

**accuracy**
of all rows, how many were right? (27,567 + 81,184) ÷ 114,749 = **94.77%**. misleading on its own here: 73.7% of test
rows are attacks, so a dumb rule that always says "attack" already scores 73.7%.

**F1**
one number that balances precision and recall (it drops if either one is bad). gradient boosting: **96.44%**.

**cross-validation**
re-running the whole test 5 times on 5 different slices of the learning data, to check the score isn't luck. like
running a flaky test suite several times.
*in our project:* random forest scored 96.17% recall, give or take 0.08% across the 5 runs. not luck.

**class imbalance**
some answers are far more common than others.
*in our project:* 7.2 million `DDoS-ICMP_Flood` rows vs 1,252 `Uploading_Attack` rows. a lazy model can ignore the
rare ones and still look good on average.

**class weight**
making mistakes on rare classes "cost more" during training, so the model pays attention to them.
*in our project:* on the 8-family model it raised brute force from 47% to 71% caught and web from 73% to 83%, but
lowered DDoS from 97% to 86%. it moves accuracy around between families; it doesn't add any overall.

**permutation importance** (which fields matter)
scramble one field across all rows (like fuzzing one input) and see how much worse the model gets. the bigger the
drop, the more the model relies on that field.
*in our project:* the top fields are `rst_count`, `urg_count`, `Number`, `flow_duration` and `Header_Length`.

### looking at the data (exploring)

**EDA** (exploratory data analysis)
looking at the data with counts and charts before building anything, like reading logs before writing detection
rules.
*in our project:* counting rows per family, box plots of speed and size per family, the correlation matrix, the PCA
map, and the check that found the `IAT` leak.

**correlation**
how strongly two fields move together: 1 = always together, 0 = unrelated.
*in our project:* `Rate` and `Srate` = 1.000 (identical); `Number` and `Weight` = 0.990.

**PCA** (principal component analysis)
compressing many columns into a few while keeping as much information as possible, like rendering a 3D object as a
2D picture. used to draw the data, or to shrink it.
*in our project:* squeezing 45 columns into 2 keeps only 36% of the information; it takes 20 to keep 95%. so the data
really needs its many columns.

**clustering**
grouping similar rows without being told the answers.
*in our project:* K-Means grouped normal traffic into 20 typical profiles.

**elbow method**
how to choose the number of groups: try 2, 4, 6 … 30 groups and see where adding more stops helping much (the bend,
or "elbow", in the chart).
*in our project:* the bend was at **20**.

**hierarchical clustering / dendrogram**
a family tree that joins the most similar items first.
*in our project:* a tree of the 34 labels by their average flow ([figures/13_attack_dendrogram.png](figures/13_attack_dendrogram.png)).
two things jump out:
- every DoS flood joins its DDoS twin almost immediately (`DoS-TCP_Flood` with `DDoS-TCP_Flood`, same for SYN, HTTP
  and UDP). it's the same attack from one machine or many, which is why the 8-family model mixes DoS and DDoS up
- `BenignTraffic` sits right next to `MITM-ArpSpoofing`, `DNS_Spoofing` and `BrowserHijacking`. on average, spoofing
  looks like normal traffic, which is why spoofing is the second hardest family to catch

### shipping it

**saving a model** (model persistence)
writing the trained model to a file so it can be reused without training again, like a build artifact.
*in our project:* `models/ids_bundle.joblib` (4.7 MB), saved with `joblib`.

**exporting to JSON**
we wrote the 300 trees' rules (field, cut-off value, left/right, score) into a JSON file the browser can read.
*in our project:* `web/public/model.json` (7.3 MB, about 2 MB compressed).

**parity test**
a test proving that two implementations give the same output.
*in our project:* the TypeScript version in the browser and the original Python version give the same percentage on
300 test rows, to within 0.000000001.

**static site**
a website that is only files (HTML, JS, JSON), with no server code. the model runs in the visitor's browser, so
nothing they type is sent anywhere.
*in our project:* built with Next.js, hosted free on Cloudflare Pages at https://walrus-flow-sentinel.pages.dev/.
