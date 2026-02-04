import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // These headers allow the browser to run high-performance WebAssembly
  async headers() {
    return [
      {
        source: '/',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ];
  },
};

export default nextConfig;