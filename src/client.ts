import { PublicClient, testnet } from "@lens-protocol/client";
import { url } from "@lens-protocol/types";
import { clientCookieStorage } from "./storage";

const lensTestnetEnvironment = {
  ...testnet,
  // Avoid 301 redirect from .dev -> .xyz that breaks Lens SDK requests in browser.
  backend: url(process.env.NEXT_PUBLIC_LENS_API_URL || "https://api.testnet.lens.xyz/graphql"),
};

export const client = PublicClient.create({
  // Use direct Lens testnet API endpoint to prevent redirect-related request failures.
  environment: lensTestnetEnvironment,
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
