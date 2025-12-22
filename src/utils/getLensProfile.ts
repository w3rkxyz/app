import { Account } from "@lens-protocol/client";

// The Account data type, these are the properties from the lens account that are used in the app
export interface AccountData {
  picture: string;
  coverPicture: string;
  displayName: string;
  handle: string;
  bio: string;
  attributes: any;
  id: string;
  userLink: string;
  address: string;
}

// Gets the relevant account data from the lens account
const getLensAccountData = (account: Account): AccountData => {
  let picture = "";
  let displayName = "";
  let handle = "";
  let userLink = "";
  let coverPicture = "";
  let bio = "";
  let attributes: any = {};

  // Handle picture
  if (account.metadata?.picture) {
    picture = account.metadata.picture;
  } else {
    // Fallback to default avatar
    picture = "https://static.hey.xyz/images/default.png";
  }

  // Handle cover picture
  if (account.metadata?.coverPicture) {
    coverPicture = account.metadata.coverPicture;
  }

  // Handle display name
  displayName = account.metadata?.name || account.username?.localName || "";

  // Handle handle
  handle = account.username?.localName ? `@${account.username.localName}` : "";

  // Handle user link
  userLink = account.username?.localName || "";

  // Handle bio
  bio = account.metadata?.bio || "";

  // Handle attributes if they exist
  if (account.metadata?.attributes) {
    account.metadata.attributes.forEach(attribute => {
      if (attribute.key && attribute.value) {
        attributes[attribute.key] = attribute.value;
      }
    });
  }

  return {
    picture,
    coverPicture,
    displayName,
    handle,
    bio,
    attributes,
    id: account.username?.id || "",
    userLink,
    // Use Lens Account address (smart contract) instead of owner (EOA)
    // This is the address that will interact with ContractsManager
    address: account.address || account.owner || "",
  };
};

export default getLensAccountData;
