import { PHASE_DEVELOPMENT_SERVER } from 'next/constants.js';

/** @param {string} phase */
const nextConfig = (phase) => ({
  // Keep the dev cache isolated so `next build` cannot corrupt a running dev server.
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next',
  images: {
    remotePatterns: [
      // Legacy product records contain HTTP Cloudinary URLs. Next's image
      // optimizer fetches them server-side and serves the optimized asset locally.
      {
        protocol: 'http',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
});

export default nextConfig;
