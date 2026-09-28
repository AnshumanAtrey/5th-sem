"""Drive the running app like a user and save screenshots for the report.

    streamlit run app.py --server.port 8765        # in one terminal
    python report/screenshots.py                    # in another
"""
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

OUT = Path(__file__).resolve().parents[1] / "screenshots"
URL = "http://localhost:8765"


def settle(page):
    page.wait_for_timeout(600)
    page.wait_for_function("() => !document.querySelector('[data-testid=\"stStatusWidget\"]')", timeout=60000)
    page.wait_for_timeout(900)


def choose(page, index, text):
    page.locator('[data-testid="stSelectbox"]').nth(index).click()
    page.keyboard.type(text)
    page.wait_for_timeout(300)
    page.keyboard.press("Enter")
    settle(page)


def shot(page, name):
    page.locator(".hero h1").first.click()  # drop keyboard focus so no input shows a highlight ring
    page.wait_for_timeout(400)
    page.screenshot(path=str(OUT / name), full_page=True)
    print("saved", name)


def main():
    OUT.mkdir(exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 1500}, device_scale_factor=1.5)
        for _ in range(60):
            try:
                page.goto(URL)
                break
            except Exception:
                time.sleep(1)
        page.get_by_text("Forecast weekly sales").first.wait_for(timeout=90000)
        settle(page)
        shot(page, "01_next_week_forecast.png")

        choose(page, 0, "Store 20 ·"); choose(page, 1, "Dept 92"); choose(page, 2, "2012-09-07")
        shot(page, "02_unseen_test_week_labor_day.png")

        choose(page, 0, "Store 35 ·"); choose(page, 1, "Dept 72"); choose(page, 2, "2011-11-25")
        shot(page, "03_thanksgiving_with_warnings.png")

        choose(page, 0, "Store 1 ·"); choose(page, 1, "Dept 1"); choose(page, 2, "2012-10-26")
        for label, value in (("Total markdown (promotion) that week, $", "50000"), ("Last week's sales, $", "40000")):
            box = page.get_by_role("spinbutton", name=label)
            box.fill(value)
            box.press("Enter")
            settle(page)
        shot(page, "04_what_if_inputs.png")

        choose(page, 0, "Store 16 ·"); choose(page, 1, "Dept 83"); choose(page, 2, "2011-09-02")
        page.get_by_text("Not enough history").first.wait_for()
        shot(page, "05_input_validation_short_history.png")
        browser.close()


if __name__ == "__main__":
    main()
