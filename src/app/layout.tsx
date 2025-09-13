"use client";

import "./globals.css";
import ConditionalNav from "@/components/common/header/conditionalNav";
import { Toaster } from "react-hot-toast";
import ClientProvider from "./_clientProvider";
import ModalWrapper from "./_modalWrapper";
import Footer from "@/components/common/footer/footer";
import dynamic from "next/dynamic";

const AppProvider = dynamic(() => import("./AppProvider"), { ssr: false });

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
        <AppProvider>
          <ClientProvider>
            <ModalWrapper>
              <ConditionalNav />
              <main className="main-w3rk-content-wrapper">
                {children}
                <Toaster />
              </main>
              <Footer />
            </ModalWrapper>
          </ClientProvider>
        </AppProvider>
      </body>
    </html>
  );
}
