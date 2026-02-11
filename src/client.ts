import { PublicClient, mainnet, testnet } from "@lens-protocol/client";
import { clientCookieStorage } from "./storage";

export const client = PublicClient.create({
  // Use Lens Protocol testnet environment for Lens Chain Testnet
  environment: testnet,
  storage: clientCookieStorage,
});

export const getPublicClient = () => {
  return client;
};

export const getLensClient = async () => {
  const resumed = await client.resumeSession();
  if (resumed.isErr()) {
    return client;
  }

  return resumed.value;
};
