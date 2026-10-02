"""Streamlit Community Cloud entrypoint for Lisa assignment 10 (Walrus Prompt Shield, random forest).

Same reason as streamlit_app.py: Streamlit Cloud's installer breaks on spaces in the app folder's path, so the app is
launched from the repo root, where requirements.txt has no spaces in its path. The real app lives in the assignment folder.
"""
import runpy
from pathlib import Path

runpy.run_path(str(Path(__file__).parent / "Machine Learning" / "Lisa" / "Assignment 10 - Random Forest (Prompt Injection)" / "app.py"),
               run_name="__main__")
