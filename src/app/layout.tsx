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
                      message.includes('Host is not valid') ||
                      message.includes('Host is not in insights whitelist') ||
                      message.includes('message channel closed') ||
                      message.includes('asynchronous response') ||
                      message.includes('listener indicated an asynchronous response') ||
                      message.includes('A listener indicated an asynchronous response') ||
                      message.includes('message channel closed before a response was received') ||
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
                      message.includes('Host is not valid') ||
                      message.includes('Host is not in insights whitelist') ||
                      message.includes('message channel closed') ||
                      message.includes('asynchronous response') ||
                      message.includes('listener indicated an asynchronous response') ||
                      message.includes('A listener indicated an asynchronous response') ||
                      message.includes('message channel closed before a response was received') ||
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
                
                // Remove extension elements and attributes immediately
                function removeExtensionElements() {
                  const extensionElements = document.querySelectorAll('[id*="nighthawk"], [class*="nighthawk"], [id*="chrome-extension"]');
                  extensionElements.forEach(el => {
                    if (el.parentNode) {
                      el.parentNode.removeChild(el);
                    }
                  });
                  
                  // Remove extension attributes from body
                  const body = document.body;
                  if (body) {
                    const extensionAttributes = [
                      'data-new-gr-c-s-check-loaded',
                      'data-gr-ext-installed', 
                      'data-gr-ext-disabled',
                      'data-grammarly-shadow-root',
                      'data-grammarly-ignore'
                    ];
                    extensionAttributes.forEach(attr => {
                      body.removeAttribute(attr);
                    });
                  }
                }
                
                // Run immediately and on DOM changes
                removeExtensionElements();
                
                // Prevent extension attributes from being added
                const originalSetAttribute = Element.prototype.setAttribute;
                Element.prototype.setAttribute = function(name, value) {
                  const extensionAttributes = [
                    'data-new-gr-c-s-check-loaded',
                    'data-gr-ext-installed', 
                    'data-gr-ext-disabled',
                    'data-grammarly-shadow-root',
                    'data-grammarly-ignore'
                  ];
                  if (extensionAttributes.includes(name)) {
                    return; // Block extension attributes
                  }
                  return originalSetAttribute.call(this, name, value);
                };
                
                // Watch for extension elements and attributes being added
                const observer = new MutationObserver(function(mutations) {
                  mutations.forEach(function(mutation) {
                    // Handle added nodes
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
                    
                    // Handle attribute changes
                    if (mutation.type === 'attributes') {
                      const target = mutation.target;
                      if (target.nodeType === 1) { // Element node
                        const extensionAttributes = [
                          'data-new-gr-c-s-check-loaded',
                          'data-gr-ext-installed', 
                          'data-gr-ext-disabled',
                          'data-grammarly-shadow-root',
                          'data-grammarly-ignore'
                        ];
                        extensionAttributes.forEach(attr => {
                          if (target.hasAttribute(attr)) {
                            target.removeAttribute(attr);
                          }
                        });
                      }
                    }
                  });
                });
                
                // Start observing
                observer.observe(document.body || document.documentElement, {
                  childList: true,
                  subtree: true,
                  attributes: true,
                  attributeFilter: ['data-new-gr-c-s-check-loaded', 'data-gr-ext-installed', 'data-gr-ext-disabled', 'data-grammarly-shadow-root', 'data-grammarly-ignore']
                });
                
                // Suppress unhandled promise rejections from extensions
                window.addEventListener('unhandledrejection', function(event) {
                  if (event.reason && (
                    event.reason.toString().includes('chrome-extension://') ||
                    event.reason.toString().includes('Host validation failed') ||
                    event.reason.toString().includes('Host is not supported') ||
                    event.reason.toString().includes('Host is not valid') ||
                    event.reason.toString().includes('Host is not in insights whitelist') ||
                    event.reason.toString().includes('message channel closed') ||
                    event.reason.toString().includes('asynchronous response') ||
                    event.reason.toString().includes('listener indicated an asynchronous response') ||
                    event.reason.toString().includes('A listener indicated an asynchronous response') ||
                    event.reason.toString().includes('message channel closed before a response was received') ||
                    event.reason.toString().includes('nighthawk')
                  )) {
                    event.preventDefault();
                    event.stopPropagation();
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
                </ModalWrapper>
              </ClientProvider>
            </AppProvider>
          </HydrationFix>
        </ExtensionErrorBoundary>
      </body>
    </html>
  );
}
