import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import UploadForm from "@/components/upload/UploadForm";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Upload = () => {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

  // Check if user is a contributor or admin
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        toast({
          title: "Authentication required",
          description: "Please sign in to access the upload page",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      if (user && user.role !== "contributor" && user.role !== "admin") {
        toast({
          title: "Access denied",
          description: "Only contributors can upload assets",
          variant: "destructive",
        });
        navigate("/");
      }
    }
  }, [isAuthenticated, user, isLoading, navigate, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || (user && user.role !== "contributor" && user.role !== "admin")) {
    return null; // Will redirect due to useEffect
  }

  return (
    <>
      <Helmet>
        <title>Upload Assets | JawaStock</title>
        <meta
          name="description"
          content="Upload your photos, videos, vectors, and illustrations to JawaStock and start earning money as a contributor."
        />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-neutral-50 py-8">
          <div className="container mx-auto px-4">
            <Card>
              <CardHeader>
                <CardTitle>Upload Asset</CardTitle>
                <CardDescription>
                  Share your creative work with the JawaStock community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UploadForm />
              </CardContent>
            </Card>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Upload Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-neutral-600">
                    <li>• Ensure you own all rights to the content you upload</li>
                    <li>• High-quality images should be at least 4MP resolution</li>
                    <li>• Videos should be in HD or 4K quality</li>
                    <li>• Remove any visible trademarks or copyrighted elements</li>
                    <li>• Add relevant tags to maximize discoverability</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Review Process</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-neutral-600">
                    <li>• All uploads are reviewed by our curation team</li>
                    <li>• Review typically takes 1-3 business days</li>
                    <li>• You'll be notified when your asset is approved</li>
                    <li>• Rejected assets will include feedback</li>
                    <li>• You can resubmit rejected assets after improvements</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Earnings</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-neutral-600">
                    <li>• Earn 50% commission on every sale of your content</li>
                    <li>• Payments processed monthly for balances over $50</li>
                    <li>• Track sales and earnings in your dashboard</li>
                    <li>• Higher quality content typically earns more</li>
                    <li>• Exclusive contributors may qualify for higher rates</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Upload;
