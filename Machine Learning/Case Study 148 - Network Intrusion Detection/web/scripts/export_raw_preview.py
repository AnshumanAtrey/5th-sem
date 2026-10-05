"""Export a preview of the raw dataset for the Data tab: the first 20 rows of the first CSV file, exactly as published,
and the list of every file in the dataset with its size.

Needs the kaggle CLI logged in. Downloads the first CSV part (about 15 MB zipped) into a cache folder once.

    python web/scripts/export_raw_preview.py
"""
import csv
import io
import json
import subprocess
import zipfile
from pathlib import Path

WEB = Path(__file__).resolve().parents[1]
CACHE = WEB.parent / "data" / "sample"                 # gitignored
DATASET = "madhavmalhotra/unb-cic-iot-dataset"
FIRST = "wataiData/csv/CICIoT2023/part-00000-363d1ba3-8ab5-4f96-bc25-4d5862db7cb9-c000.csv"
ROWS = 20


def kaggle(*args):
    return subprocess.run(["kaggle", *args], check=True, capture_output=True, text=True).stdout


local = CACHE / Path(FIRST).name
if not local.exists():
    CACHE.mkdir(parents=True, exist_ok=True)
    kaggle("datasets", "download", DATASET, "-f", FIRST, "-p", str(CACHE))
    for z in CACHE.glob("*.zip"):
        zipfile.ZipFile(z).extractall(CACHE)
        z.unlink()

with local.open(newline="") as f:
    reader = csv.reader(f)
    columns = next(reader)
    head = [next(reader) for _ in range(ROWS)]
    total = ROWS + sum(1 for _ in reader)

listing = kaggle("datasets", "files", DATASET, "--csv", "--page-size", "500")
files = [{"name": r["name"].removeprefix("wataiData/"), "size": int(r["size"])}
         for r in csv.DictReader(line for line in io.StringIO(listing) if not line.startswith("Warning"))]
assert sum(f["name"].endswith(".csv") and "CICIoT2023/part-" in f["name"] for f in files) == 169

preview = {"file": Path(FIRST).name, "rows": total, "columns": columns, "head": head, "files": files,
           "kaggle": f"https://www.kaggle.com/datasets/{DATASET}",
           "original": "https://www.unb.ca/cic/datasets/iotdataset-2023.html",
           "paper": "https://pmc.ncbi.nlm.nih.gov/articles/PMC10346235/"}
(WEB / "src" / "data" / "raw.json").write_text(json.dumps(preview, indent=1))
with (WEB / "public" / "raw_first_20_rows.csv").open("w", newline="") as f:
    csv.writer(f).writerows([columns, *head])
print(f"{preview['file']}: {total:,} rows × {len(columns)} columns; first {ROWS} rows saved; {len(files)} files listed")
