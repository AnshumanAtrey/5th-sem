# Assignment 8 - Hierarchical clustering

> **Question (10 marks, difficulty: moderate):**
> Hierarchical clustering. Download Any Dataset From Kaggle And Build Hierarchical clustering Model with Good Accuracy
> Submit pdf , doc file with code and code output screenshot with code explanation

## Details (pulled from Lisa)

| field | value |
|-------|-------|
| subject | Machine Learning Fundamentals (Sem 5) |
| chapter | Unsupervised Learning |
| topic | Hierarchical clustering |
| total marks | 10 |
| difficulty | moderate |
| min questions | none set |
| trainer | Prof. Prasad Junghare |
| deadline (expiresAt) | 2026-09-10 07:40 UTC |
| attached files | none |
| source content id | 6a967abfe2a9ddc061c45971 |
| status when saved | not submitted / pending |

## What the question is really asking for

- **any kaggle dataset** -> the same prompt-injection data as assignment 7 (for [Walrus Securitas](https://walrussecuritas.com/)): `hf_prompt_injections.csv` from [AI Agent Cybersecurity Dataset 2026](https://www.kaggle.com/datasets/chuneeb/ai-agent-cybersecurity-dataset-2026). same data on purpose, so k-means (A7) and hierarchical (A8) can be compared fairly
- **a hierarchical clustering model** -> `hierarchical_prompt_injection.ipynb`: agglomerative clustering (ward linkage, plus single / complete / average compared) on e5-base-v2 sentence embeddings, run on a kaggle GPU
- **"with good accuracy"** -> graded against the hidden normal / injection labels, both for the top split of the tree and for the tree cut into many branches, on prompts it never saw
- **pdf + doc file with code, output screenshots and explanation** -> `Assignment-8-Hierarchical-Prompt-Injection-Report.pdf` and `.docx`. every step goes explanation -> code -> screenshot of the real notebook output

See `README.md` for the walkthrough and how to rerun everything.
