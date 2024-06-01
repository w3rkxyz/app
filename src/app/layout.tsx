import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/common/header/navbar";
import Footer from "@/components/common/footer/footer";
import SecondNav from "@/components/common/header/secondNav";
import ConditionalNav from "@/components/common/header/conditionalNav";
import "@rainbow-me/rainbowkit/styles.css";
import { ContextProvider } from "./context";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "w3rk - Web3 Freelancing Marketplace",
  description: "Connecting Web3 businesses and freelancers globally on-chain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ContextProvider>
          <ConditionalNav />
          <main className="main-w3rk-content-wrapper">
            {children} <Toaster />
          </main>
          <Footer />
        </ContextProvider>
      </body>
    </html>
  );
}
