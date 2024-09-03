"use client";

import { LoginForm } from "@/components/common/header/loginForm";
import { useSelector } from "react-redux";
import { useAccount } from "wagmi";

export default function ModalWrapper({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { loginModal } = useSelector((state: any) => state.app);
  const { address } = useAccount();

  return (
    <div className="flex flex-col min-h-screen">
      {children}
      {loginModal && address && <LoginForm owner={address} />}
    </div>
  );
}
