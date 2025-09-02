"use client";

import { useMemo, useRef } from "react";
import { WagmiProvider, createConfig, http } from "wagmi";
import { chains } from "@lens-chain/sdk/viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import ClientApolloProvider from "@/app/ApolloProvider";
import { LensProvider } from "@lens-protocol/react";
import { XMTPProvider } from "@/app/XMTPContext";
import { getPublicClient } from "@/client";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

export default function Web3Provider({ children }: { children: React.ReactNode }) {
  const wagmiConfig = useMemo(
    () =>
      createConfig(
        getDefaultConfig({
          chains: [chains.mainnet],
          transports: {
            [chains.mainnet.id]: http(),
            [chains.testnet.id]: http(),
          },
          walletConnectProjectId: projectId,
          appName: "w3rk",
          appDescription: "A socialfi freelance app",
          appUrl: "http://localhost:3000",
          appIcon: "http://localhost:3000/icon.png",
        })
      ),
    []
  );

  const qcRef = useRef<QueryClient | null>(null);
  if (!qcRef.current) {
    qcRef.current = new QueryClient();
  }

  const publicClient = getPublicClient();

  return (
    <ClientApolloProvider>
      <QueryClientProvider client={qcRef.current!}>
        <WagmiProvider config={wagmiConfig}>
          <ConnectKitProvider>
            <LensProvider client={publicClient}>
              <XMTPProvider>{children}</XMTPProvider>
            </LensProvider>
          </ConnectKitProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </ClientApolloProvider>
  );
}
