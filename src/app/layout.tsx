"use client";

import type { AppProps } from "next/app";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ConditionalNav from "@/components/common/header/conditionalNav";
import "@rainbow-me/rainbowkit/styles.css";
import ContextProvider from "./_context";
import { Toaster } from "react-hot-toast";
import ClientProvider from "./_clientProvider";
import ModalWrapper from "./_modalWrapper";
import Footer from "@/components/common/footer/footer";

// export const metadata: Metadata = {
//   title: "w3rk - Web3 Freelancing Marketplace",
//   description: "Connecting Web3 businesses and freelancers globally on-chain.",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ClientProvider>
          <ContextProvider>
            <ModalWrapper>
              <ConditionalNav />
              <main className="main-w3rk-content-wrapper">
                {children}
                <Toaster />
              </main>
              <Footer />
            </ModalWrapper>
          </ContextProvider>
        </ClientProvider>
      </body>
    </html>
  );
}
