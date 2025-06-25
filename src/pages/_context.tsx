"use client";

import React, { ReactNode } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { polygon, polygonAmoy, arbitrumSepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  LensProvider,
  LensConfig,
  development,
} from "@lens-protocol/react-web";
import { bindings as wagmiBindings } from "@lens-protocol/wagmi";
import { getDefaultConfig, ConnectKitProvider } from "connectkit";

// ✅ Setup wagmi config via ConnectKit
const config = createConfig(
  getDefaultConfig({
    appName: "w3rk",
    walletConnectProjectId: "4d31c03c17eb16d3a35b5703a02ca492",
    chains: [polygonAmoy, arbitrumSepolia, polygon],
    ssr: true,
    transports: {
      [polygonAmoy.id]: http(),
      [arbitrumSepolia.id]: http(),
      [polygon.id]: http(),
    },
    appUrl: "https://example.com",
    appDescription: "ConnectKit Example",
    appIcon: "https://avatars.githubusercontent.com/u/179229932",
  }) as any
);

// ✅ Lens config
const lensConfig: LensConfig = {
  bindings: wagmiBindings(config),
  environment: development,
};

// ✅ Query Client
const queryClient = new QueryClient();

// ✅ Final wrapper
export default function ContextProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <LensProvider config={lensConfig}>{children}</LensProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
