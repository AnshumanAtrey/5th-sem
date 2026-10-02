"""What runs inside the Kaggle session (run_on_kaggle.py prepends PACKED, NOTEBOOK, RESULTS and PANDOC).

The whole assignment runs here, in a fresh Python 3.12 env pinned to the Streamlit Cloud deploy versions
(requirements.txt), so the model the notebook saves is the exact one the live app can load.
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
    # a clean python with the deploy versions, plus pandoc, chromium and fonts for the report
    sh("pip install -q uv && uv venv -q /tmp/env --python 3.12")
    sh("uv pip install -q --python /tmp/env/bin/python -r requirements.txt -r requirements-report.txt")
    sh("apt-get update -qq && apt-get install -y -qq fonts-liberation libpango-1.0-0 libpangoft2-1.0-0 > /dev/null")
    sh("playwright install --with-deps chromium > /dev/null")
    sh(f"curl -sL https://github.com/jgm/pandoc/releases/download/{PANDOC}/pandoc-{PANDOC}-linux-amd64.tar.gz"  # noqa: F821
       f" | tar xz -C /tmp && ln -sf /tmp/pandoc-{PANDOC}/bin/pandoc /tmp/env/bin/pandoc")  # noqa: F821
    sh("python -m ipykernel install --user --name walrus-env > /dev/null")

    # 1. the notebook: trains the model, saves figures/ and models/
    sh("jupyter nbconvert --to notebook --execute --inplace --ExecutePreprocessor.timeout=3600"
       f" --ExecutePreprocessor.kernel_name=walrus-env {NOTEBOOK}")  # noqa: F821
    plain_kernelspec(NOTEBOOK)  # noqa: F821
    # 2. the app tests, against the model the notebook just saved
    sh("mkdir -p reports && python -m pytest -q tests --junitxml=reports/tests.xml")
    # 3. the app running for real, driven and screenshotted like a user would
    app = subprocess.Popen(["streamlit", "run", "app.py", "--server.port", "8765", "--server.headless", "true"],
                           env=ENV)
    try:
        sh("python report/app_screenshots.py")
    finally:
        app.terminate()
    # 4. the report, built from the executed notebook
    sh("python report/build_report.py")
finally:
    for name in RESULTS:  # noqa: F821
        src = JOB / name
        if src.is_dir():
            shutil.copytree(src, OUT / name, dirs_exist_ok=True)
        elif src.exists():
            shutil.copy(src, OUT / name)
