import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle for artifact-based deploys (build once, ship .next/standalone).
  output: "standalone",
};

export default nextConfig;
