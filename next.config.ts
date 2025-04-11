import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["ui-avatars.com"],
  },
  output: "standalone", // Required for Docker deployment
};

export default nextConfig;
