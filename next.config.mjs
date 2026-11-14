/** @type {import('next').NextConfig} */
const backendTarget = process.env.BACKEND_INTERNAL_URL || 'http://localhost:5001';

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendTarget}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
