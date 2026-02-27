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

export const fetchW3rkListings = async (type: W3rkListingType): Promise<W3rkListing[]> => {
  const result = await fetchPosts(client, {
    filter: {
      feeds: [{ globalFeed: true }],
      metadata: {
        tags: {
          all: ["w3rk", type],
        },
      },
    },
  });

  if (result.isErr()) {
    throw new Error(result.error.message);
  }

  const mapped = (result.value?.items || [])
    .map(item => mapLensPostToW3rkListing(item, type))
    .filter((item): item is W3rkListing => Boolean(item));

  return mapped;
};
