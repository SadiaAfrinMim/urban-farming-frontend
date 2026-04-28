import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed rewrites since we're now using direct API calls to production backend
  // via NEXT_PUBLIC_API_URL environment variable
};

export default nextConfig;
