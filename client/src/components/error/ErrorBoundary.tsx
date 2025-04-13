import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Helper function to navigate programmatically
const redirectToErrorPage = (error: Error) => {
  // Store error in session storage
  sessionStorage.setItem("jawastock_error", error.message);
  
  // Navigate to error page
  window.location.href = `/error-info?message=${encodeURIComponent(error.message)}`;
};

class ErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Only redirect for production builds
    if (import.meta.env.PROD) {
      redirectToErrorPage(error);
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Fallback UI or use the provided fallback
      return this.props.fallback || (
        <div className="p-4 m-4 bg-red-50 border border-red-200 rounded-md">
          <h2 className="text-lg font-medium text-red-800 mb-2">Something went wrong</h2>
          <p className="text-sm text-red-600">
            {this.state.error?.message || "An unknown error occurred"}
          </p>
          <button 
            className="mt-3 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
            onClick={() => window.location.reload()}
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper with hook access
export default function ErrorBoundary(props: Props): JSX.Element {
  return <ErrorBoundaryClass {...props} />;
}

// Utility function to handle errors in async functions
export function handleAsyncError(error: unknown, context = "operation"): never {
  console.error(`Error during ${context}:`, error);
  
  const errorMessage = error instanceof Error 
    ? error.message 
    : "An unknown error occurred";
    
  // Store error in session storage
  sessionStorage.setItem("jawastock_error", errorMessage);
  
  // In production, redirect to error page
  if (import.meta.env.PROD) {
    window.location.href = `/error-info?message=${encodeURIComponent(errorMessage)}`;
  }
  
  throw error; // Re-throw for promise rejection handling
}