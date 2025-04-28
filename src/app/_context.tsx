"use client";

import React, { ReactNode } from "react";
import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider, createConfig, http } from "wagmi";
import { polygon, polygonAmoy, arbitrumSepolia, polygonMumbai } from "wagmi/chains";
import { LensConfig, development, LensProvider, production } from "@lens-protocol/react-web";
import { bindings as wagmiBindings } from "@lens-protocol/wagmi";
import { createAppKit } from "@reown/appkit/react";
// import { arbitrumSepolia, polygonAmoy, polygon } from "@reown/appkit/networks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  walletConnect,
  coinbaseWallet,
  injected,
  MetaMaskParameters,
  metaMask,
  safe,
} from "wagmi/connectors";

// Rainbow kit config
const config = getDefaultConfig({
  appName: "w3rk",
  projectId: "d00d9905ccaf8c54cb116e944ab4d383",
  chains: [polygonAmoy, arbitrumSepolia, polygon],
  ssr: true,
  transports: {
    [polygonAmoy.id]: http(),
    [arbitrumSepolia.id]: http(),
    [polygon.id]: http(),
  },
});

// Setup queryClient
const queryClient = new QueryClient();

// const projectId = process.env.NEXT_PUBLIC_APPKIT_ID;

// 2. Create a metadata object - optional
const metadata = {
  name: "w3rk",
  description: "w3rk testnet",
  url: "https://testnet.w3rk.xyz/", // origin must match your domain & subdomain
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};

// 3. Set the networks
// const networks = [polygonAmoy, arbitrumSepolia, polygon];

// 4. Create Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks: [polygonAmoy, arbitrumSepolia, polygon],
  projectId: process.env.NEXT_PUBLIC_APPKIT_ID as string,
  ssr: true,

  transports: {
    [polygonAmoy.id]: http(),
    [arbitrumSepolia.id]: http(),
    [polygon.id]: http(),
  },
});

// 5. Create modal
createAppKit({
  adapters: [wagmiAdapter],
  networks: [polygonAmoy, arbitrumSepolia, polygon],
  defaultNetwork: polygonAmoy,
  projectId: process.env.NEXT_PUBLIC_APPKIT_ID as string,
  metadata,
  themeMode: "light",
  features: {
    email: true, // default to true
    socials: ["google"],
    emailShowWallets: true, // default to true
  },
});

// Lens Protocol config
const lensConfig: LensConfig = {
  bindings: wagmiBindings(wagmiAdapter.wagmiConfig),
  environment: production,
};

// Rainbow kit and Lens Context wrapper
export default function ContextProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <LensProvider config={lensConfig}>{children}</LensProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
