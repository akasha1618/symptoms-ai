/** @type {import('next').NextConfig} */
const nextConfig = {
  // PWA configuration will be handled by next-pwa plugin
  // but with a simpler setup to avoid build issues
  experimental: {
    // Enable any experimental features if needed
  },
  // Ensure proper output for Netlify
  output: 'export',
};

export default nextConfig;
