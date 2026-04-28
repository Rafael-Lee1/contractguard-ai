/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  // Ensure server listens on 0.0.0.0 for external access
  serverRuntimeConfig: {
    // Only available on the server side
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
  },
};

module.exports = nextConfig;