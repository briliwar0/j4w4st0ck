import React, { Component, ErrorInfo, ReactNode, Suspense } from 'react';
import { InteractiveErrorVisual } from './InteractiveErrorVisual';
import { BrandedSpinner } from '../../components/ui/branded-spinner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showHomeLink?: boolean;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    
    this.setState({ error, errorInfo });
    
    // Optional callback for logging or analytics
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Optionally log to server
    if (process.env.NODE_ENV === 'production') {
      try {
        // Send error details to your logging service
        fetch('/api/log-error', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            error: {
              message: error.message,
              stack: error.stack,
            },
            componentStack: errorInfo.componentStack,
            url: window.location.href,
            timestamp: new Date().toISOString(),
          }),
        }).catch(err => {
          // Silent fail if error logging fails
          console.warn('Failed to log error:', err);
        });
      } catch (e) {
        // Do nothing if this fails
      }
    }
  }

  public reset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="p-4">
          <InteractiveErrorVisual 
            error={this.state.error || new Error('Unknown error occurred')}
            errorInfo={this.state.errorInfo || undefined}
            componentStack={this.state.errorInfo?.componentStack}
            onReset={this.reset}
          />
        </div>
      );
    }

    return (
      <Suspense fallback={
        <div className="flex justify-center items-center p-8 h-48">
          <BrandedSpinner size="md" />
        </div>
      }>
        {this.props.children}
      </Suspense>
    );
  }
}

export default ErrorBoundary;