import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Browse from "@/pages/Browse";
import AssetDetail from "@/pages/AssetDetail";
import Upload from "@/pages/Upload";
import Dashboard from "@/pages/Dashboard";
import AdminPanel from "@/pages/AdminPanel";
import Checkout from "@/pages/Checkout";
import StripeCheckout from "@/pages/stripe-checkout";
import CheckoutSuccess from "@/pages/checkout-success";
import ErrorInfo from "@/pages/ErrorInfo";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { useState, useEffect } from "react";
import ErrorBoundary from "@/components/error/ErrorBoundary";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/browse" component={Browse} />
      <Route path="/assets/:id">
        {(params) => (
          <ErrorBoundary showHomeLink>
            <AssetDetail />
          </ErrorBoundary>
        )}
      </Route>
      <Route path="/upload">
        {() => (
          <ErrorBoundary showHomeLink>
            <Upload />
          </ErrorBoundary>
        )}
      </Route>
      <Route path="/dashboard">
        {() => (
          <ErrorBoundary showHomeLink>
            <Dashboard />
          </ErrorBoundary>
        )}
      </Route>
      <Route path="/admin">
        {() => (
          <ErrorBoundary showHomeLink>
            <AdminPanel />
          </ErrorBoundary>
        )}
      </Route>
      <Route path="/checkout">
        {() => (
          <ErrorBoundary showHomeLink>
            <Checkout />
          </ErrorBoundary>
        )}
      </Route>
      <Route path="/stripe-checkout" component={StripeCheckout} />
      <Route path="/checkout-success" component={CheckoutSuccess} />
      <Route path="/error-info" component={ErrorInfo} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading resources
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    // Handle global errors
    const handleGlobalError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      
      // Store error in session storage for ErrorInfo page
      if (event.error && event.error.message) {
        sessionStorage.setItem('jawastock_error', event.error.message);
        
        // Redirect to error page only if not already there
        if (!window.location.pathname.includes('/error-info')) {
          window.location.href = '/error-info';
        }
      }
    };
    
    // Add global error handler
    window.addEventListener('error', handleGlobalError);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50">
        <div className="flex flex-col items-center">
          <div className="text-3xl font-bold">
            <span className="text-primary">Jawa</span>
            <span className="text-secondary">Stock</span>
          </div>
          <div className="mt-4 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <Router />
            <Toaster />
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
