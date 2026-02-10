"use client";

import { IdentifierKind, getInboxIdForIdentifier } from "@xmtp/browser-sdk";
import { useEffect, useState } from "react";
import { isValidEthereumAddress, isValidInboxId } from "@/utils/strings";
import { useXMTP } from "@/app/XMTPContext";
import type { AccountData } from "@/utils/getLensProfile";
import { getEnv } from "@/utils/xmtpHelpers";

export const useMemberId = () => {
  const { client } = useXMTP();
  const [loading, setLoading] = useState(false);
  const [memberId, setMemberId] = useState<string>("");
  const [inboxId, setInboxId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const environment = getEnv();

  useEffect(() => {
    const checkMemberId = async () => {
      if (!memberId) {
        setError(null);
        return;
      }

      setInboxId("");
      setError(null);

      if (!isValidEthereumAddress(memberId) && !isValidInboxId(memberId)) {
        console.log("Invalid address or inbox ID");
        setError("Invalid address or inbox ID");
      } else if (isValidEthereumAddress(memberId) && client) {
        console.log("Started running");
        setLoading(true);

        try {
          const inboxId = await getInboxIdForIdentifier(
            {
              identifier: memberId.toLowerCase(),
              identifierKind: IdentifierKind.Ethereum,
            },
            environment
          );
          // const isActive = await client.canMessage(identifiers);
          // console.log("Hello");
          // console.log(isActive);

          if (!inboxId) {
            setError("Address not registered on XMTP");
            console.error("Address not registered on XMTP");
          } else {
            console.log("Inbox ID:", inboxId);
            setInboxId(inboxId);
          }
        } catch (error) {
          setError((error as Error).message);
        } finally {
          setLoading(false);
        }
      } else if (isValidInboxId(memberId)) {
        setInboxId(memberId);
      }
    };

    void checkMemberId();
  }, [client, environment, memberId]);

  // useEffect(() => {
  //   const checkMemberId = async () => {
  //     console.log("Definitely started running");
  //     if (!memberId || !selectedUser) {
  //       setError(null);
  //       return;
  //     }
  //     console.log("Reached here 1");

  //     setInboxId("");
  //     setError(null);

  //     if (!isValidEthereumAddress(memberId) && !isValidInboxId(memberId)) {
  //       console.log("It was Invalid");
  //       setError("Invalid address or inbox ID");
  //     } else if (isValidEthereumAddress(memberId) && utilsRef.current) {
  //       console.log("It was valid");
  //       setLoading(true);
  //       console.log("Set the loading to false");

  //       try {
  //         console.log("The memberID: ", memberId.toLowerCase());
  //         const identification = await utilsRef.current.getInboxIdForIdentifier(
  //           {
  //             identifier: memberId.toLowerCase(),
  //             identifierKind: "Ethereum",
  //           },
  //           "dev"
  //         );
  //         console.log("Reached here 2");

  //         if (!identification) {
  //           console.log("This obviously worked, so it can identify non inboxId");
  //           setError("Address not registered on XMTP");
  //           setNotOnNetwork(true);
  //           setInvalidUser(selectedUser);
  //         } else {
  //           console.log("There was an InboxId: ", identification);
  //           setInboxId(identification);
  //         }
  //       } catch (error) {
  //         // setError((error as Error).message);
  //         console.log("There was an error");
  //         console.error(error);
  //       } finally {
  //         setLoading(false);
  //       }
  //     } else if (isValidInboxId(memberId)) {
  //       console.log("Not a valid address or utilsref.current not populated");
  //       setInboxId(memberId);
  //     }
  //   };

  //   void checkMemberId();
  // }, [memberId, environment, setInvalidUser, setNotOnNetwork, selectedUser]);

  const selectUser = (user: AccountData) => {
    setMemberId(user.address);
  };

  return { memberId, setMemberId, error, loading, inboxId, selectUser };
};
