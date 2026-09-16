import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;

const nextConfig: NextConfig = {
  async rewrites() {
    if (backendUrl && backendUrl.startsWith('http')) {
      const cleanBackend = backendUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
      return [
        {
          source: '/api/:path*',
          destination: `${cleanBackend}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
