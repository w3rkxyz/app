"use client";

import { LoginForm } from "@/components/common/header/loginForm";
import { SwitchForm } from "@/components/common/header/switchProfileModal";
import { useSelector } from "react-redux";
import { useAccount } from "wagmi";

export default function ModalWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { loginModal, switchModal } = useSelector((state: any) => state.app);
  const { address } = useAccount();

  return (
    <div className="flex flex-col min-h-screen">
      {children}
      {loginModal && !switchModal && address && <LoginForm owner={address} />}
      {switchModal && address && <SwitchForm owner={address} />}
    </div>
  );
}
