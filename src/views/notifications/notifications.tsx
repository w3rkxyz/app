"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { NotificationType } from "@lens-protocol/client";
import { fetchAccount, fetchFollowers, fetchNotifications } from "@lens-protocol/client/actions";
import { evmAddress, useAuthenticatedUser, useSessionClient } from "@lens-protocol/react";
import { formatDistanceToNow } from "date-fns";
import { getPublicClient } from "@/client";
import { Notification, W3RK_NOTIFICATION_ICONS } from "@/utils/notifications";

const DEFAULT_PROFILE_AVATAR = "https://static.hey.xyz/images/default.png";

type NotificationListItem = {
  id: string;
  message: string;
  read: boolean;
  createdAt: Date;
  icon: string;
  avatar: string;
};

type W3rkApiNotification = {
  id: string;
  message?: string;
  type: Notification["type"];
  read?: boolean;
  createdAt?: string;
  senderHandle?: string;
  senderLensAddress?: string;
  icon?: string;
};

const pickFirstNonEmptyString = (...values: unknown[]) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }
  return "";
};

const resolveMediaUrl = (value: unknown) => {
  if (!value) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "object") {
    const media = value as any;
    return pickFirstNonEmptyString(
      media?.uri,
      media?.url,
      media?.optimized?.uri,
      media?.optimized?.url,
      media?.raw?.uri,
      media?.raw?.url,
      media?.original?.uri,
      media?.original?.url
    );
  }
  return "";
};

const resolveAccountAvatar = (account: any) =>
  resolveMediaUrl(account?.metadata?.picture) || DEFAULT_PROFILE_AVATAR;

const Notifications = () => {
  const { user: profile } = useSelector((state: any) => state.app);
  const { data: sessionClient } = useSessionClient();
  const { data: authenticatedUser } = useAuthenticatedUser();
  const [w3rkNotifications, setW3rkNotifications] = useState<NotificationListItem[]>([]);
  const [lensNotifications, setLensNotifications] = useState<NotificationListItem[]>([]);
  const [w3rkLoading, setW3rkLoading] = useState(true);
  const [lensLoading, setLensLoading] = useState(false);
  const [w3rkError, setW3rkError] = useState<string | null>(null);
  const [lensError, setLensError] = useState<string | null>(null);
  const isLensFirstFetchRef = useRef(true);
  const w3rkAvatarCacheRef = useRef<Record<string, string>>({});

  const activeLensAddress =
    authenticatedUser?.address?.toLowerCase() || profile?.address?.toLowerCase();

  const toDate = (value: unknown) => {
    if (!value) return new Date();
    if (typeof (value as any).toDate === "function") {
      return (value as any).toDate() as Date;
    }
    if (value instanceof Date) return value;
    const parsed = new Date(value as string);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const sortByDateDesc = <T extends { createdAt: Date }>(items: T[]) =>
    [...items].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const displayLensActor = (account: any) => {
    const handle = account?.username?.localName;
    if (handle) return `@${handle}`;
    if (account?.address && typeof account.address === "string") {
      return `${account.address.slice(0, 6)}...${account.address.slice(-4)}`;
    }
    return "Someone";
  };

  const getW3rkMessage = (notification: Notification) => {
    switch (notification.type) {
      case "contract_proposal":
        return `${notification.senderHandle || "Someone"} has sent you a contract offer!`;
      case "contract_started":
        return "Your contract has started.";
      case "payment_requested":
        return "Payment has been requested for your contract.";
      case "contract_completed":
        return "Your contract is complete.";
      case "contract_cancelled":
        return "A contract was cancelled.";
      case "escrow_funded":
        return "Escrow has been funded.";
      case "escrow_released":
        return "Escrow has been released.";
      default:
        return notification.message || "You have a new notification";
    }
  };

  const isFirebaseAdminCredsError = (value: string | null | undefined) => {
    if (!value) {
      return false;
    }
    return (
      value.includes("Firebase Admin credentials are missing") ||
      value.includes("FIREBASE_SERVICE_ACCOUNT_JSON") ||
      value.includes("FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY")
    );
  };

  useEffect(() => {
    if (!activeLensAddress) {
      setW3rkNotifications([]);
      setW3rkLoading(false);
      setW3rkError(null);
      return;
    }

    let mounted = true;
    let intervalId: number | null = null;

    const loadW3rkNotifications = async (initialLoad = false) => {
      if (initialLoad) {
        setW3rkLoading(true);
      }
      setW3rkError(null);

      try {
        const response = await fetch(
          `/api/notifications/w3rk?recipientLensAddress=${encodeURIComponent(activeLensAddress)}`,
          { cache: "no-store" }
        );

        const payload = (await response.json().catch(() => ({}))) as {
          items?: W3rkApiNotification[];
          error?: string;
        };

        if (!mounted) {
          return;
        }

        if (!response.ok) {
          const message = payload.error || "Could not load notifications.";
          if (isFirebaseAdminCredsError(message)) {
            setW3rkNotifications([]);
            setW3rkError(null);
          } else {
            setW3rkError(message);
          }
          setW3rkLoading(false);
          return;
        }

        const rawItems = payload.items || [];
        const senderAddresses = Array.from(
          new Set(
            rawItems
              .map(item => item.senderLensAddress?.trim().toLowerCase())
              .filter((value): value is string => !!value)
          )
        );

        const missingAvatarAddresses = senderAddresses.filter(
          address => !w3rkAvatarCacheRef.current[address]
        );

        if (missingAvatarAddresses.length > 0) {
          const avatarEntries = await Promise.all(
            missingAvatarAddresses.map(async address => {
              try {
                const accountResult = await fetchAccount(getPublicClient(), {
                  address: evmAddress(address as `0x${string}`),
                });

                if (accountResult.isErr()) {
                  return [address, DEFAULT_PROFILE_AVATAR] as const;
                }

                return [address, resolveAccountAvatar(accountResult.value)] as const;
              } catch {
                return [address, DEFAULT_PROFILE_AVATAR] as const;
              }
            })
          );

          if (!mounted) {
            return;
          }

          avatarEntries.forEach(([address, avatar]) => {
            w3rkAvatarCacheRef.current[address] = avatar || DEFAULT_PROFILE_AVATAR;
          });
        }

        const normalized = rawItems.map((notification, idx) => {
          const typedNotification = notification as unknown as Notification;
          const senderAddress = notification.senderLensAddress?.trim().toLowerCase();
          return {
            id: notification.id || `w3rk-${idx}`,
            message: getW3rkMessage(typedNotification),
            read: !!notification.read,
            createdAt: toDate(notification.createdAt),
            icon:
              notification.icon ||
              W3RK_NOTIFICATION_ICONS[typedNotification.type] ||
              "/images/notification.svg",
            avatar:
              (senderAddress && w3rkAvatarCacheRef.current[senderAddress]) || DEFAULT_PROFILE_AVATAR,
          };
        });

        setW3rkNotifications(sortByDateDesc(normalized));
        setW3rkLoading(false);
      } catch (error) {
        if (!mounted) {
          return;
        }
        const message = error instanceof Error ? error.message : "Could not load notifications.";
        if (isFirebaseAdminCredsError(message)) {
          setW3rkNotifications([]);
          setW3rkError(null);
        } else {
          setW3rkError(message);
        }
        setW3rkLoading(false);
      }
    };

    void loadW3rkNotifications(true);
    intervalId = window.setInterval(() => {
      void loadW3rkNotifications(false);
    }, 30000);

    return () => {
      mounted = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [activeLensAddress]);

  useEffect(() => {
    let mounted = true;
    let intervalId: number | null = null;

    const loadLensNotifications = async (initialLoad = false) => {
      if (initialLoad || isLensFirstFetchRef.current) {
        setLensLoading(true);
      }
      setLensError(null);

      try {
        const hasSessionClient = !!sessionClient && !!(sessionClient as any).isSessionClient?.();
        const authenticated = hasSessionClient
          ? await (sessionClient as any).getAuthenticatedUser().unwrapOr(null)
          : null;

        const recipientLensAddress = (
          authenticated?.address ||
          authenticatedUser?.address ||
          profile?.address ||
          ""
        )
          .trim()
          .toLowerCase();

        console.info("[notifications:lens] recipient", {
          recipientLensAddress: recipientLensAddress || null,
          profileLensAddress: profile?.address?.toLowerCase() || null,
          authenticatedUserAddress: authenticatedUser?.address?.toLowerCase() || null,
          sessionAuthenticatedAddress: authenticated?.address?.toLowerCase() || null,
          hasSessionClient,
        });

        if (!recipientLensAddress) {
          if (!mounted) return;
          setLensNotifications([]);
          setLensError(null);
          setLensLoading(false);
          return;
        }

        let notificationItems: NotificationListItem[] = [];
        let notificationsError: string | null = null;

        if (hasSessionClient) {
          const result = await fetchNotifications(sessionClient as any, {
            orderBy: "DEFAULT" as any,
            filter: {
              notificationTypes: [NotificationType.Followed],
              includeLowScore: true,
              timeBasedAggregation: true,
            },
          });

          if (result.isErr()) {
            notificationsError = result.error?.message || "Could not load Lens activity.";
          } else {
            const items = result.value?.items || [];
            notificationItems = items
              .filter((item: any) => item?.__typename === "FollowNotification")
              .flatMap((item: any, idx: number) => {
                const followers = Array.isArray(item?.followers) ? item.followers : [];
                if (followers.length === 0) {
                  return [];
                }

                return followers.map((follower: any, followerIdx: number) => ({
                  id: `lens-follow-${item.id || idx}-${follower?.account?.address || followerIdx}-${follower?.followedAt || followerIdx}`,
                  message: `${displayLensActor(follower?.account)} followed you on Lens.`,
                  read: true,
                  createdAt: toDate(follower?.followedAt),
                  icon: "/images/UserCirclePlus.svg",
                  avatar: resolveAccountAvatar(follower?.account),
                }));
              });
          }
        }

        let fallbackItems: NotificationListItem[] = [];
        let fallbackError: string | null = null;

        if (notificationItems.length === 0) {
          const fallbackResult = await fetchFollowers(getPublicClient(), {
            account: evmAddress(recipientLensAddress as `0x${string}`),
          });

          if (fallbackResult.isErr()) {
            fallbackError = fallbackResult.error?.message || "Could not load Lens followers.";
          } else {
            const followers = fallbackResult.value?.items || [];
            fallbackItems = followers.map((entry: any, idx: number) => ({
              id: `lens-follower-${entry?.follower?.address || idx}-${entry?.followedOn || idx}`,
              message: `${displayLensActor(entry?.follower)} followed you on Lens.`,
              read: true,
              createdAt: toDate(entry?.followedOn),
              icon: "/images/UserCirclePlus.svg",
              avatar: resolveAccountAvatar(entry?.follower),
            }));
          }
        }

        if (!mounted) return;

        const merged = notificationItems.length > 0 ? notificationItems : fallbackItems;
        const deduped = Array.from(new Map(merged.map(item => [item.id, item])).values());

        console.info("[notifications:lens] query result", {
          viaNotifications: notificationItems.length,
          viaFollowersFallback: fallbackItems.length,
          rendered: deduped.length,
          notificationsError,
          fallbackError,
        });

        setLensNotifications(sortByDateDesc(deduped));

        if (deduped.length === 0 && notificationsError && fallbackError) {
          setLensError(notificationsError);
        } else {
          setLensError(null);
        }

        setLensLoading(false);
        isLensFirstFetchRef.current = false;
      } catch (error) {
        if (!mounted) {
          return;
        }
        setLensError(error instanceof Error ? error.message : "Could not load Lens activity.");
        setLensLoading(false);
      }
    };

    void loadLensNotifications(true);
    intervalId = window.setInterval(() => {
      void loadLensNotifications(false);
    }, 45000);

    return () => {
      mounted = false;
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [authenticatedUser?.address, profile?.address, sessionClient]);

  const mergedNotifications = useMemo(
    () => sortByDateDesc([...w3rkNotifications, ...lensNotifications]),
    [lensNotifications, w3rkNotifications]
  );

  const mergedState = useMemo(() => {
    if (mergedNotifications.length > 0) return "data";
    if (w3rkLoading || lensLoading) return "loading";
    if (w3rkError || lensError) return "error";
    return "empty";
  }, [lensError, lensLoading, mergedNotifications.length, w3rkError, w3rkLoading]);

  const mergedError = useMemo(() => {
    if (w3rkError && lensError) {
      return `${w3rkError} ${lensError}`.trim();
    }
    return w3rkError || lensError || null;
  }, [lensError, w3rkError]);

  const renderNotificationList = (items: NotificationListItem[], state: string, error?: string | null) => {
    if (state === "loading") {
      return (
        <li className="px-[16px] py-[24px] text-[14px] text-gray-500">
          Loading notifications...
        </li>
      );
    }

    if (state === "error") {
      const safeError =
        isFirebaseAdminCredsError(error)
          ? "w3rk notifications are temporarily unavailable."
          : error;
      return (
        <li className="px-[16px] py-[24px] text-[14px] text-red-500">
          {safeError || "Could not load notifications."}
        </li>
      );
    }

    if (state === "empty") {
      return (
        <li className="px-[16px] py-[24px] text-[14px] text-gray-500">
          No notifications yet.
        </li>
      );
    }

    return items.map((notification, idx) => {
      const read = !!notification.read;
      const createdAt = notification.createdAt;
      return (
        <li
          key={notification.id || `notif-${idx}`}
          className={`flex items-center gap-[16px] px-[16px] py-[24px] hover:bg-[#FAFAFA] ${!read ? "bg-[#FBFBFB]" : "bg-white"}`}
        >
          <div className="flex-shrink-0">
            <div className="w-[40px] h-[40px] rounded-full flex items-center justify-center overflow-hidden">
              <Image src={notification.icon} alt="icon" width={28} height={28} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Image
              src={notification.avatar || DEFAULT_PROFILE_AVATAR}
              className="rounded-full object-cover"
              alt="Profile"
              height={56}
              width={56}
              onError={({ currentTarget }) => {
                currentTarget.src = DEFAULT_PROFILE_AVATAR;
              }}
            />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="text-[14px] font-medium text-[#111827]">{notification.message}</div>
              </div>
              <div className="text-[12px] text-gray-400 mt-[6px]">
                {formatDistanceToNow(createdAt, { addSuffix: true })}
              </div>
            </div>
          </div>
        </li>
      );
    });
  };

  return (
    <div className="bg-white">
      <div className="max-w-[952px] mx-auto pt-[120px] sm:pt-[90px]">
        <button className="text-[#212121E5] px-[16px] py-[7px] sm:px-[14px] sm:py-[4px] text-lg w-fit h-fit cursor-pointer mb-[12px] font-semibold">
          All Notifications
        </button>

        <div className="notification-box rounded-[16px] px-[8px] py-[8px] bg-white mb-[20px]">
          <ul className="divide-y divide-[#E4E4E7]">
            {renderNotificationList(mergedNotifications, mergedState, mergedError)}
          </ul>

          <div className="pt-[12px] flex justify-center">
            <button className="px-[18px] py-[8px] text-[14px] rounded-full border border-[#E4E4E7] bg-white hover:bg-[#F8F8F8]">View more</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
