"use client";

import React, { ReactNode } from "react";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider, createConfig, http } from "wagmi";
import { polygon, polygonAmoy } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import {
  LensConfig,
  development,
  LensProvider,
  production,
} from "@lens-protocol/react-web";
import { bindings as wagmiBindings } from "@lens-protocol/wagmi";

// Rainbow kit config
const config = getDefaultConfig({
  appName: "w3rk",
  projectId: "d00d9905ccaf8c54cb116e944ab4d383",
  chains: [polygonAmoy, polygon],
  ssr: true,
  transports: {
    [polygonAmoy.id]: http(),
    [polygon.id]: http(),
  },
});

// Setup queryClient
const queryClient = new QueryClient();

// Lens Protocol config
const lensConfig: LensConfig = {
  bindings: wagmiBindings(config),
  environment: production,
};

// Rainbow kit and Lens Context wrapper
export function ContextProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <LensProvider config={lensConfig}>{children}</LensProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
