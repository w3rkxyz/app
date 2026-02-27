import { fetchPosts } from "@lens-protocol/client/actions";
import { client } from "@/client";

export type W3rkListingType = "job" | "service";

export interface W3rkListing {
  id: string;
  username: string;
  profileImage: string;
  jobName: string;
  jobIcon: string;
  description: string;
  contractType: string;
  paymentAmount: string;
  paidIn: string;
  tags: string[];
}

type AttributeRecord = Record<string, string>;
type RawLensPost = any;

const DEFAULT_PROFILE_IMAGE = "https://static.hey.xyz/images/default.png";
const RESERVED_TAGS = new Set(["w3rk", "job", "service"]);

const readAttributeMap = (attributes: unknown): AttributeRecord => {
  if (!Array.isArray(attributes)) {
    return {};
  }

  const map: AttributeRecord = {};
  attributes.forEach(attribute => {
    if (
      attribute &&
      typeof attribute === "object" &&
      "key" in attribute &&
      "value" in attribute &&
      typeof attribute.key === "string" &&
      typeof attribute.value === "string"
    ) {
      map[attribute.key] = attribute.value;
    }
  });

  return map;
};

const readPostType = (attributes: AttributeRecord, tags: string[]): W3rkListingType => {
  const typed = (attributes["post type"] || "").toLowerCase();
  if (typed === "service") {
    return "service";
  }
  if (typed === "job") {
    return "job";
  }

  return tags.includes("service") ? "service" : "job";
};

const readPaymentAmount = (
  attributes: AttributeRecord
): { amount: string; paymentType: string } => {
  const paymentType = (
    attributes["payement type"] ||
    attributes["payment type"] ||
    "fixed"
  ).toLowerCase();
  const hourly = attributes.hourly;
  const fixed = attributes.fixed;

  if (paymentType === "hourly" && hourly) {
    return { amount: `$${hourly}/hr`, paymentType };
  }

  if (fixed) {
    return { amount: `$${fixed}`, paymentType };
  }

  if (hourly) {
    return { amount: `$${hourly}/hr`, paymentType: "hourly" };
  }

  return { amount: "$0", paymentType };
};

const readPaidIn = (attributes: AttributeRecord): string => {
  const paidIn = attributes["paid in"] || "";
  const firstToken = paidIn
    .split(",")
    .map(token => token.trim())
    .find(Boolean);

  if (!firstToken) {
    return "";
  }

  const symbolMatch = firstToken.match(/\(([^)]+)\)/);
  return symbolMatch ? symbolMatch[1] : firstToken;
};

const readTags = (rawTags: unknown): string[] => {
  if (!Array.isArray(rawTags)) {
    return [];
  }

  return rawTags
    .filter((tag): tag is string => typeof tag === "string")
    .filter(tag => !RESERVED_TAGS.has(tag));
};

const readPostImage = (post: any): string => {
  if (typeof post?.author?.metadata?.picture === "string" && post.author.metadata.picture.trim()) {
    return post.author.metadata.picture;
  }

  return DEFAULT_PROFILE_IMAGE;
};

const readUsername = (post: any): string => {
  if (typeof post?.author?.metadata?.name === "string" && post.author.metadata.name.trim()) {
    return post.author.metadata.name;
  }

  if (
    typeof post?.author?.username?.localName === "string" &&
    post.author.username.localName.trim()
  ) {
    return post.author.username.localName;
  }

  return "Lens User";
};

export const mapLensPostToW3rkListing = (
  post: any,
  expectedType: W3rkListingType
): W3rkListing | null => {
  const metadata = post?.metadata;
  if (!metadata || typeof metadata !== "object") {
    return null;
  }

  const tags = Array.isArray(metadata.tags)
    ? metadata.tags.filter((tag: unknown): tag is string => typeof tag === "string")
    : [];

  const attributes = readAttributeMap(metadata.attributes);
  const postType = readPostType(attributes, tags);
  if (postType !== expectedType) {
    return null;
  }

  const { amount, paymentType } = readPaymentAmount(attributes);
  const title = attributes.title || "Untitled";
  const description =
    attributes.content || (typeof metadata.content === "string" ? metadata.content : "");

  return {
    id: typeof post?.id === "string" ? post.id : `${postType}-${title}-${description.slice(0, 20)}`,
    username: readUsername(post),
    profileImage: readPostImage(post),
    jobName: title,
    jobIcon: "",
    description,
    contractType: paymentType,
    paymentAmount: amount,
    paidIn: readPaidIn(attributes),
    tags: readTags(tags),
  };
};

const mapAndFilterListings = (items: RawLensPost[], type: W3rkListingType): W3rkListing[] => {
  return (items || [])
    .map(item => mapLensPostToW3rkListing(item, type))
    .filter((item): item is W3rkListing => Boolean(item));
};

const TESTNET_GRAPHQL = "https://api.testnet.lens.xyz/graphql";

const fetchListingsFromGraphQL = async (
  type: W3rkListingType,
  authorAddress?: string
): Promise<W3rkListing[]> => {
  const endpoint = process.env.NEXT_PUBLIC_LENS_API_URL || TESTNET_GRAPHQL;
  const query = `
    query Posts($request: PostsRequest!) {
      posts(request: $request) {
        items {
          __typename
          ... on Post {
            id
            author {
              address
              owner
              username {
                localName
              }
              metadata {
                ... on AccountMetadata {
                  name
                  picture
                }
              }
            }
            metadata {
              __typename
              ... on TextOnlyMetadata {
                content
                tags
                attributes {
                  key
                  value
                }
              }
            }
          }
        }
      }
    }
  `;

  const variables = {
    request: {
      filter: {
        ...(authorAddress ? { authors: [authorAddress] } : {}),
        metadata: {
          tags: {
            all: ["w3rk", type],
          },
        },
      },
    },
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });
    const json = await response.json();
    const items = json?.data?.posts?.items;
    return mapAndFilterListings(Array.isArray(items) ? items : [], type);
  } catch (error) {
    console.error("GraphQL listings fallback failed:", error);
    return [];
  }
};

export const fetchW3rkListings = async (type: W3rkListingType): Promise<W3rkListing[]> => {
  const result = await fetchPosts(client, {
    filter: {
      metadata: {
        tags: {
          all: ["w3rk", type],
        },
      },
    },
  });

  if (!result.isErr()) {
    const mapped = mapAndFilterListings(result.value?.items || [], type);
    if (mapped.length > 0) {
      return mapped;
    }
  } else {
    console.error("Lens SDK listing fetch failed:", result.error.message);
  }

  return fetchListingsFromGraphQL(type);
};

export const fetchAuthorListings = async (
  type: W3rkListingType,
  authorAddress?: string
): Promise<W3rkListing[]> => {
  if (!authorAddress) {
    return [];
  }

  const result = await fetchPosts(client, {
    filter: {
      authors: [authorAddress as any],
    },
  });

  if (!result.isErr()) {
    const mapped = mapAndFilterListings(result.value?.items || [], type);
    if (mapped.length > 0) {
      return mapped;
    }
  } else {
    console.error("Lens SDK author fetch failed:", result.error.message);
  }

  return fetchListingsFromGraphQL(type, authorAddress);
};
