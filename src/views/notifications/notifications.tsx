"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { Notification, getNotifications } from "@/utils/notifications";
import { formatDistanceToNow } from "date-fns";

const DUMMY_NOTIFICATIONS: Partial<Notification>[] = [
  { id: "dummy-1", message: "@imran007 just followed you.", read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), icon: '/images/UserCirclePlus.svg' },
  { id: "dummy-2", message: "You've received a new contract proposal from @imran007", read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), icon: '/images/FilePlus.svg'},
  { id: "dummy-3", message: "Your contract with @imran007 has started.", read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 8), icon: '/images/Handshake.svg'},
  { id: "dummy-4", message: "@imran007 has requested payment for your contract.", read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12), icon: '/images/HandCoins.svg' },
  { id: "dummy-5", message: "Your contract with @imran khan is complete.", read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 16), icon: '/images/CheckCircle.svg' },
  { id: "dummy-6", message: "Your contract with @imran khan was cancelled.", read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20), icon: '/images/XCircle.svg' },
  { id: "dummy-7", message: "You've received a new contract proposal from @imran007", read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 26), icon: '/images/FilePlus.svg' },
  { id: "dummy-8", message: "@imran007 just followed you.", read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 30), icon: '/images/UserCirclePlus.svg' },
  { id: "dummy-9", message: "@imran007 has requested payment for your contract.", read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36), icon: '/images/Receipt.svg' },
  { id: "dummy-10", message: "Your contract with @imran khan was cancelled.", read: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), icon: '/images/XCircle.svg' },
];

const Notifications = () => {
  const { address } = useAccount();
  const [notifications, setNotifications] = useState<Notification[] | Partial<Notification>[]>([]);

  useEffect(() => {
    if (!address) return;

    const unsubscribe = getNotifications(address, (newNotifications) => {
      const sortedNotifications = [...newNotifications].sort((a, b) => {
        const aDate = a.createdAt && typeof a.createdAt.toDate === "function" ? a.createdAt.toDate().getTime() : new Date(a.createdAt).getTime();
        const bDate = b.createdAt && typeof b.createdAt.toDate === "function" ? b.createdAt.toDate().getTime() : new Date(b.createdAt).getTime();
        return bDate - aDate;
      });
      setNotifications(sortedNotifications);
    });

    return () => unsubscribe();
  }, [address]);

  const getNotificationMessage = (notification: Partial<Notification> | Notification) => {
    switch (notification.type) {
      case "contract_offer":
        return `${notification.senderHandle || "Someone"} has sent you a contract offer!`;
      case "contract_accepted":
        return `${notification.senderHandle || "Someone"} has accepted your contract offer!`;
      case "contract_declined":
        return `${notification.senderHandle || "Someone"} has declined your contract offer`;
      case "contract_stage_updated":
        return `${notification.senderHandle || "Someone"} has updated the contract status`;
      case "contract_completed":
        return `${notification.senderHandle || "Someone"} has completed the contract`;
      case "xp_earned":
        return `You earned ${notification.xpAmount || 0} XP!`;
      default:
        return notification.message || "You have a new notification";
    }
  };

  const getCreatedAtDate = (notification: Partial<Notification> | Notification) => {
    if (!notification.createdAt) return new Date();
    if (typeof (notification.createdAt as any).toDate === "function") return (notification.createdAt as any).toDate();
    return notification.createdAt instanceof Date ? notification.createdAt : new Date(notification.createdAt as any);
  };

  const displayNotifications = (notifications && notifications.length > 0) ? notifications : DUMMY_NOTIFICATIONS;

  return (
    <div className="bg-white">
    <div className="max-w-[952px] mx-auto pt-[120px] sm:pt-[90px]">
      <button className="text-[#212121E5] px-[16px] py-[7px] sm:px-[14px] sm:py-[4px] text-lg w-fit h-fit cursor-pointer mb-[12px] font-semibold">
        All Notifications
      </button>

      <div className="notification-box rounded-[16px] px-[8px] py-[8px] bg-white mb-[20px]">
        <ul className="divide-y divide-[#E4E4E7]">
          {displayNotifications.map((notification, idx) => {
            const read = !!notification.read;
            const createdAt = getCreatedAtDate(notification as any);
            return (
              <li
                key={(notification as any).id || `notif-${idx}`}
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
                      <div className="text-[14px] font-medium text-[#212121]">{getNotificationMessage(notification as any)}</div>
                      {/* <div className="text-[12px] text-gray-400 hidden sm:block">{formatDistanceToNow(createdAt, { addSuffix: true })}</div> */}
                    </div>
                    <div className="text-[12px] text-[#AFAFAF] mt-[6px]">3h ago</div>
                  </div>
                </div>
              </li>
            );
          })}
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
