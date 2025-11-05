/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack configuration (empty to use webpack)
  turbopack: {},
  
  // Force webpack instead of Turbopack for compatibility
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Add any server-side webpack configurations here
      config.externals.push({
        'pg-native': 'commonjs pg-native',
      });
    }
    
    return config;
  },
  
  // Environment variables that should be available in the browser
  // Note: Only add variables that are safe to expose to the client
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },

  // Image optimization settings
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com',
      },
    ],
  },

  // Redirects and rewrites can be added here
  async redirects() {
    return [
      // Example redirect
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // },
    ];
  },

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
