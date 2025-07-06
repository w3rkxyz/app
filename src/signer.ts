import { privateKeyToAccount } from "viem/accounts";

export const signer = privateKeyToAccount(process.env.NEXT_PUBLIC_DUMMY_ACCOUNT as `0x${string}`);
