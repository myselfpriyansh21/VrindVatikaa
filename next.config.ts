import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cloudinary is the sole image host for user-uploaded/media content
    // (gallery, menu items, restaurant photos) — see lib/cloudinary/.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
