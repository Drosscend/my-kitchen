import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    authInterrupts: true,
  },
  reactCompiler: true,
  cacheComponents: true,
};

export default nextConfig;
