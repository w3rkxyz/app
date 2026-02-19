"use client";

import { useEffect, useState } from "react";
import { Account, evmAddress } from "@lens-protocol/client";
import {
  fetchAccount as fetchLensAccount,
  fetchAccounts as fetchLensAccounts,
  fetchUsernames,
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
    const normalizedInput = address.trim().toLowerCase();
    const caipSegments = normalizedInput.split(":");
    const inferredAddress = caipSegments[caipSegments.length - 1];
    const normalizedAddress =
      inferredAddress.startsWith("0x") && inferredAddress.length === 42
        ? inferredAddress
        : normalizedInput;

    if (!normalizedAddress.startsWith("0x") || normalizedAddress.length !== 42) {
      return null;
    }

    const client = getPublicClient();
    const result = await fetchLensAccount(client, {
      address: evmAddress(normalizedAddress),
    });

    if (result.isOk() && result.value) {
      return result.value;
    }

    const usernamesResult = await fetchUsernames(client, {
      filter: {
        owner: evmAddress(normalizedAddress),
      },
    });

    if (usernamesResult.isErr()) {
      return null;
    }

    const firstUsername = usernamesResult.value.items[0];
    if (!firstUsername) {
      return null;
    }

    if (firstUsername.linkedTo) {
      const linkedAccountResult = await fetchLensAccount(client, {
        address: evmAddress(firstUsername.linkedTo.toLowerCase()),
      });
      if (linkedAccountResult.isOk() && linkedAccountResult.value) {
        return linkedAccountResult.value;
      }
    }

    const byUsernameResult = await fetchLensAccount(client, {
      username: {
        localName: firstUsername.localName,
      },
    });

    if (byUsernameResult.isErr()) {
      return null;
    }

    return byUsernameResult.value;
  } catch (error) {
    console.error("Failed to fetch Lens account:", error);
    return null;
  }
};

export { fetchAccount };

export default useSearchAccounts;
