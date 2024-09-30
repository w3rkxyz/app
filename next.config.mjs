/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  webpack: (config) => {
    // tell webpack to load WASM files as an asset resource
    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
    });
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["@xmtp/user-preferences-bindings-wasm"],
  },
};

export default nextConfig;
