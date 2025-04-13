import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { InteractiveErrorVisual } from '@/components/error/InteractiveErrorVisual';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw } from 'lucide-react';

const ErrorInfo = () => {
  const [errorDetails, setErrorDetails] = useState({
    message: '',
    stack: '',
    timestamp: new Date().toISOString(),
  });

  useEffect(() => {
    // Get error info from session storage if available
    const errorMessage = sessionStorage.getItem('jawastock_error');
    const errorStack = sessionStorage.getItem('jawastock_error_stack');
    
    if (errorMessage) {
      setErrorDetails(prev => ({
        ...prev,
        message: errorMessage,
        stack: errorStack || '',
      }));
      
      // Clear from session storage to prevent showing on page refresh
      // sessionStorage.removeItem('jawastock_error');
      // sessionStorage.removeItem('jawastock_error_stack');
    } else {
      // If no specific error info, use a generic message
      setErrorDetails(prev => ({
        ...prev,
        message: 'An unexpected error occurred while loading the application',
      }));
    }
  }, []);
  
  const handleReset = () => {
    // Clear errors from session storage
    sessionStorage.removeItem('jawastock_error');
    sessionStorage.removeItem('jawastock_error_stack');
    
    // Redirect to home
    window.location.href = '/';
  };

  return (
    <>
      <Helmet>
        <title>Error Information | JawaStock</title>
        <meta
          name="description"
          content="Error information and troubleshooting for JawaStock"
        />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow py-12 bg-slate-50">
          <div className="container max-w-7xl mx-auto px-4">
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="w-full max-w-4xl">
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold">Error Information</h1>
                  <div className="space-x-2">
                    <Button variant="outline" asChild>
                      <Link href="/">
                        <Home className="mr-2 h-4 w-4" />
                        Home
                      </Link>
                    </Button>
                    <Button onClick={handleReset}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  </div>
                </div>

                <InteractiveErrorVisual 
                  errorMessage={errorDetails.message}
                  errorStack={errorDetails.stack}
                  onReset={handleReset}
                />
                
                <div className="mt-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    Need additional help? Contact our support team.
                  </p>
                  <Button asChild variant="outline">
                    <a href="mailto:support@jawastock.com">Contact Support</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default ErrorInfo;