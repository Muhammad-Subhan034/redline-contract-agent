import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfjs-dist (via pdf-parse) dynamically resolves a worker module path at
  // runtime — bundling it breaks that resolution, so run it unbundled from
  // node_modules on the server instead.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
