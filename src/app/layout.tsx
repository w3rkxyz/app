"use client";

import "./globals.css";
import ConditionalNav from "@/components/common/header/conditionalNav";
import { Toaster } from "react-hot-toast";
import ClientProvider from "./_clientProvider";
import ModalWrapper from "./_modalWrapper";
import Footer from "@/components/common/footer/footer";
import { Web3Provider } from "./Web3Provider";

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
        <Web3Provider>
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
        </Web3Provider>
      </body>
    </html>
  );
}
