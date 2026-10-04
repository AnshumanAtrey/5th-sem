# case study 148: network intrusion detection

the ML major project (Lisa, due Oct 14; viva Oct 5, 3:45 PM, panel 1). the brief is in
[problem-statement.md](problem-statement.md): analyse network traffic, find what malicious traffic looks like, compare
algorithms (with a close look at false negatives), and build a prototype IDS that says normal / intrusion and, in the
advanced version, which attack category.

| | |
|---|---|
| **dataset** | [CICIoT2023](https://www.unb.ca/cic/datasets/iotdataset-2023.html) (Canadian Institute for Cybersecurity, 2023): 46,686,579 flows from a real network of 105 IoT devices, 33 attacks in 7 families + benign. on kaggle as [UNB CIC IOT 2023](https://www.kaggle.com/datasets/madhavmalhotra/unb-cic-iot-dataset) |
| **models** | all 11 classifiers taught in the course: logistic regression, KNN, decision tree (module V), K-Means as an unsupervised detector (VII), random forest, bagging, AdaBoost, gradient boosting (VIII), perceptron, MLP neural network (IX), plus naive bayes, which the case study asks for |
| **live app** | **[walrus-flow-sentinel.streamlit.app](https://walrus-flow-sentinel.streamlit.app/)** (Streamlit Community Cloud, Walrus Securitas look) |
| **deliverables** | [the project in plain words + glossary](GLOSSARY.md) · [how it works, start to end, in detail](HOW-IT-WORKS.md) · [notebook](intrusion_detection.ipynb) · [report (PDF)](Case-Study-148-Network-Intrusion-Detection-Report.pdf) · [report (Word)](Case-Study-148-Network-Intrusion-Detection-Report.docx) · [viva deck (12 slides)](Case-Study-148-Presentation.pdf) · [web app](web/) · [figures](figures/) |

## results (114,749 locked test flows)

| model | syllabus module | recall | precision | F1 | attacks missed | false alarms |
|---|---|---|---|---|---|---|
| bagging | VIII | 96.35% | 96.60% | 96.48% | 3,086 | 2,869 |
| random forest | VIII | 96.35% | 96.50% | 96.43% | 3,088 | 2,954 |
| **gradient boosting (deployed)** | VIII | 95.95% | 96.93% | 96.44% | 3,430 | 2,568 |
| neural network (MLP) | IX | 95.85% | 96.67% | 96.26% | 3,511 | 2,793 |
| decision tree | V | 94.91% | 94.83% | 94.87% | 4,308 | 4,377 |
| KNN (k=5) | V | 93.37% | 96.04% | 94.68% | 5,612 | 3,259 |
| AdaBoost | VIII | 93.36% | 94.29% | 93.82% | 5,620 | 4,784 |
| logistic regression | V | 91.55% | 95.07% | 93.28% | 7,148 | 4,016 |
| perceptron | IX | 87.37% | 95.46% | 91.23% | 10,689 | 3,519 |
| K-Means detector (never sees an attack) | VII | 57.69% | 99.40% | 73.01% | 35,799 | 293 |
| naive bayes | case study | 27.89% | 99.86% | 43.60% | 61,018 | 33 |

- **the IAT trap.** one column, `IAT`, names the right attack type 88% of the time on its own, more than all 45 real
  traffic features together (75%). it tracks *when* each attack was recorded, not the traffic, so it is dropped from
  every model (notebook section 5). many published CICIoT2023 results are inflated by it
- **hardest attacks:** reconnaissance and spoofing (`Recon-OSScan` 33% missed, `DNS_Spoofing` 21%)
- **never-seen families:** retrained without a family, gradient boosting still catches 100% of unseen DoS / Mirai,
  84% of web, 83% of brute force, 79% of recon, but only 46% of spoofing
- **gradient boosting is deployed** over bagging / random forest: 0.4 points less recall, fewer false alarms, and a
  0.5 MB model instead of 23 / 106 MB
- the six questions from the brief are answered in notebook section 19 and on the web app's *data and method* page

## the web app: Flow Sentinel (`web/`), live at https://walrus-flow-sentinel.streamlit.app/

Next.js 16, React 19, Tailwind v4, shadcn/ui, Recharts, bun (the same stack as my SEPM project). no Python server:
the gradient boosting models are exported as plain lists of trees (`web/public/model.json`) and evaluated in
TypeScript in the browser (`web/src/lib/ids.ts`). `bun test` checks the browser's probabilities against sklearn's on
300 real test flows (largest gap below 1e-9). pages: **detector** (a tape of 300 real test flows, the verdict, the
threshold slider, the attack family), **scan a file** (CSV up to 20,000 flows), **model comparison**, **data and
method**.

```bash
cd web && bun install && bun run dev      # http://localhost:3000
bun test tests                            # browser model == sklearn, bad inputs, label mapping
bun run build                             # static site in web/out, any static host serves it
bun run build:streamlit                   # builds into ../../../flow-sentinel/static; push, and Streamlit Cloud serves it
```

**how it is hosted:** Streamlit Community Cloud runs [flow-sentinel/streamlit_app.py](../../flow-sentinel/streamlit_app.py)
at the repo root. that page only shows the built site full-screen; Streamlit serves the site's files from
`flow-sentinel/static/` (static file serving), and the model still runs in the visitor's browser. Cloud runs apps
under `/~/+/`, and Next.js rejects `+` in its base path, so `bun run build:streamlit` builds with a placeholder and
`web/scripts/streamlit_bundle.ts` swaps in `/~/+/app/static`.

## how to rerun everything

```bash
python3 kaggle/run_on_kaggle.py           # heavy: the notebook on a kaggle CPU (all 169 CSV parts), pulls results back
python3 web/scripts/export_model.py       # models/ids_bundle.joblib -> web/public/model.json (checked against sklearn)
cd web && bun run build && cd ..
python3 report/app_screenshots.py         # drives the built site -> screenshots/app/
python3 report/build_report.py            # executed notebook -> report PDF + Word
python3 report/build_deck.py              # reports/results.json -> 12-slide viva deck
```

## files

```
intrusion_detection.ipynb   the whole analysis (19 sections), executed on kaggle
src/flows.py                sampling, attack families, the leak-free feature list, the shared cleaning pipeline
tests/test_flows.py         the data code's tests (run on kaggle)
kaggle/                     run_on_kaggle.py (push, wait, pull) + kernel_job.py (what runs there)
figures/  reports/          the notebook's charts, results.json, tests.xml
models/ids_bundle.joblib    the deployed models + everything the app shows
data/demo_flows.csv         300 test flows with their true labels (the app's demo file)
web/                        Flow Sentinel, the Next.js app
report/                     app screenshots, report and deck builders
```
