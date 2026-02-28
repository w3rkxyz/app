"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useSelector } from "react-redux";
import { useSessionClient } from "@lens-protocol/react";
import { fetchNotifications as fetchLensNotifications } from "@lens-protocol/client/actions";
import { formatDistanceToNow } from "date-fns";
import {
  Notification,
  getW3rkNotifications,
  W3RK_NOTIFICATION_ICONS,
} from "@/utils/notifications";

type NotificationListItem = {
  id: string;
  message: string;
  read: boolean;
  createdAt: Date;
  icon: string;
};

const Notifications = () => {
  const { user: profile } = useSelector((state: any) => state.app);
  const { data: sessionClient } = useSessionClient();
  const [w3rkNotifications, setW3rkNotifications] = useState<NotificationListItem[]>([]);
  const [lensNotifications, setLensNotifications] = useState<NotificationListItem[]>([]);
  const [w3rkLoading, setW3rkLoading] = useState(true);
  const [lensLoading, setLensLoading] = useState(false);
  const [w3rkError, setW3rkError] = useState<string | null>(null);
  const [lensError, setLensError] = useState<string | null>(null);
  const isLensFirstFetchRef = useRef(true);

  const activeLensAddress = profile?.address;

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

    setW3rkLoading(true);
    setW3rkError(null);

    const unsubscribe = getW3rkNotifications(
      activeLensAddress,
      newNotifications => {
        const normalized = newNotifications.map((notification, idx) => {
          const typedNotification = notification as Notification;
          return {
            id: typedNotification.id || `w3rk-${idx}`,
            message: getW3rkMessage(typedNotification),
            read: !!typedNotification.read,
            createdAt: toDate(typedNotification.createdAt),
            icon:
              typedNotification.icon ||
              W3RK_NOTIFICATION_ICONS[typedNotification.type] ||
              "/images/notification.svg",
          };
        });
        setW3rkNotifications(sortByDateDesc(normalized));
        setW3rkLoading(false);
      },
      error => {
        setW3rkError(error.message || "Could not load notifications.");
        setW3rkLoading(false);
      }
    );

    return () => unsubscribe();
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

      const result = await fetchLensNotifications(sessionClient as any, {
        filter: {
          timeBasedAggregation: true,
        },
      });

      if (!mounted) return;

      if (result.isErr()) {
        setLensError(result.error.message || "Could not load Lens activity.");
        setLensLoading(false);
        return;
      }

      const items = (result.value?.items || []) as any[];
      const normalized = items.map((item, idx) => {
        const typename = String(item?.__typename || item?.type || "");
        const lensId = item?.id ? `lens-${item.id}` : `lens-${idx}`;

        if (typename.includes("Follow")) {
          const follower = Array.isArray(item?.followers) ? item.followers[0] : null;
          return {
            id: lensId,
            message: `${displayLensActor(follower?.account)} followed you on Lens.`,
            read: true,
            createdAt: toDate(follower?.followedAt || item?.createdAt || item?.timestamp),
            icon: "/images/UserCirclePlus.svg",
          };
        }

        if (typename.includes("Comment")) {
          return {
            id: lensId,
            message: "Someone commented on your Lens post.",
            read: true,
            createdAt: toDate(item?.comment?.createdAt || item?.createdAt || item?.timestamp),
            icon: "/images/messageIcon.svg",
          };
        }

        if (typename.includes("Reaction")) {
          return {
            id: lensId,
            message: "Someone reacted to your Lens post.",
            read: true,
            createdAt: toDate(item?.createdAt || item?.timestamp),
            icon: "/images/notification.svg",
          };
        }

        if (typename.includes("Mention")) {
          return {
            id: lensId,
            message: "You were mentioned in a Lens post.",
            read: true,
            createdAt: toDate(item?.createdAt || item?.timestamp),
            icon: "/images/notification.svg",
          };
        }

        if (typename.includes("Quote")) {
          return {
            id: lensId,
            message: "Someone quoted your Lens post.",
            read: true,
            createdAt: toDate(item?.quote?.createdAt || item?.createdAt || item?.timestamp),
            icon: "/images/notification.svg",
          };
        }

        if (typename.includes("Repost")) {
          return {
            id: lensId,
            message: "Someone reposted your Lens post.",
            read: true,
            createdAt: toDate(item?.createdAt || item?.timestamp),
            icon: "/images/notification.svg",
          };
        }

        return {
          id: lensId,
          message: "New Lens activity.",
          read: true,
          createdAt: toDate(item?.createdAt || item?.timestamp || item?.actionDate),
          icon: "/images/notification.svg",
        };
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
  }, [sessionClient]);

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
      return (
        <li className="px-[16px] py-[24px] text-[14px] text-red-500">
          {error || "Could not load notifications."}
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
