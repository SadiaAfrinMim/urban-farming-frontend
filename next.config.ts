import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Auth Routes
      { source: '/api/auth/:path*', destination: 'http://localhost:5000/api/v1/auth/:path*' },
      // User Routes
      { source: '/api/user/:path*', destination: 'http://localhost:5000/api/v1/user/:path*' },
      // Produce / Marketplace Routes
      { source: '/api/produces/:path*', destination: 'http://localhost:5000/api/v1/produces/:path*' },
      { source: '/api/marketplace/:path*', destination: 'http://localhost:5000/api/v1/marketplace/:path*' },
      // Rental / Spaces Routes
      { source: '/api/rental/:path*', destination: 'http://localhost:5000/api/v1/rental/:path*' },
      { source: '/api/spaces/:path*', destination: 'http://localhost:5000/api/v1/spaces/:path*' },
      // Order Routes
      { source: '/api/orders/:path*', destination: 'http://localhost:5000/api/v1/orders/:path*' },
      // Community Routes
      { source: '/api/community/:path*', destination: 'http://localhost:5000/api/v1/community/:path*' },
      // Sustainability Routes
      { source: '/api/sustainability/:path*', destination: 'http://localhost:5000/api/v1/sustainability/:path*' },
      // Catch all other API routes
      { source: '/api/:path*', destination: 'http://localhost:5000/api/v1/:path*' },
    ];
  },
};

export default nextConfig;
