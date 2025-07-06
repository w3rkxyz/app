"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { chains } from "@lens-chain/sdk/viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { ReactNode } from "react";
import { getPublicClient } from "@/client";
import { LensProvider } from "@lens-protocol/react";

const wagmiConfig = createConfig(
  getDefaultConfig({
    chains: [chains.mainnet],
    transports: {
      [chains.mainnet.id]: http(),
      [chains.testnet.id]: http(),
    },
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID as string,
    appName: "w3rk",
    appDescription: "A socialfi freelance app",
    appUrl: "http://localhost:3000",
    appIcon: "http://localhost:3000/icon.png",
  })
);

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const queryClient = new QueryClient();
  const publicClient = getPublicClient();

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider>
          <LensProvider client={publicClient}>{children}</LensProvider>
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
