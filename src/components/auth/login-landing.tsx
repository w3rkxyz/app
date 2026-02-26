"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { ConnectKitButton } from "connectkit";
import { useAccount as useWagmiAccount, useConnect, useDisconnect } from "wagmi";
import { toast } from "react-hot-toast";
import { displayLoginModal, setLoginIntent } from "@/redux/app";
import loginDesktopLeft from "../../../attached_assets/login-desktop-left.png";
import profilePreviewImage from "../../../attached_assets/profile.preview.image.png.png";
import loginMobile from "../../../attached_assets/login-mobile.png";
import styles from "./login-landing.module.css";

type WalletOption = "metamask" | "rabby" | "rainbow" | "other";
type DirectWalletOption = Exclude<WalletOption, "other">;
type LoginIntent = "login" | "signup";

type HitArea = {
  left: string;
  top: string;
  width: string;
  height: string;
};

const DESKTOP_FAMILY_AREA: HitArea = {
  left: "18.194%",
  top: "28.516%",
  width: "63.611%",
  height: "5.469%",
};

const DESKTOP_WALLET_AREAS: Record<WalletOption, HitArea> = {
  metamask: { left: "18.194%", top: "40.625%", width: "63.611%", height: "6.201%" },
  rabby: { left: "18.194%", top: "48.438%", width: "63.611%", height: "6.201%" },
  rainbow: { left: "18.194%", top: "56.250%", width: "63.611%", height: "6.201%" },
  other: { left: "18.194%", top: "64.063%", width: "63.611%", height: "6.641%" },
};

const MOBILE_FAMILY_AREA: HitArea = {
  left: "13.023%",
  top: "23.810%",
  width: "73.953%",
  height: "5.128%",
};

const MOBILE_WALLET_AREAS: Record<WalletOption, HitArea> = {
  metamask: { left: "13.023%", top: "35.165%", width: "73.953%", height: "5.815%" },
  rabby: { left: "13.023%", top: "42.491%", width: "73.953%", height: "5.815%" },
  rainbow: { left: "13.023%", top: "49.817%", width: "73.953%", height: "5.815%" },
  other: { left: "13.023%", top: "57.143%", width: "73.953%", height: "6.177%" },
};

const walletLabels: Record<DirectWalletOption, string> = {
  metamask: "MetaMask",
  rabby: "Rabby Wallet",
  rainbow: "Rainbow Wallet",
};

const LoginLanding = () => {
  const dispatch = useDispatch();
  const { isConnected, connector: activeConnector } = useWagmiAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const [pendingIntent, setPendingIntent] = useState<LoginIntent | null>(null);

  const triggerLoginFlow = useCallback(
    (intent: LoginIntent) => {
      dispatch(setLoginIntent({ intent }));
      dispatch(displayLoginModal({ display: true }));
    },
    [dispatch]
  );

  useEffect(() => {
    if (!pendingIntent || !isConnected) {
      return;
    }

    const intent = pendingIntent;
    setPendingIntent(null);
    triggerLoginFlow(intent);
  }, [isConnected, pendingIntent, triggerLoginFlow]);

  const connectorCandidates = useMemo(() => {
    const pickAll = (keywords: string[]) =>
      connectors.filter(connector => {
        const id = connector.id.toLowerCase();
        const name = connector.name.toLowerCase();
        return keywords.some(keyword => id.includes(keyword) || name.includes(keyword));
      });

    const metamaskPrimary = pickAll(["metamask", "meta mask"]);
    const injected = pickAll(["injected"]);
    const metamask = [
      ...metamaskPrimary,
      ...injected.filter(
        connector =>
          !metamaskPrimary.some(
            selected => selected.id === connector.id && selected.name === connector.name
          )
      ),
    ];

    return {
      metamask,
      rabby: pickAll(["rabby"]),
      rainbow: pickAll(["rainbow"]),
    };
  }, [connectors]);

  const connectSpecificWallet = useCallback(
    async (wallet: WalletOption, showWalletModal: () => void) => {
      setPendingIntent(null);

      if (wallet === "other") {
        if (isConnected) {
          triggerLoginFlow("login");
          return;
        }

        setPendingIntent("login");
        showWalletModal();
        return;
      }

      const directWallet: DirectWalletOption = wallet;
      const targets = connectorCandidates[directWallet];
      if (!targets.length) {
        toast.error(`${walletLabels[directWallet]} not available`);
        return;
      }

      const walletKeywords: Record<DirectWalletOption, string[]> = {
        metamask: ["metamask", "meta mask"],
        rabby: ["rabby"],
        rainbow: ["rainbow"],
      };

      const isActiveWalletMatch =
        isConnected &&
        activeConnector &&
        walletKeywords[directWallet].some(keyword => {
          const id = activeConnector.id.toLowerCase();
          const name = activeConnector.name.toLowerCase();
          return id.includes(keyword) || name.includes(keyword);
        });

      if (isActiveWalletMatch) {
        triggerLoginFlow("login");
        return;
      }

      if (isConnected && !isActiveWalletMatch) {
        try {
          await disconnectAsync();
        } catch {
          // Best-effort disconnect before switching wallet connectors.
        }
      }

      for (const target of targets) {
        try {
          await connectAsync({ connector: target });
          triggerLoginFlow("login");
          return;
        } catch {
          // Try next connector candidate for this wallet.
        }
      }

      toast.error(`Unable to connect ${walletLabels[directWallet]}`);
    },
    [activeConnector, connectAsync, connectorCandidates, disconnectAsync, isConnected, triggerLoginFlow]
  );

  const renderHitButton = (
    label: string,
    area: HitArea,
    onClick: () => void,
    radius = "14px"
  ) => (
    <button
      key={`${label}-${area.top}-${area.left}`}
      type="button"
      aria-label={label}
      onClick={onClick}
      className="absolute bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-[#0F172A] focus-visible:ring-offset-2"
      style={{
        left: area.left,
        top: area.top,
        width: area.width,
        height: area.height,
        borderRadius: radius,
      }}
    />
  );

  return (
    <ConnectKitButton.Custom>
      {({ show }) => {
        const onFamilyClick = () => {
          if (isConnected) {
            triggerLoginFlow("login");
            return;
          }

          setPendingIntent("login");
          show();
        };

        const onSignUpClick = () => {
          if (isConnected) {
            triggerLoginFlow("signup");
            return;
          }

          setPendingIntent("signup");
          show();
        };

        const onWalletClick = (wallet: WalletOption) => {
          void connectSpecificWallet(wallet, show);
        };

        return (
          <section className={styles.page}>
            <div className={styles.pageLogo} aria-hidden="true">
              <Image
                src="/images/brand-logo.svg"
                alt=""
                width={214}
                height={78}
                className={styles.brandLogo}
                priority
              />
            </div>

            <div className={styles.container}>
              <div className={styles.desktopGrid}>
                <div className={styles.leftColumn}>
                  <div className={styles.leftPanel}>
                    <Image
                      src={loginDesktopLeft}
                      alt="Login wallet panel"
                      fill
                      priority
                      className={styles.panelImage}
                      sizes="(max-width: 767px) 0px, (max-width: 1024px) 540px, 600px"
                    />

                    <div className={styles.desktopTitle}>Login with your Lens account</div>
                    <div className={styles.desktopSignup}>
                      <span>Don&apos;t have an account?</span>
                      <button type="button" onClick={onSignUpClick} className={styles.inlineAction}>
                        Sign Up
                      </button>
                    </div>

                    {renderHitButton("Continue with Family", DESKTOP_FAMILY_AREA, onFamilyClick, "24px")}
                    {renderHitButton("Connect MetaMask", DESKTOP_WALLET_AREAS.metamask, () =>
                      onWalletClick("metamask")
                    )}
                    {renderHitButton("Connect Rabby Wallet", DESKTOP_WALLET_AREAS.rabby, () =>
                      onWalletClick("rabby")
                    )}
                    {renderHitButton("Connect Rainbow Wallet", DESKTOP_WALLET_AREAS.rainbow, () =>
                      onWalletClick("rainbow")
                    )}
                    {renderHitButton("Connect Other Wallet", DESKTOP_WALLET_AREAS.other, () =>
                      onWalletClick("other")
                    )}
                  </div>
                </div>

                <div className={styles.rightColumn}>
                  <div className={styles.rightPanel}>
                    <Image
                      src={profilePreviewImage}
                      alt="Product preview panel"
                      priority
                      className={styles.rightImage}
                      sizes="(max-width: 767px) 0px, (max-width: 1024px) 760px, 1100px"
                    />
                  </div>
                </div>
              </div>

              <div className={styles.mobileWrap}>
                <div className={styles.mobilePanel}>
                  <Image
                    src={loginMobile}
                    alt="Mobile login wallet panel"
                    fill
                    priority
                    className={styles.panelImage}
                    sizes="100vw"
                  />

                  <div className={styles.mobileTitle}>Login with your Lens account</div>
                  <div className={styles.mobileSignup}>
                    <span>Don&apos;t have an account?</span>
                    <button type="button" onClick={onSignUpClick} className={styles.inlineAction}>
                      Sign Up
                    </button>
                  </div>

                  {renderHitButton("Continue with Family", MOBILE_FAMILY_AREA, onFamilyClick, "24px")}
                  {renderHitButton("Connect MetaMask", MOBILE_WALLET_AREAS.metamask, () =>
                    onWalletClick("metamask")
                  )}
                  {renderHitButton("Connect Rabby Wallet", MOBILE_WALLET_AREAS.rabby, () =>
                    onWalletClick("rabby")
                  )}
                  {renderHitButton("Connect Rainbow Wallet", MOBILE_WALLET_AREAS.rainbow, () =>
                    onWalletClick("rainbow")
                  )}
                  {renderHitButton("Connect Other Wallet", MOBILE_WALLET_AREAS.other, () =>
                    onWalletClick("other")
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      }}
    </ConnectKitButton.Custom>
  );
};

export default LoginLanding;
