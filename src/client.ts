import { PublicClient, mainnet, testnet } from "@lens-protocol/client";
import { clientCookieStorage, cookieStorage } from "./storage";
import { fragments } from "./fragments";

export const client = PublicClient.create({
  environment: mainnet,
  // environment: process.env.NEXT_PUBLIC_ENVIRONMENT === "development" ? testnet : mainnet,
  fragments,
  storage: clientCookieStorage,
});

export const getPublicClient = () => {
  return client;
};

// export const getBuilderClient = async (address: string, signMessage: (message: string) => Promise<string>) => {
//   if (!address) return null;

//   const authenticated = await client.login({
//     accountManager: {
//       manager: address,
//     },
//     signMessage,
//   });

//   if (authenticated.isErr()) {
//     throw authenticated.error;
//   }

//   return authenticated.value;
// };

export const getLensClient = async () => {
  const resumed = await client.resumeSession();
  if (resumed.isErr()) {
    return client;
  }

  return resumed.value;
};
