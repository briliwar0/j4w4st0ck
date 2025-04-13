import { useState, useEffect } from 'react';
import { AlertTriangle, X, RefreshCw, Code, Puzzle, Bug, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface InteractiveErrorVisualProps {
  error?: Error;
  errorInfo?: React.ErrorInfo;
  errorMessage?: string;
  errorStack?: string;
  componentStack?: string;
  onReset?: () => void;
}

export function InteractiveErrorVisual({
  error,
  errorInfo,
  errorMessage,
  errorStack,
  componentStack,
  onReset,
}: InteractiveErrorVisualProps) {
  const [analysis, setAnalysis] = useState({
    progress: 0,
    status: 'Analyzing error...',
    complete: false,
    possibleCauses: [] as string[],
    recommendedActions: [] as string[],
  });
  const [activeTab, setActiveTab] = useState('visual');

  // Parse error information
  const message = errorMessage || error?.message || 'Unknown error occurred';
  const stack = errorStack || error?.stack || '';
  const compStack = componentStack || errorInfo?.componentStack || '';

  // Perform error analysis
  useEffect(() => {
    // Start the analysis animation
    let progress = 0;
    const timer = setInterval(() => {
      progress += 5;
      setAnalysis(prev => ({
        ...prev,
        progress,
        status: progress < 100 ? 'Analyzing error pattern...' : 'Analysis complete'
      }));

      if (progress >= 100) {
        clearInterval(timer);
        
        // Simulate error analysis results based on the error message
        const possibleCauses = [];
        const recommendedActions = [];
        
        // Common JavaScript errors and React component analysis
        if (message.includes('undefined') || message.includes('null')) {
          possibleCauses.push('A variable or property is being accessed before it exists');
          recommendedActions.push('Check for undefined or null values before accessing properties');
        }
        
        if (message.includes('type') || message.includes('is not a function')) {
          possibleCauses.push('A function is being called incorrectly or on the wrong type of object');
          recommendedActions.push('Verify the type of variables before performing operations');
        }
        
        if (message.includes('Unexpected token')) {
          possibleCauses.push('Syntax error in JavaScript code');
          possibleCauses.push('Network loading issue with JavaScript files');
          recommendedActions.push('Check browser console for exact location of syntax error');
          recommendedActions.push('Validate all JavaScript files are loading correctly');
        }
        
        if (message.includes('fetch') || message.includes('network') || message.includes('API')) {
          possibleCauses.push('API or network request failed');
          recommendedActions.push('Check network connectivity and API endpoint status');
        }
        
        if (message.includes('React') || compStack.includes('React')) {
          possibleCauses.push('A React component rendered incorrectly');
          recommendedActions.push('Review component lifecycle and state management');
        }
        
        // Add default causes and actions if none were detected
        if (possibleCauses.length === 0) {
          possibleCauses.push('Unexpected application error');
          possibleCauses.push('Possible browser compatibility issue');
        }
        
        if (recommendedActions.length === 0) {
          recommendedActions.push('Try refreshing the page');
          recommendedActions.push('Clear browser cache and cookies');
        }
        
        // Always add these common actions
        recommendedActions.push('Contact support if the issue persists');
        
        // Update the analysis with results
        setAnalysis(prev => ({
          ...prev,
          complete: true,
          possibleCauses,
          recommendedActions
        }));
      }
    }, 50);
    
    return () => clearInterval(timer);
  }, [message, compStack]);

  const renderErrorVisual = () => {
    return (
      <div className="flex flex-col items-center text-center p-6">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-25"></div>
          <div className="relative flex items-center justify-center w-24 h-24 bg-red-50 rounded-full border-2 border-red-500">
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-red-700 mb-2">Error Detected</h3>
        <p className="text-gray-600 mb-6 max-w-md">{message}</p>
        
        {!analysis.complete ? (
          <div className="w-full max-w-md space-y-2">
            <div className="flex justify-between text-sm">
              <span>{analysis.status}</span>
              <span>{analysis.progress}%</span>
            </div>
            <Progress value={analysis.progress} className="h-2" />
          </div>
        ) : (
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Puzzle className="w-4 h-4" />
                Possible Causes
              </h4>
              <ul className="space-y-2">
                {analysis.possibleCauses.map((cause, i) => (
                  <li key={i} className="flex items-start gap-2 text-left">
                    <ArrowRight className="w-4 h-4 mt-1 flex-shrink-0" />
                    <span>{cause}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Recommended Actions
              </h4>
              <ul className="space-y-2">
                {analysis.recommendedActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-left">
                    <ArrowRight className="w-4 h-4 mt-1 flex-shrink-0" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {onReset && (
              <Button onClick={onReset} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Application
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderErrorDetails = () => {
    return (
      <div className="overflow-auto max-h-[400px] p-4 text-sm">
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2 flex items-center gap-2">
              <Bug className="w-4 h-4" />
              Error Message
            </h3>
            <div className="bg-gray-100 p-3 rounded font-mono text-xs overflow-auto">
              {message}
            </div>
          </div>
          
          {stack && (
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Stack Trace
              </h3>
              <pre className="bg-gray-100 p-3 rounded font-mono text-xs overflow-auto whitespace-pre-wrap">
                {stack}
              </pre>
            </div>
          )}
          
          {compStack && (
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Code className="w-4 h-4" />
                Component Stack
              </h3>
              <pre className="bg-gray-100 p-3 rounded font-mono text-xs overflow-auto whitespace-pre-wrap">
                {compStack}
              </pre>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Application Error
            </CardTitle>
            <CardDescription>
              We've encountered an error. Our team has been notified.
            </CardDescription>
          </div>
          
          <Button variant="ghost" size="icon" className="rounded-full" onClick={() => window.location.href = '/'}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="visual">
              Interactive Analysis
            </TabsTrigger>
            <TabsTrigger value="technical">
              Technical Details
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="visual">
            {renderErrorVisual()}
          </TabsContent>
          
          <TabsContent value="technical">
            {renderErrorDetails()}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row justify-between border-t pt-4 text-xs text-muted-foreground">
        <div>
          Reference ID: {Math.random().toString(36).substring(2, 10).toUpperCase()}
        </div>
        <div>
          Occurred at: {new Date().toLocaleString()}
        </div>
      </CardFooter>
    </Card>
  );
}