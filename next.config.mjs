/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  webpack: (config, { dev, isServer }) => {
    if (!dev) {
      config.externals.push("pino-pretty", "lokijs", "encoding");
      config.resolve.fallback = { fs: false, net: false, tls: false };
      // tell webpack to load WASM files as an asset resource
      config.module.rules.push({
        test: /\.wasm$/,
        type: "asset/resource",
      });
    }
    return config;
  },
  serverExternalPackages: ["@xmtp/user-preferences-bindings-wasm"],
  transpilePackages: ["@lens-protocol"],
};

export default nextConfig;
