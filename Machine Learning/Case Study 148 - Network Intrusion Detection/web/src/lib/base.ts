// Where the site lives. "" for a normal host. For Streamlit Community Cloud (which runs the app under /~/+/ and
// serves the built site from its static folder) it is built as "/__stbase__" and scripts/streamlit_bundle.ts swaps
// in "/~/+/app/static" (see flow-sentinel/streamlit_app.py at the repo root). Next adds it to links on its own; files we
// fetch or link by hand go through asset().
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export const asset = (path: string) => `${BASE}${path}`
