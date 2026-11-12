/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@claimlens/engine'],
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
