// Checks if a string is a valid Ethereum address
export const isValidEthereumAddress = (address: string): address is `0x${string}` =>
  /^0x[a-fA-F0-9]{40}$/.test(address);

// Checks if a string is a valid Inbox ID
export const isValidInboxId = (inboxId: string): inboxId is string =>
  /^[a-z0-9]{64}$/.test(inboxId);
