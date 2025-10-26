import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "tdcstore.s3.us-east-1.amazonaws.com", // Replace with your S3 bucket name and region endpoint
        pathname: "/**",
      }
    ],
  },
};

export default nextConfig;
