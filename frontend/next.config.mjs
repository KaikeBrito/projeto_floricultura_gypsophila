/** @type {import('next').NextConfig} */
const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL ?? "http://localhost:1337";

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "cms.gypsophila.com.br",
        pathname: "/uploads/**",
      },
    ],
  },
  env: {
    NEXT_PUBLIC_STRAPI_URL: strapiUrl,
  },
};

export default nextConfig;
