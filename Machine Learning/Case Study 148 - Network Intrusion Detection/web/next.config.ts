import type { NextConfig } from "next"

// A static site: the model runs in the browser (public/model.json), so `next build` writes plain files to out/
// that any static host can serve.
const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "", // "/app/static" for the Streamlit host (bun run build:streamlit)
  trailingSlash: true, // /scan -> scan/index.html, so any static server (or GitHub Pages) serves every route
  devIndicators: false,
}

export default nextConfig
