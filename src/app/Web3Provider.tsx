"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { chains } from "@lens-chain/sdk/viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { LensConfig, development, LensProvider, production } from "@lens-protocol/react-web";
import { bindings as wagmiBindings } from "@lens-protocol/wagmi";
import { ReactNode } from "react";

const config = createConfig(
  getDefaultConfig({
    chains: [chains.mainnet, chains.testnet],
    transports: {
      [chains.mainnet.id]: http(chains.mainnet.rpcUrls.default.http[0]!),
      [chains.testnet.id]: http(chains.testnet.rpcUrls.default.http[0]!),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
    appName: "w3rk",
    appDescription: "A socialfi freelance app",
    appUrl: "http://localhost:3000",
    appIcon: "http://localhost:3000/icon.png",
  })
);

const queryClient = new QueryClient();

// Lens Protocol config
const lensConfig: LensConfig = {
  bindings: wagmiBindings(config),
  environment: development,
};

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <LensProvider config={lensConfig}>{children}</LensProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
