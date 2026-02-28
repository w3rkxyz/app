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
      case "contract_proposal":
        return `@${notification.senderHandle || "Someone"} has sent you a contract offer!`;
      case "contract_started":
        return `@${notification.senderHandle || "Someone"} accepted your contract proposal.`;
      case "payment_requested":
        return `@${notification.senderHandle || "Someone"} requested contract payment.`;
      case "contract_completed":
        return `@${notification.senderHandle || "Someone"} marked the contract as completed.`;
      case "contract_cancelled":
        return `@${notification.senderHandle || "Someone"} cancelled the contract.`;
      case "escrow_funded":
        return "Escrow has been funded for your contract.";
      case "escrow_released":
        return "Escrow payment has been released.";
      default:
        return notification.message;
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case "contract_proposal":
        return "New Contract Offer";
      case "contract_started":
        return "Contract Started";
      case "payment_requested":
        return "Payment Requested";
      case "contract_completed":
        return "Contract Completed";
      case "contract_cancelled":
        return "Contract Cancelled";
      case "escrow_funded":
        return "Escrow Funded";
      case "escrow_released":
        return "Escrow Released";
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
