"use client";

import { LoginForm } from "@/components/common/header/loginForm";
import { SwitchForm } from "@/components/common/header/switchProfileModal";
import { useSelector } from "react-redux";
import { useAccount } from "wagmi";
import AlertModal from "@/components/common/Alert";
import TransactionLoader from "@/components/common/TransactionLoader";

export default function ModalWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { loginModal, switchModal } = useSelector((state: any) => state.app);
  const { displayAlert, alertData, displaytransactionLoader, loaderText } =
    useSelector((state: any) => state.alerts);
  const { address } = useAccount();

  return (
    <div className="flex flex-col min-h-screen">
      {children}
      {loginModal && !switchModal && address && <LoginForm owner={address} />}
      {switchModal && address && <SwitchForm owner={address} />}
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
    </div>
  );
}
