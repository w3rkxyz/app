"use client";

import { useEffect, useState } from 'react';

interface HydrationFixProps {
  children: React.ReactNode;
}

export default function HydrationFix({ children }: HydrationFixProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Remove any extension elements that might have been added
    const removeExtensionElements = () => {
      const extensionElements = document.querySelectorAll(
        '[id*="nighthawk"], [class*="nighthawk"], [id*="chrome-extension"]'
      );
      extensionElements.forEach(el => {
        if (el.parentNode) {
          el.parentNode.removeChild(el);
        }
      });
    };

    // Run immediately
    removeExtensionElements();

    // Set hydrated state
    setIsHydrated(true);

    // Watch for extension elements being added
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            const element = node as Element;
            if (element.id && (element.id.includes('nighthawk') || element.id.includes('chrome-extension'))) {
              if (element.parentNode) {
                element.parentNode.removeChild(element);
              }
            }
            // Check child elements
            const extensionChildren = element.querySelectorAll?.(
              '[id*="nighthawk"], [class*="nighthawk"], [id*="chrome-extension"]'
            );
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
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Show loading state until hydrated
  if (!isHydrated) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
