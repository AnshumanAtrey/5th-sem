"""Streamlit Community Cloud entrypoint for the Group 12 app (Retailligence).

Streamlit Cloud's installer breaks on spaces in the app folder's path, so the app is launched from the repo root,
where requirements.txt has no spaces in its path. The real app lives in the project folder.
"""
import runpy
from pathlib import Path

runpy.run_path(str(Path(__file__).parent / "Machine Learning" / "Lisa" / "Retail Sales Prediction - Group 12" / "app.py"),
               run_name="__main__")
