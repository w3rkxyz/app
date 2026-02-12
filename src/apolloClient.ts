import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

let _client: ApolloClient<any> | null = null;

export function getApolloClient() {
  if (_client) return _client;

  _client = new ApolloClient({
    uri: process.env.NEXT_PUBLIC_LENS_API_URL || "https://api.testnet.lens.xyz/graphql",
    cache: new InMemoryCache(),
    ssrMode: typeof window === "undefined",
  });

  return _client;
}
