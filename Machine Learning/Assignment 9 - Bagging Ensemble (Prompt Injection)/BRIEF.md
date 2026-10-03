# Assignment 9 - Bagging ensemble

> **Question (10 marks, difficulty: moderate):**
> Building Ensemble Model With Deployment. Download the dataset from kaggle and build ensemble model like bagging or bossting
> model will regression or classification any one model with proper UI (Deployment)

## Details (pulled from Lisa)

| field | value |
|-------|-------|
| subject | Machine Learning Fundamentals (Sem 5) |
| chapter | Dimensionality Reduction & Ensembles |
| topic | Assignment 9 (Bagging) |
| total marks | 10 |
| difficulty | moderate |
| min questions | none set |
| trainer | Prof. Vinaya Kulkarni |
| deadline (expiresAt) | 2026-09-21 10:30 UTC |
| attached files | none |
| source content id | 6aa12289a8493495ad0287a3 |
| status when saved | not submitted / pending |

## What the question is really asking for

- **dataset from kaggle** -> no dataset is given, so the same one as my other ML assignments, for [Walrus Securitas](https://walrussecuritas.com/): `hf_prompt_injections.csv` from [AI Agent Cybersecurity Dataset 2026](https://www.kaggle.com/datasets/chuneeb/ai-agent-cybersecurity-dataset-2026), prompts marked normal or prompt injection
- **an ensemble, "like bagging or boosting"** -> Lisa files this one under the topic "Assignment 9 (Bagging)", so bagging is the main model. boosting gets built too, on the same data, as the comparison
- **"regression or classification, any one"** -> classification: is this prompt normal or an attack
- **proper UI (deployment)** -> a Streamlit app, live on Streamlit Community Cloud: paste a prompt, see how many of the trees vote "attack"
- **the chapter is "Dimensionality Reduction & Ensembles"** -> the words get squeezed with SVD before the trees see them, so both halves of the chapter show up

See `README.md` for the walkthrough, the results and the live app.
