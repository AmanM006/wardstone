import type { NextConfig } from "next";

// Fallback to the live Cloud Run backend if not specified
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://wardstone-ap2-900526798908.us-central1.run.app';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
