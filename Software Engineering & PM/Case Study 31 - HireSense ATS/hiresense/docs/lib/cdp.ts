// Minimal Chrome DevTools Protocol client: drives a headless Edge/Chrome to print HTML to PDF
// (with page-number footers) and to screenshot the running app.
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CANDIDATES = [
  process.env.CHROME_PATH,
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
].filter(Boolean) as string[];

export async function launch() {
  const bin = CANDIDATES.find((p) => Bun.file(p).size > 0);
  if (!bin) throw new Error("No Chromium-based browser found; set CHROME_PATH");
  const port = 9300 + Math.floor(Math.random() * 500);
  const proc = spawn(bin, [
    "--headless=new", `--remote-debugging-port=${port}`, "--no-first-run", "--no-default-browser-check",
    "--allow-file-access-from-files", "--hide-scrollbars", `--user-data-dir=${mkdtempSync(join(tmpdir(), "hs-docs-"))}`, "about:blank",
  ], { stdio: "ignore" });
  let ws = "";
  for (let i = 0; i < 100 && !ws; i++) {
    try {
      const list = (await (await fetch(`http://127.0.0.1:${port}/json/list`)).json()) as { type: string; webSocketDebuggerUrl: string }[];
      ws = list.find((t) => t.type === "page")?.webSocketDebuggerUrl ?? "";
    } catch {}
    if (!ws) await Bun.sleep(100);
  }
  if (!ws) throw new Error("browser did not start");
  const sock = new WebSocket(ws);
  await new Promise((r) => (sock.onopen = r));
  let id = 0;
  const pending = new Map<number, (v: any) => void>();
  sock.onmessage = (e) => {
    const m = JSON.parse(String(e.data));
    if (m.id && pending.has(m.id)) {
      if (m.error) console.error("CDP error", m.error);
      pending.get(m.id)!(m.result);
      pending.delete(m.id);
    }
  };
  const send = (method: string, params: object = {}) =>
    new Promise<any>((resolve) => {
      const n = ++id;
      pending.set(n, resolve);
      sock.send(JSON.stringify({ id: n, method, params }));
    });
  await send("Page.enable");
  await send("Runtime.enable");

  const evaluate = async (expression: string) => (await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }))?.result?.value;
  const goto = async (url: string, readyExpr = "document.readyState === 'complete'", timeout = 30_000) => {
    await send("Page.navigate", { url });
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      if (await evaluate(`(() => { try { return !!(${readyExpr}) } catch { return false } })()`)) return;
      await Bun.sleep(150);
    }
    throw new Error(`timed out waiting for ${url}`);
  };

  return {
    evaluate,
    goto,
    async pdf(url: string, out: string, footer: string) {
      await goto(url, "window.__docReady === true");
      const r = await send("Page.printToPDF", {
        printBackground: true,
        preferCSSPageSize: true,
        displayHeaderFooter: true,
        headerTemplate: "<span></span>",
        footerTemplate: `<div style="width:100%;font:500 7.5px Inter,Helvetica,sans-serif;color:#8a8f98;padding:0 16mm;display:flex;justify-content:space-between"><span>${footer}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
      });
      await Bun.write(out, Buffer.from(r.data, "base64"));
    },
    async screenshot(url: string, out: string, { width = 1440, height = 900, ready, wait = 1500, setup }: { width?: number; height?: number; ready?: string; wait?: number; setup?: string } = {}) {
      await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 2, mobile: false });
      if (setup) {
        await goto(url);
        await evaluate(setup);
      }
      await goto(url, ready ?? "document.readyState === 'complete'");
      await Bun.sleep(wait);
      const r = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
      await Bun.write(out, Buffer.from(r.data, "base64"));
    },
    async close() {
      sock.close();
      proc.kill();
    },
  };
}
