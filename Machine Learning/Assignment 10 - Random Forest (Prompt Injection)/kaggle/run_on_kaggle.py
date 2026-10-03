"""Run this whole assignment on a Kaggle CPU and pull the results back. Nothing heavy runs on the laptop.

One Kaggle session (kaggle/kernel_job.py) does the full loop in a fresh env pinned to the Streamlit Cloud
deploy versions, so the saved model loads in the live app:

1. executes the notebook: trains the model, saves figures/ and models/
2. runs the app tests (tests/, Streamlit AppTest) -> reports/tests.xml
3. starts the app and screenshots it like a user would (report/app_screenshots.py)
4. builds the report from the executed notebook: screenshots/ + PDF + Word (report/build_report.py)

Needs the kaggle CLI logged in (~/.kaggle). From the assignment folder:

    python3 kaggle/run_on_kaggle.py
"""
import base64
import io
import json
import shutil
import subprocess
import sys
import tarfile
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NOTEBOOK = "random_forest_prompt_injection.ipynb"
REPORT = "Assignment-10-Random-Forest-Prompt-Injection-Report"
KERNEL = "anshumanatrey/a10-random-forest-prompt-injection"          # a private kaggle notebook
DATASET = "chuneeb/ai-agent-cybersecurity-dataset-2026"
SOURCES = [NOTEBOOK, "app.py", ".streamlit", "src", "requirements.txt", "requirements-report.txt", "tests", "report"]
RESULTS = [NOTEBOOK, "figures", "models", "screenshots", "reports", f"{REPORT}.pdf", f"{REPORT}.docx"]
PANDOC = "3.9.0.2"                                           # the same pandoc as my earlier reports


def kaggle(*args):
    return subprocess.run(["kaggle", *args], check=True, capture_output=True, text=True).stdout


def packed():
    """The assignment's source files as a base64 tarball (kaggle runs one python file)."""
    buf = io.BytesIO()
    with tarfile.open(fileobj=buf, mode="w:gz") as tar:
        for name in SOURCES:
            tar.add(ROOT / name, arcname=name,
                    filter=lambda t: None if "__pycache__" in t.name or t.name.endswith(".pyc") else t)
    return base64.b64encode(buf.getvalue()).decode()


def push():
    with tempfile.TemporaryDirectory() as tmp:
        job = Path(tmp)
        header = (f"PACKED = {packed()!r}\nNOTEBOOK = {NOTEBOOK!r}\nRESULTS = {RESULTS!r}\n"
                  f"PANDOC = {PANDOC!r}\n")
        (job / "runner.py").write_text(header + (ROOT / "kaggle" / "kernel_job.py").read_text())
        (job / "kernel-metadata.json").write_text(json.dumps({
            "id": KERNEL, "title": KERNEL.split("/")[1].replace("-", " "),
            "code_file": "runner.py", "language": "python", "kernel_type": "script",
            "is_private": True, "enable_gpu": False, "enable_internet": True,
            "dataset_sources": [DATASET], "competition_sources": [],
            "kernel_sources": [], "model_sources": []}, indent=1))
        print(kaggle("kernels", "push", "-p", str(job)).strip().splitlines()[-1])


def wait():
    while True:                                               # a full run takes ~10 minutes
        time.sleep(30)
        status = kaggle("kernels", "status", KERNEL).strip().splitlines()[-1]
        if any(word in status.lower() for word in ("complete", "error", "cancel")):
            print(status)
            return "complete" in status.lower()


def pull(ok):
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp)
        kaggle("kernels", "output", KERNEL, "-p", str(out), "--force")
        for log in out.glob("*.log"):                         # the log is a json list of output chunks
            print("".join(chunk["data"] for chunk in json.loads(log.read_text())[-25:]))
        if not ok:
            sys.exit("the kaggle run failed, nothing was copied back")
        for name in RESULTS:
            src, dest = out / name, ROOT / name
            if src.is_dir():
                shutil.rmtree(dest, ignore_errors=True)       # no stale screenshots from an older run
                shutil.copytree(src, dest)
            elif src.exists():
                shutil.copy(src, dest)
            else:
                print("missing from the kaggle output:", name)
    print("pulled the executed notebook, figures/, models/, screenshots/, reports/ and the report back")


if __name__ == "__main__":
    push()
    pull(wait())
