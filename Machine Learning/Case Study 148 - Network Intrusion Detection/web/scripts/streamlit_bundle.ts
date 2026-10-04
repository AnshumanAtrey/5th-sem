// Copy the static build into flow-sentinel/static/ for the Streamlit Community Cloud host.
// Cloud runs the app under /~/+/, so the site must live at /~/+/app/static. Next.js rejects "+" in basePath, so the
// build uses the placeholder base path /__stbase__ and this swaps it in every built text file.
import { cpSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const PLACEHOLDER = "/__stbase__"
const REAL = "/~/+/app/static"
const DEST = join(import.meta.dir, "..", "..", "..", "..", "flow-sentinel", "static")
const TEXT = /\.(html|txt|js|css|json|map)$/

rmSync(DEST, { recursive: true, force: true })
cpSync(join(import.meta.dir, "..", "out"), DEST, { recursive: true })

let files = 0
const walk = (dir: string) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path)
    else if (TEXT.test(name) && name !== "model.json") {
      const text = readFileSync(path, "utf8")
      if (text.includes(PLACEHOLDER)) {
        writeFileSync(path, text.replaceAll(PLACEHOLDER, REAL))
        files++
      }
    }
  }
}
walk(DEST)
const left = (function count(dir: string): number {
  return readdirSync(dir).reduce((n, name) => {
    const path = join(dir, name)
    return n + (statSync(path).isDirectory() ? count(path) : TEXT.test(name) && readFileSync(path, "utf8").includes("__stbase__") ? 1 : 0)
  }, 0)
})(DEST)
if (left) throw new Error(`${left} file(s) still mention the placeholder`)
console.log(`flow-sentinel/static: base path set to ${REAL} in ${files} files`)
