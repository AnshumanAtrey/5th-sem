"""Drive the built web app like a user and save screenshots for the report and the deck.

Serves web/out (the static build) on a local port, so build it first:

    python web/scripts/export_model.py && (cd web && bun run build)
    python report/app_screenshots.py
"""
import functools
import tempfile
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import pandas as pd
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "web" / "out"
OUT = ROOT / "screenshots" / "app"


class Quiet(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve():
    handler = functools.partial(Quiet, directory=str(SITE))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, f"http://127.0.0.1:{server.server_port}"


def shot(page, name):
    page.mouse.move(0, 0)
    page.wait_for_timeout(500)
    page.screenshot(path=str(OUT / name), full_page=True)
    print("saved", name)


def example(page, prefix):
    page.get_by_role("combobox", name="Load an example flow").click()
    page.get_by_role("option").filter(has_text=prefix).first.click()
    page.wait_for_timeout(400)


def main():
    if not (SITE / "index.html").exists():
        raise SystemExit("build the site first: cd web && bun run build")
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*.png"):
        old.unlink()
    server, url = serve()
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=1.5)
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))

        page.goto(f"{url}/", wait_until="networkidle")
        page.get_by_text("Most likely").first.wait_for()
        shot(page, "01-detector-attack.png")
        example(page, "Benign")
        shot(page, "02-detector-normal.png")
        example(page, "missed")
        shot(page, "03-detector-missed-attack.png")

        page.goto(f"{url}/scan/", wait_until="networkidle")
        page.get_by_role("button", name="Scan the demo file").click()
        page.get_by_text("Flows checked").wait_for()
        shot(page, "04-scan-demo-file.png")
        with tempfile.TemporaryDirectory() as tmp:
            broken = Path(tmp) / "broken_flows.csv"
            pd.read_csv(ROOT / "data" / "demo_flows.csv").iloc[:5, 3:].to_csv(broken, index=False)
            page.locator("input[type=file]").set_input_files(str(broken))
            page.get_by_text("The file is missing").wait_for()
            shot(page, "05-scan-missing-columns.png")

        page.goto(f"{url}/models/", wait_until="networkidle")
        page.wait_for_timeout(800)
        shot(page, "06-model-comparison.png")
        page.goto(f"{url}/method/", wait_until="networkidle")
        shot(page, "07-data-and-method.png")
        browser.close()
    server.shutdown()
    if errors:
        raise SystemExit(f"the page threw errors: {errors}")


if __name__ == "__main__":
    main()
