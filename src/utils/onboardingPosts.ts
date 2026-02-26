export type OnboardingPostType = "job" | "service";

export interface OnboardingFeedPost {
  id: string;
  type: OnboardingPostType;
  username: string;
  profileImage: string;
  jobName: string;
  jobIcon: string;
  description: string;
  contractType: string;
  paymentAmount: string;
  paidIn: string;
  tags: string[];
  createdAt: number;
}

const STORAGE_KEY = "w3rk.onboarding.feedPosts.v1";

const makeId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const getOnboardingFeedPosts = (type?: OnboardingPostType): OnboardingFeedPost[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const safeItems = parsed.filter((item): item is OnboardingFeedPost => {
      return (
        Boolean(item) &&
        typeof item.id === "string" &&
        (item.type === "job" || item.type === "service") &&
        typeof item.username === "string" &&
        typeof item.profileImage === "string" &&
        typeof item.jobName === "string" &&
        typeof item.description === "string" &&
        typeof item.paymentAmount === "string" &&
        typeof item.paidIn === "string" &&
        Array.isArray(item.tags)
      );
    });

    const sorted = safeItems.sort((a, b) => b.createdAt - a.createdAt);
    if (!type) {
      return sorted;
    }

    return sorted.filter((item) => item.type === type);
  } catch {
    return [];
  }
};

export const appendOnboardingFeedPost = (
  post: Omit<OnboardingFeedPost, "id" | "createdAt">
): OnboardingFeedPost => {
  const nextPost: OnboardingFeedPost = {
    ...post,
    id: makeId(),
    createdAt: Date.now(),
  };

  if (typeof window === "undefined") {
    return nextPost;
  }

  const existing = getOnboardingFeedPosts();
  const deduped = existing.filter((item) => {
    return !(
      item.type === nextPost.type &&
      item.username === nextPost.username &&
      item.jobName === nextPost.jobName &&
      item.description === nextPost.description
    );
  });

  const merged = [nextPost, ...deduped].slice(0, 100);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  return nextPost;
};
