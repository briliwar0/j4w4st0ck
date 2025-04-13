import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import InteractiveErrorVisual from "@/components/error/InteractiveErrorVisual";
import { toast } from "@/components/ui/feedback-toast";

export default function ErrorInfo() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<number>(500);
  
  useEffect(() => {
    // Get error from URL params
    const params = new URLSearchParams(window.location.search);
    const error = params.get("message");
    const code = params.get("code");
    
    if (code) {
      try {
        setErrorCode(parseInt(code));
      } catch {
        setErrorCode(500);
      }
    }
    
    setErrorMessage(error || "An unknown error occurred");
    
    // Clear the error from session storage once displayed
    const storedError = sessionStorage.getItem("jawastock_error");
    if (storedError) {
      setErrorMessage(storedError);
      sessionStorage.removeItem("jawastock_error");
    }
    
    // Show toast notification
    toast.warning({
      title: "Error Detected",
      message: "We've detected an issue with the application and are showing you detailed information."
    });
  }, []);

  const createErrorObject = (): Error => {
    const error = new Error(errorMessage || "Unknown error");
    return error;
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 p-4">
      <Helmet>
        <title>Error Information | JawaStock</title>
      </Helmet>
      
      <div className="w-full max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">JawaStock Error Center</h1>
          <p className="text-gray-600">
            We've encountered an issue, but we're here to help you resolve it.
          </p>
        </div>
        
        <InteractiveErrorVisual 
          error={createErrorObject()} 
          errorCode={errorCode}
          showHomeLink={true}
          resetErrorBoundary={() => window.location.reload()}
        />
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>If this issue persists, please contact our support team.</p>
          <p className="mt-2">Error Reference: {Date.now().toString(36).toUpperCase()}</p>
        </div>
      </div>
    </div>
  );
}