import React, { useEffect, useState } from "react";
import { Notification } from "@/utils/notifications";

interface NotificationPopupProps {
  notification: Notification;
  onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation to complete
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getNotificationMessage = (notification: Notification) => {
    switch (notification.type) {
      case "contract_offer":
        return `@${notification.senderHandle || "Someone"} has sent you a contract offer!`;
      case "contract_accepted":
        return `@${notification.senderHandle || "Someone"} has accepted your contract offer!`;
      case "contract_declined":
        return `@${notification.senderHandle || "Someone"} has declined your contract offer`;
      case "contract_stage_updated":
        return `@${notification.senderHandle || "Someone"} has updated the contract status`;
      case "contract_completed":
        return `@${notification.senderHandle || "Someone"} has completed the contract`;
      case "xp_earned":
        return `You earned ${notification.xpAmount} XP!`;
      default:
        return notification.message;
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case "contract_offer":
        return "New Contract Offer";
      case "contract_accepted":
        return "Contract Accepted";
      case "contract_declined":
        return "Contract Declined";
      case "contract_stage_updated":
        return "Contract Updated";
      case "contract_completed":
        return "Contract Completed";
      case "xp_earned":
        return "XP Earned";
      default:
        return "Notification";
    }
  };

  return (
    <div className="bg-white rounded-[12px] overflow-hidden border-[1px] border-[#E4E4E7] w-[281px]">
      <div className="border-b-[1px] border-b-[#E4E4E7] w-full pl-[16px] py-[12px]">
        <span className="font-medium text-[14px] text-[#707070]">
          {getNotificationTitle(notification.type)}
        </span>
      </div>
      <div className="pl-[16px] pr-[9px] py-[11px] w-full flex items-center">
        <span className="font-medium text-[14px] text-black">
          {getNotificationMessage(notification)}
        </span>
      </div>
    </div>
  );
};

export default NotificationPopup;
