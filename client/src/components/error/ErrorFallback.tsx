import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "wouter";

interface ErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary?: () => void;
  showHomeLink?: boolean;
}

export default function ErrorFallback({
  error,
  resetErrorBoundary,
  showHomeLink = true,
}: ErrorFallbackProps) {
  const [errorMessage, setErrorMessage] = useState<string>(
    error?.message || "An unknown error occurred"
  );

  // Store the error temporarily for potential diagnostic purposes
  useEffect(() => {
    if (error?.message) {
      console.error("Error rendered in ErrorFallback:", error);
      // Store in session storage so the detailed error page can access it
      sessionStorage.setItem("jawastock_error", error.message);
    }
  }, [error]);

  return (
    <div className="w-full p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <h1 className="text-xl font-bold text-gray-900">Error Occurred</h1>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md my-3 text-sm">
            {errorMessage}
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p>
              Please try refreshing the page or contact support if the problem
              persists.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2">
          {resetErrorBoundary && (
            <Button
              variant="outline"
              size="sm"
              onClick={resetErrorBoundary}
              className="flex-1"
            >
              Try Again
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="flex-1"
          >
            Refresh Page
          </Button>
          
          {showHomeLink && (
            <Button size="sm" asChild className="flex-1">
              <Link href="/">Return Home</Link>
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              window.location.href = `/error-info?message=${encodeURIComponent(errorMessage)}`;
            }}
            className="flex-1"
          >
            More Info
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}