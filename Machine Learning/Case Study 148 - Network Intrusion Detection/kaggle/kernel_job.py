"""What runs inside the Kaggle session (run_on_kaggle.py prepends PACKED, NOTEBOOK, RESULTS and MODE).

The heavy part runs here, in a fresh Python 3.12 env pinned to requirements.txt: the notebook reads all 169 CSV
parts and trains the models. The web export, app screenshots, report and deck are light and run locally after.
"""
import base64
import io
import json
import os
import shutil
import subprocess
import tarfile
import time
from pathlib import Path

JOB, OUT = Path("/tmp/job"), Path("/kaggle/working")
tarfile.open(fileobj=io.BytesIO(base64.b64decode(PACKED))).extractall(JOB)  # noqa: F821 (prepended)
os.chdir(JOB)
ENV = {**os.environ, "PATH": "/tmp/env/bin:" + os.environ["PATH"]}


def sh(cmd):
    print(f"\n$ {cmd}", flush=True)
    start = time.time()
    subprocess.run(cmd, shell=True, check=True, env=ENV)
    print(f"  done in {time.time() - start:.0f} s", flush=True)


def plain_kernelspec(path):
    """nbconvert stamps the temporary kernel name into the notebook, put the standard one back."""
    nb = json.loads(Path(path).read_text())
    nb["metadata"]["kernelspec"] = {"display_name": "Python 3", "language": "python", "name": "python3"}
    Path(path).write_text(json.dumps(nb, indent=1, ensure_ascii=False) + "\n")


try:
    # a clean python with the pinned versions
    sh("pip install -q uv && uv venv -q /tmp/env --python 3.12")
    sh("uv pip install -q --python /tmp/env/bin/python -r requirements.txt ipykernel nbconvert==7.17.1 pytest")
    sh("python -m ipykernel install --user --name cs148-env > /dev/null")

    if MODE == "eda":  # noqa: F821 (prepended): only the Explore tab's numbers
        sh("python kaggle/eda_export.py")
        raise SystemExit(0)
    # 1. the notebook: samples the data, trains all 11 models, saves figures/, models/, reports/ and data/
    sh("jupyter nbconvert --to notebook --execute --inplace --ExecutePreprocessor.timeout=3600"
       f" --ExecutePreprocessor.kernel_name=cs148-env {NOTEBOOK}")  # noqa: F821
    plain_kernelspec(NOTEBOOK)  # noqa: F821
    # 2. the data code's tests
    sh("mkdir -p reports && python -m pytest -q tests --junitxml=reports/tests.xml")
finally:
    for name in RESULTS:  # noqa: F821
        src = JOB / name
        if src.is_dir():
            shutil.copytree(src, OUT / name, dirs_exist_ok=True)
        elif src.exists():
            (OUT / name).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy(src, OUT / name)
