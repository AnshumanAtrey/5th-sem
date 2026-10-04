"""Build the viva deck (Case-Study-148-Presentation.pdf), every number read from reports/results.json.

Run after the notebook (kaggle/run_on_kaggle.py brings results.json, figures/ and screenshots/ back):

    python report/build_deck.py
"""
import html
import json
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
R = json.loads((ROOT / "reports" / "results.json").read_text())
BOARD = {row["model"]: row for row in R["comparison"]}
APP = R["app_model_test"]
NAME = "Case-Study-148-Presentation"
SLIDES = []


def pct(v, digits=1):
    return f"{v * 100:.{digits}f}%"


def esc(text):
    return html.escape(str(text))


def points(items):
    return "".join(f"<div class='pt'><div class='h'>{h}</div><div class='d'>{d}</div></div>" for h, d in items)


def img(path, cls=""):
    return f"<img class='{cls}' src='{(ROOT / path).as_uri()}'>"


def table(header, rows, cls=""):
    head = "".join(f"<th>{esc(h)}</th>" for h in header)
    body = "".join("<tr>" + "".join(f"<td>{c}</td>" for c in r) + "</tr>" for r in rows)
    return f"<table class='{cls}'><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table>"


def stats(cards):
    return "<div class='stats'>" + "".join(f"<div class='stat'><b>{v}</b><span>{k}</span></div>" for v, k in cards) + "</div>"


def slide(title, left, right="", kicker="", split="split"):
    SLIDES.append(f"<section class='slide'><div class='kicker'>{kicker}</div><h2>{title}</h2><div class='rule'></div>"
                  f"<div class='{split}'><div class='left'>{left}</div><div class='right'>{right}</div></div></section>")


trap = R["iat_trap"]
iat_alone = next(v for k, v in trap.items() if k.startswith("IAT"))
no_iat = next(v for k, v in trap.items() if k.startswith("traffic"))
acc_key = "accuracy, naming all 34 labels"
best = R["best_recall_model"]
families = R["family_report"]
hard_fams = sorted((f for f in families if f != "Benign"), key=lambda f: families[f]["recall"])
unseen = sorted(R["unseen"], key=lambda r: r["caught when NEVER seen"])
cv = R["cv"]

SLIDES.append(f"""<section class='slide cover'>
<div class='chips'><span>ML Fundamentals · Major Project</span><span>Case Study 148</span><span>Classification · IDS</span></div>
<h1 style='font-size:72px'>Network Intrusion Detection</h1>
<p class='sub'>A machine-learning IDS that reads a network flow's numbers and says normal or intrusion, and which attack
family, trained on CICIoT2023: real traffic from 105 IoT devices, captured in 2023.</p>
<div class='coverstats'>{stats([(f"{R['flows_full'] / 1e6:.1f} M", "flows in the dataset"), (str(len(BOARD)), "models compared, all from the syllabus"),
                                 (pct(APP['recall'], 2), "attacks caught (deployed model)"),
                                 (pct(APP['false alarm rate'], 2), "normal flows flagged")])}</div>
<p class='team'>Anshuman Atrey · 150096724029</p>
<p class='meta'>B.Tech CSE 2024–28 · Semester V · Machine Learning Fundamentals</p></section>""")

slide("The problem and the data", "<div class='quote'><b>Case Study 148.</b> Modern networks generate large volumes "
      "of traffic and detecting malicious activity manually is difficult. Build an ML-based IDS that separates normal "
      "and suspicious traffic, compare algorithms, and deploy a prototype.</div>" + points([
          ("Dataset: <em>CICIoT2023</em> (Canadian Institute for Cybersecurity, 2023)",
           "105 real IoT devices, 33 attacks in 7 families: DDoS, DoS, Mirai botnet, Recon, Spoofing, Web, BruteForce. "
           "Recent and realistic, unlike the 1999 KDD data most courses use."),
          ("A fair sample", f"{R['flows_full']:,} flows in 169 CSV parts. Kept every rare attack and up to 12,000 of each "
           f"big one, plus 120,000 benign: {R['flows_sample']:,} flows, {R['duplicates_dropped']:,} duplicates dropped."),
          ("Fair test", f"stratified 75 / 25 split: {R['n_train']:,} train, {R['n_test']:,} test flows, "
           f"{R['features']} features each. All cleaning fitted on train only."),
      ]), img("figures/01_families.png"), "1 · Problem and data")

slide("What the traffic looks like", points([
    ("Floods are loud", "very high packet rate, tiny packets, short flows. Easy to separate."),
    ("Web attacks and brute force look like browsing", "they overlap benign traffic in every view, so they will be the "
     "hard ones."),
    ("Many features say the same thing", "Rate = Srate, IPv = LLC, Std ≈ Radius: harmless for trees, but naive bayes "
     "double-counts them."),
]), img("figures/02_feature_by_family.png", "half") + img("figures/04_pca.png", "half"), "1 · Problem and data")

slide("The 99% trap: one column that knows the answer", points([
    (f"<em>IAT alone: {pct(iat_alone[acc_key])}</em> naming all 34 labels",
     f"all {R['features']} real traffic features together: {pct(no_iat[acc_key])}. One column cannot know more than all "
     "the traffic."),
    ("It is a clock, not a signal", "IAT tracks <i>when</i> in the capture a flow happened, and each attack ran in its "
     "own time window. So it identifies the recording session, and the session gives away the attack."),
    ("Dropped from every model", "on a real network a new attack happens at a new time. Many published CICIoT2023 "
     "results are 99%+ partly because of this. Our numbers are lower and honest."),
]), img("figures/05_iat_trap.png"), "2 · Analysis")

slide("Every model from the syllabus", table(["module", "models"], [
    ["V · Classification", "Logistic Regression, KNN, Decision Tree"],
    ["VI · Evaluation", "train / test split, 5-fold cross-validation, accuracy, precision, recall, F1, confusion matrix"],
    ["VII · Unsupervised", f"K-Means as a detector trained on normal traffic only (k = {R['kmeans_k']} by the elbow "
     "method) · hierarchical clustering of the 34 attack types"],
    ["VIII · PCA &amp; Ensembles", f"PCA ({R['pca_95']} components keep 95%) · Random Forest, Bagging, AdaBoost, "
     "Gradient Boosting"],
    ["IX · Neural networks", "Perceptron, MLP neural network · model saved and deployed"],
    ["Case study only", "Naive Bayes (asked for by Case Study 148, not in the syllabus)"],
], "cls") + "<p class='note'>The case study asks for 6 algorithms; all 11 classifiers taught in the course run on the "
    "same training flows and the same locked test flows.</p>", img("figures/06_kmeans_elbow.png"), "2 · Analysis")

rows = [[esc(m), esc(r["module"]), pct(r["recall"], 2), pct(r["precision"], 2), pct(r["F1"], 2),
         f"{r['missed attacks']:,.0f}", f"{r['false alarms']:,.0f}", f"{r['size MB']:.1f}"] for m, r in BOARD.items()]
slide("11 models, same locked test set", table(
    ["model", "module", "recall", "precision", "F1", "missed attacks", "false alarms", "MB"], rows, "mini") +
    f"<p class='note'>Sorted by recall, the IDS number: of the real attacks, how many it flagged. "
    f"{R['n_test']:,} test flows, alarm at 50%.</p>", img("figures/08_model_comparison.png"), "2 · Analysis")

fam_rows = R["by_family"]
blind = {m: min((v, f) for f, v in fam_rows[m].items() if f != "Benign") for m in fam_rows}
weakest = sorted(blind.items(), key=lambda kv: kv[1][0])[:3]
slide("The models' outputs side by side", points([
    ("Same flows, every model", "each cell: share of that family's test flows handled correctly."),
    ("Floods are easy for everyone", "DDoS, DoS and Mirai are caught by nearly every model."),
    ("The quiet attacks split the models", " · ".join(f"{esc(m)}: {esc(f)} only {pct(v, 0)}" for m, (v, f) in weakest)),
    ("Trees agree with each other", "random forest, bagging and boosting give the same verdict on almost every flow, "
     "so they also share their mistakes."),
]), img("figures/09_recall_by_family_model.png"),
    "2 · Analysis")

cv_rows = [[esc(m), f"{v['recall mean'] * 100:.2f}% ± {v['recall std'] * 100:.2f}",
            f"{v['F1 mean'] * 100:.2f}% ± {v['F1 std'] * 100:.2f}"] for m, v in cv.items()]
slide("Where the mistakes are", points([
    (f"Highest recall: <em>{esc(best)}</em>", f"misses {BOARD[best]['missed attacks']:,.0f} attacks, "
     f"{BOARD[best]['false alarms']:,.0f} false alarms."),
    ("Not a lucky split", "5-fold cross-validation on the training flows:"),
]) + table(["model", "recall (5 folds)", "F1 (5 folds)"], cv_rows, "mini"),
    img("figures/07_confusion_matrices.png"), "2 · Analysis")

feats = list(R["top_features"])[:6]
slide("Which features and which attacks", points([
    ("Most important features", ", ".join(f"<code>{esc(f)}</code>" for f in feats) +
     ": shuffling them hurts the model most (permutation importance)."),
    (f"Family model: {pct(R['family_accuracy'])} accuracy, macro F1 {pct(R['family_macro_f1'])}",
     "8 classes: benign + 7 attack families, gradient boosting with balanced class weights."),
    ("Hierarchical clustering", "the 34 labels by their average flow: types that merge low on the tree look alike to "
     "every model."),
    ("Hardest families", ", ".join(f"{esc(f)} ({pct(families[f]['recall'])} recall)" for f in hard_fams[:3]) +
     ": they look like ordinary traffic."),
]), img("figures/11_feature_importance.png", "half") + img("figures/13_attack_dendrogram.png", "half"),
    "3 · Results")

prev = [(s, APP["recall"] * s / (APP["recall"] * s + APP["false alarm rate"] * (1 - s))) for s in (0.5, 0.01, 0.001)]
imb = R["imbalance"]
slide("Class imbalance and unseen attacks", points([
    ("Accuracy lies", "always answering “intrusion” already scores high on this data, so we rank on recall and F1."),
    ("Weighting moves recall, it does not add it", f"balanced class weights: brute force "
     f"{pct(imb['recall, no weighting']['BruteForce'], 0)} → {pct(imb['recall, balanced']['BruteForce'], 0)}, web "
     f"{pct(imb['recall, no weighting']['Web'], 0)} → {pct(imb['recall, balanced']['Web'], 0)}, but DDoS "
     f"{pct(imb['recall, no weighting']['DDoS'], 0)} → {pct(imb['recall, balanced']['DDoS'], 0)}; macro F1 flat "
     f"({pct(imb['recall, no weighting']['macro F1'])} vs {pct(imb['recall, balanced']['macro F1'])})."),
    ("Precision depends on how rare attacks are", " · ".join(f"{s:.1%} attacks → {pct(p)} precision" for s, p in prev)),
    ("Never-seen families", f"trained without a family, then tested on it: {esc(unseen[-1]['family left out of training'])} "
     f"still {pct(unseen[-1]['caught when NEVER seen'])} caught, {esc(unseen[0]['family left out of training'])} only "
     f"{pct(unseen[0]['caught when NEVER seen'])}. The K-Means detector, which never saw any attack, catches floods "
     "but not the quiet ones."),
]), img("figures/15_unseen_families.png", "half") + img("figures/14_class_weighting.png", "half"), "3 · Results")

slide("The prototype: Flow Sentinel (Next.js)", "<div class='quote'><b>Live:</b> walrus-flow-sentinel.pages.dev, in the "
      "Walrus Securitas look (white and orange), hosted on Cloudflare Pages.</div>" + points([
    ("Detector", "pick one of 300 real test flows on the traffic tape, or type in its features: normal / intrusion, the "
     "intrusion score, the alarm threshold, and all 8 family probabilities."),
    ("Scan a file", "drop a CSV of up to 20,000 flows: verdicts, a sortable table, a download. Missing columns, text, "
     "negative or infinite values are caught."),
    ("Model comparison and method", "all 11 models, the per-family heatmap, the unseen-attack test, the IAT trap and "
     "the six answers, every number read from the notebook's results."),
    ("Runs in the browser", f"gradient boosting ({pct(APP['recall'], 2)} recall) exported to JSON; a test checks the "
     "browser's predictions match sklearn's on 300 flows. Next.js 16, Tailwind, shadcn/ui, Recharts."),
]), img("screenshots/app/01-detector-attack.png", "crop") + img("screenshots/app/04-scan-demo-file.png", "crop"),
    "3 · Results")

answers = [
    ["Can ML separate normal and malicious traffic?", f"Yes: {pct(APP['recall'], 2)} of attacks caught, "
     f"{pct(APP['false alarm rate'], 2)} of normal flows flagged."],
    ["Which features matter most?", ", ".join(esc(f) for f in feats[:4])],
    ["Highest recall?", f"{esc(best)} ({pct(BOARD[best]['recall'], 2)})"],
    ["Hardest attack categories?", ", ".join(esc(f) for f in hard_fams[:3])],
    ["Effect of class imbalance?", "accuracy misleads, rare families get ignored without weighting, precision falls "
     "when attacks are rare"],
    ["Previously unseen traffic?", f"partly: {pct(unseen[-1]['caught when NEVER seen'])} for "
     f"{esc(unseen[-1]['family left out of training'])}, {pct(unseen[0]['caught when NEVER seen'])} for "
     f"{esc(unseen[0]['family left out of training'])}"],
]
slide("Answers and limitations", table(["question", "answer"], answers, "cls"), points([
    ("Limitations", "lab traffic from one IoT testbed · features are averaged windows, not single packets · benign share "
     "set by our sampling · new attack families are only partly caught · one layer of defence, not a guarantee."),
    ("Next", "test on another network's traffic (cross-dataset), add an anomaly detector for unseen attacks."),
]), "3 · Results")

css = (Path(__file__).parent / "deck.css").read_text()
pages = "".join(s.replace("</section>", f"<div class='foot'><span>Case Study 148 · Network Intrusion Detection · "
                                        f"Anshuman Atrey</span><span>{i} / {len(SLIDES)}</span></div></section>")
                for i, s in enumerate(SLIDES, 1))
doc = (f"<!doctype html><html><head><meta charset='utf-8'><title>Case Study 148 — Presentation</title>"
       f"<link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono"
       f"&display=swap' rel='stylesheet'><style>{css}</style></head><body>{pages}</body></html>")
page_file = Path(__file__).parent / f"{NAME}.html"
page_file.write_text(doc)
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto(page_file.as_uri())
    page.wait_for_load_state("networkidle")
    page.pdf(path=str(ROOT / f"{NAME}.pdf"), width="1280px", height="720px", print_background=True)
    browser.close()
print(f"wrote {NAME}.pdf ({len(SLIDES)} slides)")
