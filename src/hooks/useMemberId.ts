import { Utils } from "@xmtp/browser-sdk";
import { useEffect, useRef, useState } from "react";
import { isValidEthereumAddress, isValidInboxId } from "@/utils/strings";
import { useXMTP } from "@/app/XMTPContext";
import type { AccountData } from "@/utils/getLensProfile";

export const useMemberId = () => {
  const { setNotOnNetwork, setInvalidUser } = useXMTP();
  const [loading, setLoading] = useState(false);
  const [memberId, setMemberId] = useState<string>("");
  const [selectedUser, setSelectedUsr] = useState<AccountData | null>(null);
  const [inboxId, setInboxId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const utilsRef = useRef<Utils | null>(null);
  const environment = "dev";

  useEffect(() => {
    const utils = new Utils();
    utilsRef.current = utils;
    return () => {
      utils.close();
    };
  }, []);

  useEffect(() => {
    const checkMemberId = async () => {
      if (!memberId || !selectedUser) {
        setError(null);
        return;
      }

      setInboxId("");
      setError(null);

      if (!isValidEthereumAddress(memberId) && !isValidInboxId(memberId)) {
        setError("Invalid address or inbox ID");
      } else if (isValidEthereumAddress(memberId) && utilsRef.current) {
        setLoading(true);

        try {
          const inboxId = await utilsRef.current.getInboxIdForIdentifier(
            {
              identifier: memberId.toLowerCase(),
              identifierKind: "Ethereum",
            },
            environment
          );

          if (!inboxId) {
            setError("Address not registered on XMTP");
            setNotOnNetwork(true);
            setInvalidUser(selectedUser);
          } else {
            setInboxId(inboxId);
          }
        } catch (error) {
          setError((error as Error).message);
          console.error(error);
        } finally {
          setLoading(false);
        }
      } else if (isValidInboxId(memberId)) {
        setInboxId(memberId);
      }
    };

    void checkMemberId();
  }, [memberId, environment]);

  const selectUser = (user: AccountData) => {
    setMemberId(user.address);
    setSelectedUsr(user);
  };

  return { memberId, setMemberId, error, loading, inboxId, selectUser };
};
