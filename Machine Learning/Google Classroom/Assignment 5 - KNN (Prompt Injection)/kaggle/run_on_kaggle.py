"""Run the notebook on a free Kaggle T4 GPU and pull the executed copy back into this folder.

The embedding model is too heavy for an 8 GB laptop, so the notebook runs on Kaggle with the
dataset attached. Needs the kaggle CLI logged in (~/.kaggle). From the assignment folder:

    python3 kaggle/run_on_kaggle.py
"""
import base64
import json
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NOTEBOOK = ROOT / "knn_prompt_injection.ipynb"
KERNEL = "anshumanatrey/gc-a5-knn-prompt-injection"          # a private kaggle notebook
DATASET = "chuneeb/ai-agent-cybersecurity-dataset-2026"

# kaggle runs a single python file, so the notebook travels inside it and runs there with nbconvert
RUNNER = """import base64, pathlib, subprocess
pathlib.Path({name!r}).write_bytes(base64.b64decode({packed!r}))
subprocess.run(["jupyter", "nbconvert", "--to", "notebook", "--execute", "--inplace",
                "--ExecutePreprocessor.timeout=3600", {name!r}], check=True)
"""


def kaggle(*args):
    return subprocess.run(["kaggle", *args], check=True, capture_output=True, text=True).stdout


def push():
    with tempfile.TemporaryDirectory() as tmp:
        job = Path(tmp)
        packed = base64.b64encode(NOTEBOOK.read_bytes()).decode()
        (job / "runner.py").write_text(RUNNER.format(name=NOTEBOOK.name, packed=packed))
        (job / "kernel-metadata.json").write_text(json.dumps({
            "id": KERNEL, "title": KERNEL.split("/")[1].replace("-", " "),
            "code_file": "runner.py", "language": "python", "kernel_type": "script",
            "is_private": True, "enable_gpu": True, "enable_internet": True,
            "dataset_sources": [DATASET], "competition_sources": [],
            "kernel_sources": [], "model_sources": []}, indent=1))
        print(kaggle("kernels", "push", "-p", str(job)).strip().splitlines()[-1])


def wait():
    while True:                                               # a run takes a few minutes
        time.sleep(30)
        status = kaggle("kernels", "status", KERNEL).strip().splitlines()[-1]
        if any(word in status.lower() for word in ("complete", "error", "cancel")):
            print(status)
            return "complete" in status.lower()


def pull(ok):
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp)
        kaggle("kernels", "output", KERNEL, "-p", str(out), "--force")
        if not ok:
            for log in out.glob("*.log"):                     # the log is a json list of output chunks
                print("".join(chunk["data"] for chunk in json.loads(log.read_text())[-25:]))
            sys.exit("the kaggle run failed, nothing was copied back")
        shutil.copy(out / NOTEBOOK.name, NOTEBOOK)
        (ROOT / "figures").mkdir(exist_ok=True)
        for png in out.rglob("figures/*.png"):
            shutil.copy(png, ROOT / "figures" / png.name)
    print(f"pulled the executed {NOTEBOOK.name} and figures/ back")


if __name__ == "__main__":
    push()
    pull(wait())
