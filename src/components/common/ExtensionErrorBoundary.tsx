"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ExtensionErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Check if error is from browser extension
    const isExtensionError = 
      error.stack?.includes('chrome-extension://') ||
      error.message.includes('chrome-extension://') ||
      error.name === 'ChromeExtensionError';
    
    if (isExtensionError) {
      console.warn('Extension error caught and ignored:', error.message);
      return { hasError: false }; // Don't show error UI for extension errors
    }
    
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Check if error is from browser extension
    const isExtensionError = 
      error.stack?.includes('chrome-extension://') ||
      error.message.includes('chrome-extension://') ||
      error.name === 'ChromeExtensionError';
    
    if (isExtensionError) {
      console.warn('Extension error caught and ignored:', error.message);
      return; // Don't log extension errors
    }
    
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ExtensionErrorBoundary;
