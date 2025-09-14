"use client";

import "./globals.css";
import ConditionalNav from "@/components/common/header/conditionalNav";
import { Toaster } from "react-hot-toast";
import ClientProvider from "./_clientProvider";
import ModalWrapper from "./_modalWrapper";
import Footer from "@/components/common/footer/footer";
import ExtensionErrorBoundary from "@/components/common/ExtensionErrorBoundary";
import HydrationFix from "@/components/common/HydrationFix";
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
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Aggressive extension interference prevention
              (function() {
                // Override console methods to filter extension errors
                const originalError = console.error;
                const originalWarn = console.warn;
                
                console.error = function(...args) {
                  const message = args.join(' ');
                  if (message.includes('chrome-extension://') || 
                      message.includes('Host validation failed') ||
                      message.includes('Host is not supported') ||
                      message.includes('nighthawk') ||
                      message.includes('Hydration failed')) {
                    return; // Suppress extension errors
                  }
                  originalError.apply(console, args);
                };
                
                console.warn = function(...args) {
                  const message = args.join(' ');
                  if (message.includes('chrome-extension://') || 
                      message.includes('Host validation failed') ||
                      message.includes('Host is not supported') ||
                      message.includes('nighthawk') ||
                      message.includes('Hydration failed')) {
                    return; // Suppress extension warnings
                  }
                  originalWarn.apply(console, args);
                };
                
                // Block extension script injection
                const originalAppendChild = Node.prototype.appendChild;
                const originalInsertBefore = Node.prototype.insertBefore;
                
                Node.prototype.appendChild = function(child) {
                  if (child && child.src && child.src.includes('chrome-extension://')) {
                    return child;
                  }
                  return originalAppendChild.call(this, child);
                };
                
                Node.prototype.insertBefore = function(newNode, referenceNode) {
                  if (newNode && newNode.src && newNode.src.includes('chrome-extension://')) {
                    return newNode;
                  }
                  return originalInsertBefore.call(this, newNode, referenceNode);
                };
                
                // Remove extension elements immediately
                function removeExtensionElements() {
                  const extensionElements = document.querySelectorAll('[id*="nighthawk"], [class*="nighthawk"], [id*="chrome-extension"]');
                  extensionElements.forEach(el => {
                    if (el.parentNode) {
                      el.parentNode.removeChild(el);
                    }
                  });
                }
                
                // Run immediately and on DOM changes
                removeExtensionElements();
                
                // Watch for extension elements being added
                const observer = new MutationObserver(function(mutations) {
                  mutations.forEach(function(mutation) {
                    mutation.addedNodes.forEach(function(node) {
                      if (node.nodeType === 1) { // Element node
                        if (node.id && (node.id.includes('nighthawk') || node.id.includes('chrome-extension'))) {
                          if (node.parentNode) {
                            node.parentNode.removeChild(node);
                          }
                        }
                        // Check child elements
                        const extensionChildren = node.querySelectorAll && node.querySelectorAll('[id*="nighthawk"], [class*="nighthawk"], [id*="chrome-extension"]');
                        if (extensionChildren) {
                          extensionChildren.forEach(child => {
                            if (child.parentNode) {
                              child.parentNode.removeChild(child);
                            }
                          });
                        }
                      }
                    });
                  });
                });
                
                // Start observing
                observer.observe(document.body || document.documentElement, {
                  childList: true,
                  subtree: true
                });
                
                // Suppress unhandled promise rejections from extensions
                window.addEventListener('unhandledrejection', function(event) {
                  if (event.reason && (
                    event.reason.toString().includes('chrome-extension://') ||
                    event.reason.toString().includes('Host validation failed') ||
                    event.reason.toString().includes('Host is not supported') ||
                    event.reason.toString().includes('nighthawk')
                  )) {
                    event.preventDefault();
                    return false;
                  }
                });
                
                // Override React's hydration error handling
                const originalConsoleError = console.error;
                window.addEventListener('error', function(event) {
                  if (event.message && (
                    event.message.includes('Hydration failed') ||
                    event.message.includes('nighthawk') ||
                    event.message.includes('chrome-extension://')
                  )) {
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                  }
                });
              })();
            `,
          }}
        />
      </head>
      <body>
        <ExtensionErrorBoundary>
          <HydrationFix>
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
          </HydrationFix>
        </ExtensionErrorBoundary>
      </body>
    </html>
  );
}
