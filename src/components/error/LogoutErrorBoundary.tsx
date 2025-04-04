
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface LogoutErrorBoundaryProps {
  children: ReactNode;
  onError?: () => void;
}

interface LogoutErrorBoundaryState {
  hasError: boolean;
}

/**
 * Error boundary specifically for handling logout-related errors
 * This prevents React from unmounting the entire tree when DOM errors occur during logout
 */
class LogoutErrorBoundary extends Component<LogoutErrorBoundaryProps, LogoutErrorBoundaryState> {
  constructor(props: LogoutErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): LogoutErrorBoundaryState {
    return { hasError: false }; // Don't change the UI, just catch the error
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Only log the error without changing UI state
    console.log('Logout process encountered an error:', error);
    console.log('Component stack:', errorInfo.componentStack);
    
    // Call onError callback if provided
    if (this.props.onError) {
      this.props.onError();
    }
  }

  render(): ReactNode {
    // Always render children - we're just catching errors, not changing the UI
    return this.props.children;
  }
}

export default LogoutErrorBoundary;
