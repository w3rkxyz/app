import MyMessageOpenChat from "@/views/my-massage/my-Massage";
import React, { useState } from "react";
import { useEffect } from "react";
import { loadKeys } from "@/utils/xmtpHelpers";
import { useAccount } from "wagmi";

export default function Messages() {
  const { address } = useAccount();
  const [keys, setKeys] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let keys = loadKeys(address as string);
    setKeys(keys);
    setLoading(false);
  }, [address]);

  return <>{!loading && <MyMessageOpenChat keys={keys} />}</>;
}
