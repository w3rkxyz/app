"use client";

import { getInboxIdForIdentifier, type Identifier } from "@xmtp/browser-sdk";
import { useEffect, useState } from "react";
import { isValidEthereumAddress, isValidInboxId } from "@/utils/strings";
import { useXMTP } from "@/app/XMTPContext";
import type { AccountData } from "@/utils/getLensProfile";

export const useMemberId = () => {
  const { setNotOnNetwork, setInvalidUser, client } = useXMTP();
  const [loading, setLoading] = useState(false);
  const [memberId, setMemberId] = useState<string>("");
  const [selectedUser, setSelectedUsr] = useState<AccountData | null>(null);
  const [inboxId, setInboxId] = useState<string>("");
  const [isOn, setIsOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const environment = "dev";

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
          const identifiers: Identifier[] = [
            {
              identifier: memberId.toLowerCase(),
              identifierKind: "Ethereum",
            },
          ];
          console.log("Identifiers: ", identifiers);

          const inboxId = await getInboxIdForIdentifier(
            {
              identifier: memberId.toLowerCase(),
              identifierKind: "Ethereum",
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
          console.log("user: ", selectedUser);
        }
      } else if (isValidInboxId(memberId)) {
        setInboxId(memberId);
      }
    };

    void checkMemberId();
  }, [memberId, environment]);

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
    setSelectedUsr(user);
  };

  return { memberId, setMemberId, error, loading, inboxId, selectUser };
};
