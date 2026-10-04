// Where the site lives. "" for a normal host; "/app/static" inside Streamlit, which serves the built site from its
// static folder (see flow-sentinel/streamlit_app.py at the repo root). Next adds it to links on its own; files we
// fetch or link by hand go through asset().
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

export const asset = (path: string) => `${BASE}${path}`
