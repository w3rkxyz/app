import React, { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Notification, getNotifications } from "@/utils/firebase";
import NotificationPopup from "./NotificationPopup";

interface ModalWrapperProps {
  children: React.ReactNode;
}

const ModalWrapper: React.FC<ModalWrapperProps> = ({ children }) => {
  const { address } = useAccount();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeNotification, setActiveNotification] = useState<Notification | null>(null);

  useEffect(() => {
    if (!address) return;

    const unsubscribe = getNotifications(address, newNotifications => {
      // Filter for unread notifications
      const unreadNotifications = newNotifications.filter(n => !n.read);
      setNotifications(unreadNotifications);
    });

    return () => unsubscribe();
  }, [address]);

  useEffect(() => {
    if (notifications.length > 0 && !activeNotification) {
      // Show the first unread notification
      setActiveNotification(notifications[0]);
    }
  }, [notifications, activeNotification]);

  const handleNotificationClose = () => {
    setActiveNotification(null);
    // Remove the shown notification from the queue
    setNotifications(prev => prev.slice(1));
  };

  return (
    <>
      {children}
      {activeNotification && (
        <NotificationPopup notification={activeNotification} onClose={handleNotificationClose} />
      )}
    </>
  );
};

export default ModalWrapper;
