"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ConnectKitButton } from "connectkit";
import { useAuthenticatedUser, useAccount as useLensAccount } from "@lens-protocol/react";
import { useAccount as useWagmiAccount } from "wagmi";
import { displayLoginModal } from "@/redux/app";

const LoginLanding = () => {
  const dispatch = useDispatch();
  const { isConnected } = useWagmiAccount();
  const { data: authenticatedUser, loading: authUserLoading } = useAuthenticatedUser();
  const { data: account, loading: accountLoading } = useLensAccount({
    address: authenticatedUser?.address,
  });
  const [loginPrompted, setLoginPrompted] = useState(false);

  const userHandle = account?.username?.localName;
  const checkingSession = authUserLoading || accountLoading;

  useEffect(() => {
    if (!isConnected) {
      setLoginPrompted(false);
      return;
    }

    if (checkingSession || userHandle || loginPrompted) {
      return;
    }

    setLoginPrompted(true);
    dispatch(displayLoginModal({ display: true }));
  }, [checkingSession, dispatch, isConnected, loginPrompted, userHandle]);

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#F8FAFC] pt-[92px] pb-[32px]">
      <div className="pointer-events-none absolute -top-[220px] -right-[120px] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,_rgba(129,140,248,0.24),_rgba(129,140,248,0)_70%)]" />
      <div className="pointer-events-none absolute -bottom-[260px] -left-[180px] h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,_rgba(34,211,238,0.19),_rgba(34,211,238,0)_70%)]" />

      <div className="mx-auto grid w-full max-w-[1240px] grid-cols-2 gap-[48px] px-[24px] lg:grid-cols-1 lg:gap-[28px] sm:px-[16px]">
        <div className="relative rounded-[28px] border border-[#E2E8F0] bg-white/85 p-[44px] shadow-[0_24px_70px_rgba(15,23,42,0.14)] backdrop-blur sm:rounded-[18px] sm:p-[20px]">
          <span className="inline-flex rounded-full border border-[#D6E3FF] bg-[#EEF4FF] px-[12px] py-[6px] text-[12px] font-semibold uppercase tracking-[0.04em] text-[#1D4ED8]">
            Login / Sign-up
          </span>
          <h1 className="mt-[18px] text-[50px] font-semibold leading-[1.02] tracking-[-0.03em] text-[#0F172A] lg:text-[40px] sm:text-[32px]">
            Start freelancing with one secure wallet flow.
          </h1>
          <p className="mt-[18px] max-w-[560px] text-[17px] leading-[1.55] text-[#475569] sm:text-[15px]">
            Connect with Family and continue with your Lens profile in one smooth step. No
            backend changes, just a cleaner login experience.
          </p>

          <div className="mt-[30px] flex w-full max-w-[420px] flex-col gap-[12px]">
            <ConnectKitButton.Custom>
              {({ isConnected: walletConnected, show }) => {
                if (walletConnected && checkingSession) {
                  return (
                    <button
                      type="button"
                      disabled
                      className="h-[52px] w-full rounded-[14px] bg-[#0F172A] px-[20px] text-[16px] font-semibold text-white/90 disabled:cursor-not-allowed disabled:opacity-80"
                    >
                      Checking profile...
                    </button>
                  );
                }

                if (walletConnected && userHandle) {
                  return (
                    <Link
                      href={`/u/${userHandle}`}
                      className="flex h-[52px] w-full items-center justify-center rounded-[14px] bg-[#0F172A] px-[20px] text-[16px] font-semibold text-white transition hover:bg-[#1E293B]"
                    >
                      Continue to Dashboard
                    </Link>
                  );
                }

                if (walletConnected) {
                  return (
                    <button
                      type="button"
                      onClick={() => dispatch(displayLoginModal({ display: true }))}
                      className="h-[52px] w-full rounded-[14px] bg-[#0F172A] px-[20px] text-[16px] font-semibold text-white transition hover:bg-[#1E293B]"
                    >
                      Complete Lens Login
                    </button>
                  );
                }

                return (
                  <button
                    type="button"
                    onClick={show}
                    className="h-[52px] w-full rounded-[14px] bg-[#0F172A] px-[20px] text-[16px] font-semibold text-white transition hover:bg-[#1E293B]"
                  >
                    Continue with Family
                  </button>
                );
              }}
            </ConnectKitButton.Custom>

            <p className="text-[13px] leading-[1.45] text-[#64748B]">
              Wallet choices including MetaMask, Phantom, and Coinbase are available in the next
              step.
            </p>
          </div>
        </div>

        <div className="relative flex min-h-[580px] items-center justify-center rounded-[28px] border border-[#E2E8F0] bg-[linear-gradient(150deg,#0F172A_0%,#172554_53%,#1E293B_100%)] p-[28px] shadow-[0_24px_70px_rgba(2,6,23,0.35)] sm:min-h-[430px] sm:rounded-[18px] sm:p-[16px]">
          <div className="absolute left-[30px] top-[32px] flex items-center gap-[10px] rounded-full border border-white/25 bg-white/10 px-[14px] py-[7px] text-[13px] text-white/90 backdrop-blur">
            <span className="inline-block h-[7px] w-[7px] rounded-full bg-[#22C55E]" />
            Wallet-ready onboarding
          </div>

          <div className="absolute right-[22px] top-[94px] rounded-[18px] border border-white/25 bg-white/10 px-[18px] py-[12px] backdrop-blur">
            <p className="text-[12px] font-medium text-white/80">Single profile</p>
            <p className="mt-[6px] text-[17px] font-semibold text-white">Auto-login</p>
          </div>

          <div className="absolute left-[20px] bottom-[88px] rounded-[18px] border border-white/25 bg-white/10 px-[18px] py-[12px] backdrop-blur sm:left-[14px] sm:bottom-[72px]">
            <p className="text-[12px] font-medium text-white/80">No profile</p>
            <p className="mt-[6px] text-[17px] font-semibold text-white">Inline mint flow</p>
          </div>

          <div className="relative flex h-[330px] w-[330px] items-center justify-center rounded-full border border-white/20 bg-white/10 sm:h-[248px] sm:w-[248px]">
            <div className="relative h-[244px] w-[244px] overflow-hidden rounded-full border border-white/25 bg-white/10 sm:h-[182px] sm:w-[182px]">
              <Image src="/images/logo.png" alt="W3rk logo" fill className="object-cover" />
            </div>
          </div>

          <div className="absolute bottom-[34px] left-1/2 flex -translate-x-1/2 items-center gap-[10px] rounded-full border border-white/25 bg-white/10 px-[14px] py-[7px] text-[13px] text-white/90 backdrop-blur">
            <Image src="/images/Lenshead_4.png" alt="Lens user" width={26} height={26} className="rounded-full" />
            <span>Lens profile authentication</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginLanding;
