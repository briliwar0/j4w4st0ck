import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw, Home, HelpCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'wouter';
import { BrandedSpinner } from '@/components/ui/branded-spinner';

interface InteractiveErrorVisualProps {
  error: Error | null;
  resetErrorBoundary?: () => void;
  errorCode?: number;
  showHomeLink?: boolean;
}

export default function InteractiveErrorVisual({
  error,
  resetErrorBoundary,
  errorCode = 500,
  showHomeLink = true,
}: InteractiveErrorVisualProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>(
    error?.message || 'An unknown error occurred'
  );

  // Steps for interactive troubleshooting
  const steps = [
    {
      title: 'Error Detected',
      description: 'We encountered an issue while processing your request.',
      action: 'Tell me more',
    },
    {
      title: 'Error Details',
      description: errorMessage,
      action: 'How to fix?',
    },
    {
      title: 'Recommended Solutions',
      description: 'Try one of these options to resolve the issue:',
      action: 'Try automatic fix',
    },
  ];

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate attempt to fix
    setTimeout(() => {
      if (resetErrorBoundary) {
        resetErrorBoundary();
      } else {
        window.location.reload();
      }
    }, 2000);
  };

  useEffect(() => {
    // Capture error details for analytics (in production)
    if (error && import.meta.env.PROD) {
      console.error('Error captured by InteractiveErrorVisual:', error);
      
      // Here you would typically send error to your analytics service
      // Example: sendErrorToAnalytics(error);
    }
  }, [error]);

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-red-100 bg-white shadow-lg">
        <CardHeader className={`bg-gradient-to-r ${
          activeStep === 0 ? 'from-red-50 to-red-100' : 
          activeStep === 1 ? 'from-amber-50 to-amber-100' : 
          'from-blue-50 to-blue-100'
        } rounded-t-lg p-6`}>
          <div className="flex items-center gap-3">
            {activeStep === 0 && <AlertTriangle className="h-6 w-6 text-red-500" />}
            {activeStep === 1 && <HelpCircle className="h-6 w-6 text-amber-500" />}
            {activeStep === 2 && <RefreshCw className="h-6 w-6 text-blue-500" />}
            <CardTitle className="text-lg font-semibold">
              {steps[activeStep].title}
            </CardTitle>
          </div>
          
          <div className="mt-2 flex space-x-1">
            {steps.map((_, index) => (
              <div 
                key={index}
                className={`h-1 flex-1 rounded-full ${
                  index === activeStep 
                    ? 'bg-primary animate-pulse' 
                    : index < activeStep 
                      ? 'bg-primary/60' 
                      : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="min-h-[100px]">
            {activeStep === 0 && (
              <div className="space-y-4">
                <p className="text-gray-700">{steps[activeStep].description}</p>
                <div className="rounded-md bg-red-50 p-3 border border-red-100">
                  <p className="text-sm text-red-800 font-medium">
                    Error Code: {errorCode}
                  </p>
                </div>
              </div>
            )}

            {activeStep === 1 && (
              <div className="space-y-4">
                <p className="text-gray-700">The error appears to be:</p>
                <div className="rounded-md bg-amber-50 p-3 border border-amber-100">
                  <p className="text-sm text-amber-800 font-mono whitespace-pre-wrap break-words">
                    {errorMessage}
                  </p>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-4">
                <p className="text-gray-700">{steps[activeStep].description}</p>
                <ul className="list-disc pl-5 space-y-2 text-sm">
                  <li className="text-gray-700">Refresh the page and try again</li>
                  <li className="text-gray-700">Clear your browser cache</li>
                  <li className="text-gray-700">Return to the homepage</li>
                  <li className="text-gray-700">Try again later if the problem persists</li>
                </ul>
              </div>
            )}

            {isRefreshing && (
              <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center rounded-lg">
                <BrandedSpinner label="Attempting to recover..." />
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="px-6 pb-6 pt-0 flex flex-wrap gap-2">
          {activeStep < steps.length - 1 ? (
            <Button 
              className="ml-auto" 
              onClick={() => setActiveStep(prev => prev + 1)}
            >
              {steps[activeStep].action}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <div className="flex flex-wrap gap-2 w-full">
              {showHomeLink && (
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Home
                  </Link>
                </Button>
              )}
              
              <Button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="flex-1"
              >
                {isRefreshing ? (
                  <>
                    <BrandedSpinner size="xs" className="mr-2" />
                    Fixing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </>
                )}
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}