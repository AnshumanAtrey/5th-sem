# Assignment 7 - K-Means

> **Question (10 marks, difficulty: moderate):**
> K-Means. Download Any Dataset From Kaggle And Build K- Means Model with Good Accuracy
> Submit pdf , doc file with code and code output screenshot with code explanation

## Details (pulled from Lisa)

| field | value |
|-------|-------|
| subject | Machine Learning Fundamentals (Sem 5) |
| chapter | Unsupervised Learning |
| topic | K- Means Clustering |
| total marks | 10 |
| difficulty | moderate |
| min questions | none set |
| trainer | Prof Vishakha Pande |
| deadline (expiresAt) | 2026-09-01 09:30 UTC |
| attached files | none |
| source content id | 6a96798be2a9ddc061c4596f |
| status when saved | not submitted / pending |

## What the question is really asking for

- **any kaggle dataset** -> the brief leaves it open, so i picked one that matters for [Walrus Securitas](https://walrussecuritas.com/): `hf_prompt_injections.csv` from [AI Agent Cybersecurity Dataset 2026](https://www.kaggle.com/datasets/chuneeb/ai-agent-cybersecurity-dataset-2026), 11,598 prompts marked normal or prompt injection
- **a k-means model** -> `kmeans_prompt_injection.ipynb`: k-means (k = 2) on e5-base-v2 sentence embeddings, run on a kaggle GPU
- **"with good accuracy"** -> k-means is unsupervised, so accuracy needs real labels to check against. this dataset has them. the model never sees them, they only grade it at the end: 90.6%, and 89.7% on prompts it never saw
- **pdf + doc file with code, output screenshots and explanation** -> `Assignment-7-KMeans-Prompt-Injection-Report.pdf` and `.docx`. every step goes explanation -> code -> screenshot of the real notebook output

See `README.md` for the walkthrough and how to rerun everything.
