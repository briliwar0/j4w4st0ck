import React, { useState } from 'react';
import { Link } from 'wouter';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Bug, 
  Home, 
  RefreshCcw, 
  Code, 
  Terminal, 
  Layers, 
  Network
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { BrandedSpinner } from '@/components/ui/branded-spinner';

interface ErrorDetails {
  errorCode: number;
  errorName: string;
  errorDescription: string;
  possibleCauses: string[];
  suggestedFixes: string[];
}

interface InteractiveErrorVisualProps {
  error: Error;
  errorCode?: number;
  componentStack?: string;
  resetErrorBoundary?: () => void;
  showHomeLink?: boolean;
}

// Peta kode error ke informasi yang lebih bermanfaat
const ERROR_DETAILS_MAP: Record<number, ErrorDetails> = {
  400: {
    errorCode: 400,
    errorName: 'Bad Request',
    errorDescription: 'The server could not understand the request due to invalid syntax.',
    possibleCauses: [
      'Malformed request syntax',
      'Invalid request message framing',
      'Deceptive request routing'
    ],
    suggestedFixes: [
      'Check the request parameters and formatting',
      'Verify the request payload structure',
      'Make sure all required fields are provided'
    ]
  },
  401: {
    errorCode: 401,
    errorName: 'Unauthorized',
    errorDescription: 'Authentication is required and has failed or has not been provided.',
    possibleCauses: [
      'Missing authentication credentials',
      'Invalid or expired access token',
      'User does not have permission to access the resource'
    ],
    suggestedFixes: [
      'Log in or provide valid authentication credentials',
      'Request a new access token if expired',
      'Contact support if you believe you should have access'
    ]
  },
  403: {
    errorCode: 403,
    errorName: 'Forbidden',
    errorDescription: 'The server understood the request but refuses to authorize it.',
    possibleCauses: [
      'Insufficient permissions for the requested resource',
      'Account restrictions in place',
      'IP-based restrictions'
    ],
    suggestedFixes: [
      'Check if you have the necessary permissions',
      'Request access to the resource from an administrator',
      'Verify your account status'
    ]
  },
  404: {
    errorCode: 404,
    errorName: 'Not Found',
    errorDescription: 'The server cannot find the requested resource.',
    possibleCauses: [
      'The URL might be misspelled or incorrect',
      'The resource may have been moved or deleted',
      'The resource may be temporarily unavailable'
    ],
    suggestedFixes: [
      'Check that the URL is correct',
      'Navigate back to the homepage and try again',
      'If you followed a link, please report this broken link'
    ]
  },
  500: {
    errorCode: 500,
    errorName: 'Internal Server Error',
    errorDescription: 'The server has encountered a situation it doesn\'t know how to handle.',
    possibleCauses: [
      'Server-side application error',
      'Database connection issues',
      'Unexpected condition encountered by the server'
    ],
    suggestedFixes: [
      'Refresh the page and try again',
      'Clear your browser cache and cookies',
      'Try again later or contact support if the issue persists'
    ]
  },
  502: {
    errorCode: 502,
    errorName: 'Bad Gateway',
    errorDescription: 'The server received an invalid response from an upstream server.',
    possibleCauses: [
      'The upstream server may be down or unreachable',
      'Network issues between servers',
      'Firewall or security restrictions'
    ],
    suggestedFixes: [
      'Refresh the page after a few moments',
      'Check your internet connection',
      'Try again later when the upstream service is available'
    ]
  },
  503: {
    errorCode: 503,
    errorName: 'Service Unavailable',
    errorDescription: 'The server is not ready to handle the request, possibly due to maintenance or overload.',
    possibleCauses: [
      'Server is under maintenance',
      'Server is overloaded with requests',
      'Temporary outage of the service'
    ],
    suggestedFixes: [
      'Try again later as the issue is likely temporary',
      'Check service status page for announcements',
      'Contact support if the issue persists for an extended period'
    ]
  }
};

// Component utama
const InteractiveErrorVisual: React.FC<InteractiveErrorVisualProps> = ({
  error,
  errorCode = 500,
  componentStack,
  resetErrorBoundary,
  showHomeLink = false
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isFixing, setIsFixing] = useState(false);
  
  // Dapatkan detail error berdasarkan kode atau gunakan default 500
  const errorDetails = ERROR_DETAILS_MAP[errorCode] || ERROR_DETAILS_MAP[500];
  
  // Fungsi untuk mencoba memperbaiki error
  const handleTryFix = () => {
    setIsFixing(true);
    // Simulasi proses perbaikan
    setTimeout(() => {
      setIsFixing(false);
      if (resetErrorBoundary) {
        resetErrorBoundary();
      }
    }, 2000);
  };

  return (
    <Card className="w-full overflow-hidden border-red-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-red-50 to-amber-50 border-b border-red-100">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-amber-500" />
          <CardTitle className="text-xl font-bold text-red-700">
            {errorDetails.errorName} {errorCode && `(${errorCode})`}
          </CardTitle>
        </div>
        <CardDescription className="text-red-600">
          {errorDetails.errorDescription}
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 w-full rounded-none">
          <TabsTrigger value="overview" className="flex items-center gap-1 text-xs md:text-sm">
            <Layers className="h-4 w-4" />
            <span className="hidden md:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex items-center gap-1 text-xs md:text-sm">
            <Bug className="h-4 w-4" />
            <span className="hidden md:inline">Technical Details</span>
          </TabsTrigger>
          <TabsTrigger value="diagnosis" className="flex items-center gap-1 text-xs md:text-sm">
            <Network className="h-4 w-4" />
            <span className="hidden md:inline">Diagnosis</span>
          </TabsTrigger>
          <TabsTrigger value="solution" className="flex items-center gap-1 text-xs md:text-sm">
            <Terminal className="h-4 w-4" />
            <span className="hidden md:inline">Solution</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="p-0">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h3 className="font-medium text-red-800 mb-2">Error Message</h3>
                <p className="text-sm text-red-700 font-mono bg-white p-3 rounded border border-red-100">
                  {error.message || 'An unknown error occurred'}
                </p>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">What this means</h3>
                <p className="text-sm text-gray-600">
                  {errorCode >= 400 && errorCode < 500 
                    ? 'There was a problem with the request. This could be due to invalid input, missing authentication, or trying to access a resource that doesn\'t exist.'
                    : 'There was a problem with our servers processing your request. This is likely a temporary issue that our team is working to resolve.'}
                </p>
              </div>
            </div>
          </CardContent>
        </TabsContent>
        
        {/* Technical Details Tab */}
        <TabsContent value="technical" className="p-0">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Error Details</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto max-h-[200px]">
                  <pre className="text-xs font-mono">
                    <code>
                      <span className="text-amber-400">TypeError:</span> {error.message}
                      {'\n\n'}
                      <span className="text-amber-400">at:</span> {error.stack?.split('\n')[1]?.trim() || 'Unknown Location'}
                      {componentStack && (
                        <>
                          {'\n\n'}
                          <span className="text-green-400">Component Stack:</span>
                          {'\n'}
                          {componentStack.split('\n').slice(0, 5).join('\n')}
                        </>
                      )}
                    </code>
                  </pre>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Request Information</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex justify-between">
                    <span className="font-medium">URL:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{window.location.href}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">User Agent:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded truncate max-w-[70%]">
                      {navigator.userAgent}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-medium">Timestamp:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                      {new Date().toISOString()}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </TabsContent>
        
        {/* Diagnosis Tab */}
        <TabsContent value="diagnosis" className="p-0">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Possible Causes</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {errorDetails.possibleCauses.map((cause, index) => (
                    <li key={index} className="text-sm text-gray-600">{cause}</li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Diagnostic Steps</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="bg-green-100 text-green-700 rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Check Network Connection</h4>
                      <p className="text-xs text-gray-600">Verify that you have a stable internet connection and try refreshing the page.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Clear Browser Cache</h4>
                      <p className="text-xs text-gray-600">Old or corrupted cache files can sometimes cause errors. Try clearing your browser cache.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-purple-100 text-purple-700 rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Check Authorization</h4>
                      <p className="text-xs text-gray-600">Make sure you're logged in and have permission to access this resource.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </TabsContent>
        
        {/* Solution Tab */}
        <TabsContent value="solution" className="p-0">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Suggested Fixes</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {errorDetails.suggestedFixes.map((fix, index) => (
                    <li key={index} className="text-sm text-gray-600">{fix}</li>
                  ))}
                </ul>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="font-medium text-blue-800 mb-2">Automatic Error Recovery</h3>
                <p className="text-sm text-blue-700 mb-4">
                  Our system can attempt to automatically resolve common issues. Click the button below to try automatic error recovery.
                </p>
                <Button 
                  onClick={handleTryFix} 
                  disabled={isFixing} 
                  className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                >
                  {isFixing ? (
                    <>
                      <BrandedSpinner size="xs" className="mr-2" />
                      Attempting to fix...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Try Automatic Fix
                    </>
                  )}
                </Button>
              </div>
              
              {errorCode >= 500 && (
                <div className="mt-4 text-sm text-gray-500">
                  <p>
                    This appears to be a server-side issue. Our team has been automatically notified and is working to resolve it.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="bg-gray-50 border-t flex justify-between p-4">
        <Button 
          variant="outline" 
          onClick={resetErrorBoundary}
          className="gap-2"
        >
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
        
        {showHomeLink && (
          <Button asChild className="gap-2">
            <Link href="/">
              <Home className="h-4 w-4" />
              Return to Homepage
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default InteractiveErrorVisual;