import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdfjs-dist (via pdf-parse) dynamically resolves a worker module path at
  // runtime — bundling it breaks that resolution, so run it unbundled from
  // node_modules on the server instead.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  // Vercel's file tracer can't see pdfjs-dist's runtime-resolved worker path,
  // so it gets excluded from the deployed function unless listed explicitly.
  outputFileTracingIncludes: {
    "/api/review": ["./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"],
  },
};

export default nextConfig;
