import { Profile } from "@lens-protocol/react-web";

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

export interface UserProfile {
  picture: string;
  coverPicture: string;
  displayName: string;
  handle: string;
  bio: string;
  attributes: string;
  id: string;
  userLink: string;
}

const getLensProfileData = (profile: Profile) => {
  var picture = "";
  var displayName = "";
  var handle = "";
  var userLink = "";
  var coverPicture = "";
  var bio = "";
  var attributes: any = {};

  if (profile?.metadata) {
    // picture
    if (
      profile.metadata.picture?.__typename == "NftImage" &&
      profile.metadata.picture.image.raw.uri
    ) {
      picture = convertIpfsLink(profile.metadata.picture.image.raw.uri);
    } else if (profile.metadata.picture?.__typename == "ImageSet") {
      picture = convertIpfsLink(profile.metadata.picture.raw.uri);
    } else {
      picture = `https://api.hey.xyz/avatar?id=${profile.id}`;
    }

    // cover picture
    if (profile.metadata.coverPicture?.__typename == "ImageSet") {
      coverPicture = profile?.metadata?.coverPicture?.raw?.uri
        ? profile?.metadata?.coverPicture?.raw?.uri
        : "";
    }

    // display Name
    displayName =
      profile.metadata.displayName !== null
        ? profile.metadata.displayName
        : profile.handle
        ? profile.handle.localName
        : "";

    //  handle
    handle = profile.handle ? `@${profile.handle.localName}` : "";

    //userLink
    userLink = profile.handle ? `${profile.handle.localName}` : "";

    // bio
    (bio = profile.metadata.bio ? profile.metadata.bio : ""),
      // attributes
      profile.metadata.attributes?.map((attribute) => {
        attributes[attribute.key] = attribute.value;
      });
  } else {
    //picture
    picture = `https://api.hey.xyz/avatar?id=${profile.id}`;

    // display Name
    displayName = profile.handle ? profile.handle.localName : "";

    //  handle
    handle = profile.handle ? `@${profile.handle.localName}` : "";

    //userLink
    userLink = profile.handle ? `${profile.handle.localName}` : "";
  }

  return {
    picture,
    coverPicture,
    displayName,
    handle,
    bio,
    attributes,
    id: profile.id,
    userLink,
  };
};

export default getLensProfileData;
