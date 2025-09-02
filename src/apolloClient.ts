import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

let _client: ApolloClient<any> | null = null;

export function getApolloClient() {
  if (_client) return _client;

  _client = new ApolloClient({
    uri: "https://api.lens.xyz/graphql",
    cache: new InMemoryCache(),
    ssrMode: typeof window === "undefined",
  });

  return _client;
}
