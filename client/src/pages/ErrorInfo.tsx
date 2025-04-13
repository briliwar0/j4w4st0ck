import { Helmet } from "react-helmet";
import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

export default function ErrorInfo() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  useEffect(() => {
    // Get error from URL params
    const params = new URLSearchParams(window.location.search);
    const error = params.get("message");
    setErrorMessage(error || "An unknown error occurred");
    
    // Clear the error from session storage once displayed
    const storedError = sessionStorage.getItem("jawastock_error");
    if (storedError) {
      setErrorMessage(storedError);
      sessionStorage.removeItem("jawastock_error");
    }
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
      <Helmet>
        <title>Error Information | JawaStock</title>
      </Helmet>
      
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
            <h1 className="text-2xl font-bold text-gray-900">Application Error</h1>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-md my-4">
            <p className="text-sm text-gray-800">
              {errorMessage}
            </p>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-medium mb-2">Troubleshooting Steps:</h2>
            <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
              <li>Refresh the page and try again</li>
              <li>Clear your browser cache and cookies</li>
              <li>Try using a different browser</li>
              <li>Check your internet connection</li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
          <Button asChild>
            <Link href="/">Return to Homepage</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}