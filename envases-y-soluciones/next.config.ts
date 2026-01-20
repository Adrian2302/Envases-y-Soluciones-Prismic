import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.prismic.io",
      },
    ],
    // Use unoptimized for Prismic images since they're already optimized via Imgix
    // This saves bandwidth on Vercel/Next.js image optimization
    unoptimized: true,
    // Define device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [80, 160, 280, 400, 500],
  },
};

export default nextConfig;
