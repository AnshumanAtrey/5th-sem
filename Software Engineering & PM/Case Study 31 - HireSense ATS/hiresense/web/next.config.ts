import type { NextConfig } from "next";

const API = process.env.API_URL ?? "http://localhost:8787";

const nextConfig: NextConfig = {
  // Browser calls go to /api/* on the same origin and are proxied to the Bun API.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API}/api/:path*` }];
  },
};

export default nextConfig;
