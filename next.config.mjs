/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "pdfjs-dist"],
    // Ensure pdf.worker.mjs and related assets exist in the serverless bundle (Vercel)
    outputFileTracingIncludes: {
      "/api/upload": ["./node_modules/pdfjs-dist/**/*"],
    },
  },
  // Avoid stale webpack chunks on Windows (missing ./NNN.js, 404 on _next/static)
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
