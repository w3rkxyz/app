"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { graphql, NotificationType } from "@lens-protocol/client";
import { useAuthenticatedUser, useSessionClient } from "@lens-protocol/react";
import { formatDistanceToNow } from "date-fns";
import { Notification, W3RK_NOTIFICATION_ICONS } from "@/utils/notifications";

type NotificationListItem = {
  id: string;
  message: string;
  read: boolean;
  createdAt: Date;
  icon: string;
};

type W3rkApiNotification = {
  id: string;
  message?: string;
  type: Notification["type"];
  read?: boolean;
  createdAt?: string;
  senderHandle?: string;
  icon?: string;
};

const LENS_NOTIFICATIONS_QUERY = graphql(`
  query NotificationsMinimal($request: NotificationRequest!) {
    notifications(request: $request) {
      items {
        __typename
        ... on FollowNotification {
          id
          followers {
            followedAt
            account {
              address
              username {
                localName
              }
            }
          }
        }
      }
    }
  }
`);

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
          if (message.includes("Firebase Admin credentials are missing")) {
            setW3rkNotifications([]);
            setW3rkError(null);
          } else {
            setW3rkError(message);
          }
          setW3rkLoading(false);
          return;
        }

        const normalized = (payload.items || []).map((notification, idx) => {
          const typedNotification = notification as unknown as Notification;
          return {
            id: notification.id || `w3rk-${idx}`,
            message: getW3rkMessage(typedNotification),
            read: !!notification.read,
            createdAt: toDate(notification.createdAt),
            icon:
              notification.icon ||
              W3RK_NOTIFICATION_ICONS[typedNotification.type] ||
              "/images/notification.svg",
          };
        });

        setW3rkNotifications(sortByDateDesc(normalized));
        setW3rkLoading(false);
      } catch (error) {
        if (!mounted) {
          return;
        }
        setW3rkError(error instanceof Error ? error.message : "Could not load notifications.");
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
      if (!sessionClient || !(sessionClient as any).isSessionClient?.()) {
        if (mounted) {
          setLensNotifications([]);
          setLensLoading(false);
          setLensError(null);
        }
        return;
      }

      if (initialLoad || isLensFirstFetchRef.current) {
        setLensLoading(true);
      }
      setLensError(null);

      const authenticated = await (sessionClient as any)
        .getAuthenticatedUser()
        .unwrapOr(null);
      const recipientLensAddress =
        authenticated?.address?.toLowerCase() || authenticatedUser?.address?.toLowerCase() || null;

      console.info("[notifications:lens] recipient", {
        recipientLensAddress,
        profileLensAddress: profile?.address?.toLowerCase() || null,
        authenticatedUserAddress: authenticatedUser?.address?.toLowerCase() || null,
      });

      if (!recipientLensAddress) {
        setLensError("Lens account not resolved. Please login again.");
        setLensLoading(false);
        return;
      }

      const result = await (sessionClient as any).query(LENS_NOTIFICATIONS_QUERY as any, {
        request: {
          orderBy: "DEFAULT",
          filter: {
            notificationTypes: [NotificationType.Followed],
            includeLowScore: true,
            timeBasedAggregation: true,
          },
        },
      });

      if (!mounted) return;

      if (result.isErr()) {
        setLensError(result.error?.message || "Could not load Lens activity.");
        setLensLoading(false);
        return;
      }

      const items = result.value?.notifications?.items || [];
      const typeCounts = items.reduce((acc: Record<string, number>, item: any) => {
        const key = item?.__typename || "Unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      const normalized = items
        .filter(item => item?.__typename === "FollowNotification")
        .flatMap((item: any, idx: number) => {
          const followers = Array.isArray(item?.followers) ? item.followers : [];
          if (followers.length === 0) {
            return [];
          }

          return followers.map((follower: any, followerIdx: number) => ({
              id: `lens-follow-${item.id || idx}-${followerIdx}`,
              message: `${displayLensActor(follower?.account)} followed you on Lens.`,
              read: true,
              createdAt: toDate(follower?.followedAt),
              icon: "/images/UserCirclePlus.svg",
            }));
        });

      console.info("[notifications:lens] query result", {
        totalItems: items.length,
        typeCounts,
        followedCount: normalized.length,
      });

      setLensNotifications(sortByDateDesc(normalized));
      setLensLoading(false);
      isLensFirstFetchRef.current = false;
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

  const w3rkState = useMemo(() => {
    if (w3rkLoading) return "loading";
    if (w3rkError) return "error";
    if (w3rkNotifications.length === 0) return "empty";
    return "data";
  }, [w3rkError, w3rkLoading, w3rkNotifications.length]);

  const lensState = useMemo(() => {
    if (lensLoading) return "loading";
    if (lensError) return "error";
    if (lensNotifications.length === 0) return "empty";
    return "data";
  }, [lensError, lensLoading, lensNotifications.length]);

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
        error && error.includes("Firebase Admin credentials are missing")
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
              src="/images/profile.jpg"
              className="rounded-full object-cover"
              alt="Profile"
              height={56}
              width={56}
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
            {renderNotificationList(w3rkNotifications, w3rkState, w3rkError)}
          </ul>

          <div className="pt-[12px] flex justify-center">
            <button className="px-[18px] py-[8px] text-[14px] rounded-full border border-[#E4E4E7] bg-white hover:bg-[#F8F8F8]">View more</button>
          </div>
        </div>

        <button className="text-[#212121E5] px-[16px] py-[7px] sm:px-[14px] sm:py-[4px] text-lg w-fit h-fit cursor-pointer mb-[12px] font-semibold">
          Lens Activity
        </button>

        <div className="notification-box rounded-[16px] px-[8px] py-[8px] bg-white mb-[20px]">
          <ul className="divide-y divide-[#E4E4E7]">
            {renderNotificationList(lensNotifications, lensState, lensError)}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
