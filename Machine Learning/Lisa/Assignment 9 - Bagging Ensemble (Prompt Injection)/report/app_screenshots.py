"""Drive the running app like a user and save screenshots for the report (kaggle/kernel_job.py starts the app).

    streamlit run app.py --server.port 8765 --server.headless true     # in one terminal
    python report/app_screenshots.py                                   # in another
"""
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parents[1] / "screenshots" / "app"
URL = "http://localhost:8765"


def settle(page):
    page.wait_for_timeout(600)
    page.wait_for_function("() => !document.querySelector('[data-testid=\"stStatusWidget\"]')", timeout=60000)
    page.wait_for_timeout(900)


def ask(page, prompt):
    box = page.get_by_label("Prompt to check")
    box.fill(prompt)
    box.press("Control+Enter")  # a text area is applied on ctrl+enter (or when it loses focus)
    settle(page)


def example(page, label):
    page.locator('[data-testid="stSelectbox"]').first.click()
    page.get_by_role("option", name=label, exact=True).click()
    settle(page)


def threshold(page, value):
    slider = page.get_by_role("slider")
    slider.focus()
    page.keyboard.press("Home")                 # 5%
    for _ in range((value - 5) // 5):
        page.keyboard.press("ArrowRight")       # +5% each
    settle(page)


def shot(page, name, height=None):
    page.locator(".hero h1").first.click()     # drop keyboard focus so nothing shows a highlight ring
    page.wait_for_timeout(400)
    if height is None:   # streamlit scrolls inside its own container, so full_page alone stops at the window
        height = page.evaluate("() => Math.max(...['[data-testid=stMain]', '[data-testid=stAppViewContainer]', "
                               "'section.main', 'body'].map(s => document.querySelector(s)).filter(Boolean)"
                               ".map(e => e.scrollHeight))")
    page.set_viewport_size({"width": 1440, "height": max(int(height), 400)})   # grow the window to fit it all
    page.wait_for_timeout(800)
    page.screenshot(path=str(OUT / name))
    page.set_viewport_size({"width": 1440, "height": 900})
    print("saved", name, f"({int(height)} px tall)")


def main(borderline, strict):
    OUT.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900}, device_scale_factor=1.5)
        for _ in range(60):
            try:
                page.goto(URL)
                break
            except Exception:
                time.sleep(1)
        page.get_by_text("Walrus Prompt Shield").first.wait_for(timeout=90000)
        settle(page)
        example(page, "attack · blunt override")
        shot(page, "01-blunt-attack.png")
        example(page, "attack · fake authority (no keywords)")
        shot(page, "02-sneaky-attack-no-keywords.png")
        example(page, "normal · TCP vs UDP")
        shot(page, "03-normal-prompt.png")
        example(page, borderline)
        threshold(page, strict)
        shot(page, "04-strict-threshold.png")
        threshold(page, 50)
        ask(page, "!!! ??? 12345 ### 678")
        shot(page, "05-input-check-no-words.png", height=640)
        browser.close()


if __name__ == "__main__":
    import joblib
    bundle = joblib.load(Path(__file__).resolve().parents[1] / "models" / "bagging_bundle.joblib")
    examples = bundle["examples"]
    share = dict(zip(examples, bundle["pipeline"].predict_proba(list(examples.values()))[:, 1]))
    borderline = min(examples, key=lambda k: abs(share[k] - 0.5))   # the one the crowd is most split on
    main(borderline, strict=max(5, int(share[borderline] * 100) // 5 * 5))  # just low enough to flag it
