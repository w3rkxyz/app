"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { ConnectKitButton } from "connectkit";
import { useAccount as useWagmiAccount, useConnect, useDisconnect } from "wagmi";
import { toast } from "react-hot-toast";
import { displayLoginModal } from "@/redux/app";
import styles from "./login-landing.module.css";

type WalletOption = "metamask" | "rabby" | "rainbow" | "other";
type DirectWalletOption = Exclude<WalletOption, "other">;

const walletButtons: Array<{
  id: DirectWalletOption;
  label: string;
  icon: string;
  size: number;
}> = [
  { id: "metamask", label: "MetaMask", icon: "/icons/wallets/metamask.svg", size: 20 },
  { id: "rabby", label: "Rabby", icon: "/icons/wallets/rabby.svg", size: 20 },
  { id: "rainbow", label: "Rainbow Wallet", icon: "/icons/wallets/rainbow.svg", size: 20 },
];

const getWalletLabel = (wallet: DirectWalletOption) => {
  if (wallet === "metamask") return "MetaMask";
  if (wallet === "rabby") return "Rabby Wallet";
  return "Rainbow Wallet";
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
        const openWalletModal = () => {
          show?.();
        };

        const onFamilyClick = () => {
          setPendingFamilyConnect(!isConnected);
          openWalletModal();
        };

        const onWalletClick = (wallet: DirectWalletOption) => {
          void connectSpecificWallet(wallet, openWalletModal);
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
                  <div className={styles.leftRail}>
                    <div className={styles.leftPanel}>
                      <h1 className={styles.title}>Login with Wallet</h1>

                      <button type="button" className={styles.primaryButton} onClick={onFamilyClick}>
                        <span className={styles.primaryButtonInner}>
                          <Image
                            src="/icons/wallets/family.svg"
                            alt=""
                            width={16}
                            height={16}
                            className={styles.familyIcon}
                            aria-hidden="true"
                          />
                          <span>Continue with Family</span>
                        </span>
                      </button>

                      <div className={styles.divider}>
                        <span>or</span>
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
                              <Image
                                src={wallet.icon}
                                alt=""
                                width={wallet.size}
                                height={wallet.size}
                                className={styles.walletGlyph}
                                aria-hidden="true"
                              />
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
                </div>

                <div className={styles.rightColumn}>
                  <div className={styles.rightPanel}>
                    <Image
                      src="/images/profile-preview-login.png"
                      alt="Product preview panel"
                      width={1231}
                      height={781}
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
