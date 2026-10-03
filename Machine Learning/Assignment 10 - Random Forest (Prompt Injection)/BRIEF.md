# Assignment 10 - Random Forest

> **Question (10 marks, difficulty: moderate):**
> Building Ensemble Model With Deployment. Build Random Forest Model With Deployment(either regression or classification)
> Download dataset from kaggle

## Details (pulled from Lisa)

| field | value |
|-------|-------|
| subject | Machine Learning Fundamentals (Sem 5) |
| chapter | Dimensionality Reduction & Ensembles |
| topic | Assignment 10 |
| total marks | 10 |
| difficulty | moderate |
| min questions | none set |
| trainer | Prof. Vinaya Kulkarni |
| deadline (expiresAt) | 2026-09-21 10:30 UTC |
| attached files | none |
| source content id | 6aa1231aa8493495ad0287a5 |
| status when saved | not submitted / pending |

## What the question is really asking for

- **dataset from kaggle** -> no dataset is given, so the same one as my other ML assignments, for [Walrus Securitas](https://walrussecuritas.com/): `hf_prompt_injections.csv` from [AI Agent Cybersecurity Dataset 2026](https://www.kaggle.com/datasets/chuneeb/ai-agent-cybersecurity-dataset-2026), prompts marked normal or prompt injection
- **a random forest** -> `RandomForestClassifier`, tuned with cross-validation on the training prompts only. same data and same test prompts as assignment 9 (bagging), so the two can be compared fairly
- **"either regression or classification"** -> classification: is this prompt normal or an attack
- **with deployment** -> a Streamlit app, live on Streamlit Community Cloud: paste a prompt (or a whole batch), see the verdict and which words pushed it there

See `README.md` for the walkthrough, the results and the live app.
