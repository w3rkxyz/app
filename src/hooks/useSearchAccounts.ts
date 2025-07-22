import { gql, useQuery } from "@apollo/client";
import { Account, Paginated } from "@lens-protocol/client";
import { apolloClient } from "@/app/Web3Provider";

const SEARCH_ACCOUNTS_QUERY = gql`
  query SearchAccounts($localNameQuery: String!) {
    accounts(
      request: { filter: { searchBy: { localNameQuery: $localNameQuery } }, orderBy: BEST_MATCH }
    ) {
      items {
        address
        username {
          id
          value
          localName
          namespace
          ownedBy
          linkedTo
          timestamp
        }
        metadata {
          id
          name
          bio
          picture
          coverPicture
          attributes {
            key
            value
          }
        }
        owner
        __typename
      }
      pageInfo {
        prev
        next
      }
    }
  }
`;

const ACCOUNTS_AVAILABLE_QUERY = gql`
  query AccountsAvailable($request: AccountsAvailableRequest!) {
    accountsAvailable(request: $request) {
      items {
        ... on AccountOwned {
          account {
            address
            owner
            metadata {
              attributes {
                type
                key
                value
              }
              picture
              name
              id
              bio
            }
            username {
              localName
              ownedBy
              id
            }
          }
        }
      }
    }
  }
`;

type UseSearchAccountsProps = {
  filter: {
    searchBy: {
      localNameQuery: string;
    };
  };
};

type UseMyAccountsResult = {
  data: Account[];
  loading: boolean;
};

const useSearchAccounts = (options: UseSearchAccountsProps): UseMyAccountsResult => {
  const { data, loading, error } = useQuery(SEARCH_ACCOUNTS_QUERY, {
    variables: {
      localNameQuery: options.filter.searchBy.localNameQuery,
    },
    skip: !options.filter.searchBy.localNameQuery, // skip if empty string
  });

  return {
    data: data?.accounts.items ?? [],
    loading,
  };
};

const fetchAccount = async (address: string) => {
  try {
    const { data } = await apolloClient.query({
      query: ACCOUNTS_AVAILABLE_QUERY,
      variables: {
        request: {
          includeOwned: true,
          managedBy: address,
        },
      },
    });

    const firstItem = data?.accountsAvailable?.items?.[0];

    if (firstItem && "account" in firstItem) {
      return firstItem.account;
    }

    return null;
  } catch (error) {
    console.error("GraphQL error:", error);
    return null;
  }
};

export { fetchAccount };

export default useSearchAccounts;
