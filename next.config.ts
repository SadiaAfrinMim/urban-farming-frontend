import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Auth Routes
      { source: '/api/v1/auth/:path*', destination: 'http://localhost:5000/api/v1/auth/:path*' },
      // User Routes
      { source: '/api/v1/user/:path*', destination: 'http://localhost:5000/api/v1/user/:path*' },
      // Produce / Marketplace Routes
      { source: '/api/v1/produces/:path*', destination: 'http://localhost:5000/api/v1/produces/:path*' },
      { source: '/api/v1/marketplace/:path*', destination: 'http://localhost:5000/api/v1/marketplace/:path*' },
      // Rental / Spaces Routes
      { source: '/api/v1/rental/:path*', destination: 'http://localhost:5000/api/v1/rental/:path*' },
      { source: '/api/v1/spaces/:path*', destination: 'http://localhost:5000/api/v1/spaces/:path*' },
      // Order Routes
      { source: '/api/v1/orders/:path*', destination: 'http://localhost:5000/api/v1/orders/:path*' },
      // Community Routes
      { source: '/api/v1/community/:path*', destination: 'http://localhost:5000/api/v1/community/:path*' },
      // Sustainability Routes
      { source: '/api/v1/sustainability/:path*', destination: 'http://localhost:5000/api/v1/sustainability/:path*' },
      // Catch all other API routes with v1
      { source: '/api/v1/:path*', destination: 'http://localhost:5000/api/v1/:path*' },
    ];
  },
};

export default nextConfig;
