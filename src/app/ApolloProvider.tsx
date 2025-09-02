"use client";

import { ApolloProvider } from "@apollo/client";
import { getApolloClient } from "@/apolloClient";

export default function ClientApolloProvider({ children }: { children: React.ReactNode }) {
  const client = getApolloClient();
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
