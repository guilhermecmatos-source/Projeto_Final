/** @type {import('next').NextConfig} */
function getBackendUrl() {
  return (
    process.env.BACKEND_URL ||
    process.env.INTERNAL_API_URL ||
    (process.env.NODE_ENV === "production" ? "http://backend:3001" : "http://127.0.0.1:3001")
  ).replace(/\/$/, "");
}

const backendUrl = getBackendUrl();

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "quickchart.io" },
      { protocol: "https", hostname: "api.qrserver.com" },
    ],
  },
  async rewrites() {
    const target = getBackendUrl();
    return [
      { source: "/api/:path*", destination: `${target}/api/:path*` },
      { source: "/uploads/:path*", destination: `${target}/uploads/:path*` },
    ];
  },
  logging: {
    fetches: { fullUrl: process.env.NODE_ENV === "development" },
  },
  // Enables file polling inside Docker on Windows (WSL2 volume mounts don't
  // propagate inotify events reliably, so webpack must poll for changes).
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,       // check every 1 s
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

if (process.env.NODE_ENV === "development") {
  console.log(`[next] Proxy API → ${backendUrl}`);
}

module.exports = nextConfig;
