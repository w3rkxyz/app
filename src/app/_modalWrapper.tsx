"use client";

import LoginForm from "@/components/common/header/loginForm";
import { SwitchForm } from "@/components/common/header/switchProfileModal";
import { useSelector } from "react-redux";
import { useAccount } from "wagmi";
import AlertModal from "@/components/common/Alert";
import TransactionLoader from "@/components/common/TransactionLoader";
import { useEffect, useState } from "react";
// import { Notification, getNotifications } from "@/utils/firebase";
import NotificationPopup from "@/components/common/NotificationPopup";
// import { useXMTPClient } from "@/hooks/useXMTPClient";
import { RootState } from "@/redux/store";

export default function ModalWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { loginModal, switchModal, user: profile } = useSelector((state: any) => state.app);

  const { displayAlert, alertData, displaytransactionLoader, loaderText } = useSelector(
    (state: any) => state.alerts
  );
  const { client } = useSelector((state: RootState) => state.xmtp);
  const { address, isConnected } = useAccount();
  // const { initXMTPClient } = useXMTPClient(address as string);
  // const [notifications, setNotifications] = useState<Notification[]>([]);
  // const [activeNotification, setActiveNotification] = useState<Notification | null>(null);

  // useEffect(() => {
  //   if (!address) return;

  //   const unsubscribe = getNotifications(address, newNotifications => {
  //     // Filter for unread notifications
  //     const unreadNotifications = newNotifications.filter(n => !n.read);
  //     setNotifications(unreadNotifications);
  //   });

  //   return () => unsubscribe();
  // }, [address]);

  // useEffect(() => {
  //   if (notifications.length > 0 && !activeNotification) {
  //     // Show the first unread notification
  //     setActiveNotification(notifications[0]);
  //   }
  // }, [notifications, activeNotification]);

  // const handleNotificationClose = () => {
  //   setActiveNotification(null);
  //   // Remove the shown notification from the queue
  //   setNotifications(prev => prev.slice(1));
  // };

  // // Initalises the XMTP client
  // useEffect(() => {
  //   if (isConnected && profile && client) {
  //     initXMTPClient();
  //   }
  // }, [isConnected, profile, initXMTPClient, client]);

  return (
    <div className="flex flex-col min-h-screen">
      {children}
      {loginModal && !switchModal && address && <LoginForm owner={address} />}
      {switchModal && address && <SwitchForm />}
      {displayAlert && (
        <div className="fixed right-[30px] top-[30px] z-[999999999999]">
          <AlertModal {...alertData} />
        </div>
      )}
      {displaytransactionLoader && (
        <div className="fixed right-[30px] top-[30px] z-[999999999999]">
          <TransactionLoader {...alertData} text={loaderText} />
        </div>
      )}
      {/* {activeNotification && (
        <div className="fixed right-[30px] top-[30px] z-[999999999999]">
          <NotificationPopup notification={activeNotification} onClose={handleNotificationClose} />
        </div>
      )} */}
    </div>
  );
}
