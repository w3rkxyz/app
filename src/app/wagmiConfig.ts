"use client";

import { createConfig, http } from "wagmi";
import { chains } from "@lens-chain/sdk/viem";
import { getDefaultConfig } from "connectkit";

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!;

// Persist across Fast Refresh / HMR
const g = globalThis as any;

export const wagmiConfig =
  g.__WAGMI_CONFIG__ ??
  (g.__WAGMI_CONFIG__ = createConfig(
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
  ));
