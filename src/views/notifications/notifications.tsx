"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import { Notification, getNotifications } from "@/utils/firebase";
import { formatDistanceToNow } from "date-fns";

const Notifications = () => {
  const { address } = useAccount();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!address) return;

    const unsubscribe = getNotifications(address, newNotifications => {
      // Sort notifications by date (newest first)
      const sortedNotifications = [...newNotifications].sort(
        (a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
      );
      setNotifications(sortedNotifications);
    });

    return () => unsubscribe();
  }, [address]);

  const getNotificationMessage = (notification: Notification) => {
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
        return `You earned ${notification.xpAmount} XP!`;
      default:
        return notification.message;
    }
  };

  return (
    <div className="px-[320px] lg:px-[220px] md:px-[160px] tablet-notifications:px-[100px] sm:px-[16px] pt-[120px] sm:pt-[90px]">
      <button className="rounded-[8px] bg-[#E4E4E7] text-black px-[16px] py-[7px] sm:px-[14px] sm:py-[4px] text-[14px] w-fit h-fit cursor-pointer mb-[9px]">
        All Notifications
      </button>
      <div className="notification-box rounded-[16px] border-[1px] border-[#E4E4E7] px-[16px] py-[12px] flex flex-col gap-[9px] mb-[20px]">
        {notifications.length === 0 ? (
          <div className="p-[16px] flex items-center justify-center bg-white rounded-[8px] h-fit relative border-[1px] border-[#E4E4E7]">
            <span className="font-medium text-[14px] leading-[16.94px] text-gray-500">
              No notifications yet
            </span>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-[16px] flex items-center pl-[32px] sm:pl-[16px] bg-white rounded-[8px] h-fit relative border-[1px] border-[#E4E4E7] hover:bg-[#F0F0F0] cursor-pointer ${
                !notification.read ? "bg-[#F8F8F8]" : ""
              }`}
            >
              <Image
                src={"/images/add-file.svg"}
                alt="notification icon"
                className="mr-[32px] sm:mr-[12px] sm:w-[20px] sm:h-[20px]"
                width={24}
                height={24}
              />
              <div className="flex flex-col gap-[8px]">
                <span className="font-medium text-[14px] leading-[16.94px]">
                  {getNotificationMessage(notification)}
                </span>
              </div>
              <span className="absolute right-[16px] top-[12px] text-[12px] sm:hidden">
                {formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true })}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
