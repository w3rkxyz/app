import { Account } from "@lens-protocol/client";

function convertIpfsLink(link: string) {
  const ipfsPrefix = "ipfs://";
  const gatewayPrefix = "https://gateway.pinata.cloud/ipfs/";

  if (link.startsWith(ipfsPrefix)) {
    const cid = link.slice(ipfsPrefix.length);
    return gatewayPrefix + cid;
  }

  // Return the original link if it doesn't start with ipfs://
  return link;
}

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
    address: account.owner || "",
  };
};

export default getLensAccountData;
