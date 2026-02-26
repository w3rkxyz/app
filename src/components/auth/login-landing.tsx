"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { ConnectKitButton } from "connectkit";
import { useAccount as useWagmiAccount, useConnect, useDisconnect } from "wagmi";
import { toast } from "react-hot-toast";
import { displayLoginModal } from "@/redux/app";
import profilePreviewImage from "../../../attached_assets/profile.preview.image.png.png";
import styles from "./login-landing.module.css";

type WalletOption = "metamask" | "rabby" | "rainbow" | "other";
type DirectWalletOption = Exclude<WalletOption, "other">;

const walletButtons: Array<{ id: DirectWalletOption; label: string }> = [
  { id: "metamask", label: "MetaMask" },
  { id: "rabby", label: "Rabby" },
  { id: "rainbow", label: "Rainbow Wallet" },
];

const getWalletLabel = (wallet: DirectWalletOption) => {
  if (wallet === "metamask") return "MetaMask";
  if (wallet === "rabby") return "Rabby Wallet";
  return "Rainbow Wallet";
};

const WalletIcon = ({ wallet }: { wallet: DirectWalletOption }) => {
  if (wallet === "metamask") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.walletGlyph}>
        <path d="M12 2l-5 8 2 10h6l2-10-5-8z" fill="#F6851B" />
        <path d="M7 10l5-2 5 2-5 10-5-10z" fill="#E2761B" />
      </svg>
    );
  }

  if (wallet === "rabby") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.walletGlyph}>
        <path d="M12 2l8 4.5v11L12 22l-8-4.5v-11L12 2z" fill="#7088FF" />
        <path d="M12 6l4 2.2v5.6L12 16l-4-2.2V8.2L12 6z" fill="#FFFFFF" opacity="0.9" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.walletGlyph}>
      <path d="M4 13a8 8 0 0116 0H4z" fill="#FF4B4B" />
      <path d="M5 16a7 7 0 0114 0H5z" fill="#FF9F1A" />
      <path d="M6 19a6 6 0 0112 0H6z" fill="#34C759" />
      <circle cx="12" cy="16.5" r="1.5" fill="#3B82F6" />
    </svg>
  );
};

const LoginLanding = () => {
  const dispatch = useDispatch();
  const { isConnected, connector: activeConnector } = useWagmiAccount();
  const { connectAsync, connectors } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const [pendingFamilyConnect, setPendingFamilyConnect] = useState(false);

  const triggerLoginFlow = useCallback(() => {
    dispatch(displayLoginModal({ display: true }));
  }, [dispatch]);

  useEffect(() => {
    if (!pendingFamilyConnect || !isConnected) {
      return;
    }

    setPendingFamilyConnect(false);
    triggerLoginFlow();
  }, [isConnected, pendingFamilyConnect, triggerLoginFlow]);

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
      setPendingFamilyConnect(false);

      if (wallet === "other") {
        setPendingFamilyConnect(!isConnected);
        showWalletModal();
        return;
      }

      const targets = connectorCandidates[wallet];
      if (!targets.length) {
        toast.error(`${getWalletLabel(wallet)} not available`);
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
        walletKeywords[wallet].some(keyword => {
          const id = activeConnector.id.toLowerCase();
          const name = activeConnector.name.toLowerCase();
          return id.includes(keyword) || name.includes(keyword);
        });

      if (isActiveWalletMatch) {
        triggerLoginFlow();
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
          triggerLoginFlow();
          return;
        } catch {
          // Try next connector candidate for this wallet.
        }
      }

      toast.error(`Unable to connect ${getWalletLabel(wallet)}`);
    },
    [
      activeConnector,
      connectAsync,
      connectorCandidates,
      disconnectAsync,
      isConnected,
      triggerLoginFlow,
    ]
  );

  return (
    <ConnectKitButton.Custom>
      {({ show }) => {
        const onFamilyClick = () => {
          setPendingFamilyConnect(!isConnected);
          show();
        };

        const onWalletClick = (wallet: DirectWalletOption) => {
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
                    <h1 className={styles.title}>Sign in with Wallet</h1>
                    <p className={styles.subtitle}>
                      Continue with a wallet to access your on-chain profile.
                    </p>

                    <button type="button" className={styles.primaryButton} onClick={onFamilyClick}>
                      Continue with Family
                    </button>

                    <div className={styles.divider}>
                      <span>Or select a wallet from the list below</span>
                    </div>

                    <div className={styles.walletList}>
                      {walletButtons.map(wallet => (
                        <button
                          key={wallet.id}
                          type="button"
                          className={styles.walletButton}
                          onClick={() => onWalletClick(wallet.id)}
                        >
                          <span className={styles.walletIconWrap}>
                            <WalletIcon wallet={wallet.id} />
                          </span>
                          <span>{wallet.label}</span>
                        </button>
                      ))}
                    </div>

                    <p className={styles.signupText}>
                      Don&apos;t have an account?{" "}
                      <button type="button" className={styles.signupAction} onClick={onFamilyClick}>
                        Sign up
                      </button>
                    </p>
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
            </div>
          </section>
        );
      }}
    </ConnectKitButton.Custom>
  );
};

export default LoginLanding;
