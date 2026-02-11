"use client";

import { useEffect, useState } from "react";
import { Account, evmAddress } from "@lens-protocol/client";
import {
  fetchAccount as fetchLensAccount,
  fetchAccounts as fetchLensAccounts,
} from "@lens-protocol/client/actions";
import { getPublicClient } from "@/client";

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
  const [data, setData] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const query = options.filter.searchBy.localNameQuery.trim();

  useEffect(() => {
    let cancelled = false;

    const loadAccounts = async () => {
      if (!query) {
        setData([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const client = getPublicClient();
        const result = await fetchLensAccounts(client, {
          filter: {
            searchBy: {
              localNameQuery: query,
            },
          },
        });

        if (cancelled) {
          return;
        }

        if (result.isErr()) {
          console.error("Failed to fetch Lens accounts:", result.error);
          setData([]);
          return;
        }

        setData(result.value.items);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch Lens accounts:", error);
          setData([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadAccounts();

    return () => {
      cancelled = true;
    };
  }, [query]);

  return { data, loading };
};

const fetchAccount = async (address: string) => {
  try {
    const normalizedAddress = address.trim().toLowerCase();
    const client = getPublicClient();
    const result = await fetchLensAccount(client, {
      address: evmAddress(normalizedAddress),
    });

    if (result.isErr()) {
      return null;
    }

    return result.value;
  } catch (error) {
    console.error("Failed to fetch Lens account:", error);
    return null;
  }
};

export { fetchAccount };

export default useSearchAccounts;
