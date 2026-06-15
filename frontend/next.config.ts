import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Izinkan fetch ke backend API
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/:path*`,
      },
    ];
  },
  // Typescript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
