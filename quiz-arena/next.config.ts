import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enforce canonical paths — no trailing slash variants
  trailingSlash: false,
};

export default nextConfig;
