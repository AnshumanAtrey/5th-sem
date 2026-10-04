"""Build the Case Study 148 report (PDF + Word) straight from the executed notebook.

Each step in the report is: the explanation (markdown cell), the code (code cell), then a
screenshot of that cell's output exactly as Jupyter renders it. Nothing here runs on the laptop:
kaggle/run_on_kaggle.py runs this as the last step of the Kaggle session, after the notebook,
the app tests and the app screenshots (pandoc, weasyprint and chromium get installed there).

    python3 kaggle/run_on_kaggle.py        # the whole loop on kaggle, pulls everything back
"""
import os
import re
import subprocess
import tempfile
from pathlib import Path

import nbformat
from nbconvert import HTMLExporter
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
NOTEBOOK = ROOT / "intrusion_detection.ipynb"
SHOTS = ROOT / "screenshots"
CSS = ROOT / "report" / "report.css"
WORD_STYLES = ROOT / "report" / "reference.docx"   # pandoc's Word template, restyled to match the PDF
REPORT = ROOT / "Case-Study-148-Network-Intrusion-Detection-Report"          # .pdf and .docx get added
TITLE = "Case Study 148: Network Intrusion Detection Using Machine Learning"


def shot_names(nb):
    """Name each output screenshot after its section, e.g. 05-choosing-k.png (-2 for a second cell)."""
    names, section, used = {}, "00-intro", {}
    for i, cell in enumerate(nb.cells):
        heading = re.search(r"^## (\d+)\. ([^(\n]+)", cell.source, re.M) if cell.cell_type == "markdown" else None
        if heading:
            words = re.sub(r"[^a-z0-9]+", "-", heading.group(2).lower()).strip("-")
            section = f"{int(heading.group(1)):02d}-{words}"
        elif cell.cell_type == "code" and cell.outputs:
            used[section] = used.get(section, 0) + 1
            names[i] = f"{section}{'' if used[section] == 1 else '-' + str(used[section])}.png"
    return names


def take_screenshots(nb, names, workdir):
    """Render the notebook the way Jupyter does and screenshot every output area."""
    html, _ = HTMLExporter(template_name="lab").from_notebook_node(nb)
    page_file = workdir / "notebook.html"
    page_file.write_text(html, encoding="utf-8")
    SHOTS.mkdir(exist_ok=True)
    for old in SHOTS.glob("*.png"):
        old.unlink()
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 760, "height": 1000}, device_scale_factor=2)
        page.goto(page_file.as_uri(), wait_until="networkidle")
        # wrap long printed lines at word boundaries, and left-align prose cells in tables
        page.add_style_tag(content=".jp-RenderedText pre { word-break: normal !important;"
                                   " overflow-wrap: break-word !important; }")
        page.evaluate("document.querySelectorAll('.jp-RenderedHTMLCommon td').forEach(td => {"
                      " const t = td.textContent.trim();"
                      " if (t.length > 20 && /[a-z]/i.test(t)) td.style.textAlign = 'left'; })")
        cells = page.locator(".jp-Notebook-cell")
        if cells.count() != len(nb.cells):
            raise SystemExit(f"rendered {cells.count()} cells, notebook has {len(nb.cells)}")
        for i, name in names.items():
            cells.nth(i).locator(".jp-Cell-outputWrapper").screenshot(path=str(SHOTS / name))
        browser.close()
    print(f"saved {len(names)} output screenshots to {SHOTS.relative_to(ROOT)}/")


def report_markdown(nb, names):
    parts = []
    for i, cell in enumerate(nb.cells):
        if cell.cell_type == "markdown":
            parts.append(cell.source)
            continue
        parts.append(f"```python\n{cell.source}\n```")
        if i in names:
            parts.append(f"::: output\n::: {{custom-style=\"Output Label\"}}\noutput:\n:::\n\n"
                         f"![](screenshots/{names[i]}){{width=100%}}\n:::")
    return "\n\n".join(parts) + "\n"


def main():
    nb = nbformat.read(NOTEBOOK, as_version=4)
    if any(c.cell_type == "code" and c.execution_count is None for c in nb.cells):
        raise SystemExit("run the notebook first (kaggle/run_on_kaggle.py), some cells have no outputs")
    names = shot_names(nb)
    with tempfile.TemporaryDirectory() as tmp:
        workdir = Path(tmp)
        take_screenshots(nb, names, workdir)
        source = workdir / "report.md"
        source.write_text(report_markdown(nb, names), encoding="utf-8")

        pandoc = ["pandoc", str(source), "--from", "markdown", "--resource-path", str(ROOT),
                  "--syntax-highlighting", "tango"]
        subprocess.run(pandoc + ["--reference-doc", str(WORD_STYLES), "-o", f"{REPORT}.docx"], check=True)
        page = workdir / "report.html"
        subprocess.run(pandoc + ["--standalone", "--metadata", f"pagetitle={TITLE}",
                                 "--css", CSS.as_uri(), "-o", str(page)], check=True)
        env = {**os.environ, "DYLD_FALLBACK_LIBRARY_PATH": "/opt/homebrew/lib"}  # weasyprint's brew libs
        subprocess.run(["weasyprint", "--base-url", f"{ROOT}/", str(page), f"{REPORT}.pdf"],
                       check=True, env=env)
    for ext in ("pdf", "docx"):
        print("wrote", f"{REPORT.name}.{ext}")


if __name__ == "__main__":
    main()
