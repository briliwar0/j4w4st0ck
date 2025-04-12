import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, AlertTriangle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Checkout = () => {
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();
  const { cartItems, cartAssets, isLoading: isCartLoading } = useCart();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate totals
  const subtotal = cartAssets.reduce((total, asset) => total + asset.price, 0);
  const tax = Math.round(subtotal * 0.1); // 10% tax example
  const total = subtotal + tax;

  // Check if user is authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access checkout",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate, toast]);

  if (isLoading || isCartLoading) {
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

  if (!isAuthenticated) {
    return null; // Will redirect due to useEffect
  }

  return (
    <>
      <Helmet>
        <title>Checkout | JawaStock</title>
        <meta
          name="description"
          content="Complete your purchase of digital assets from JawaStock."
        />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-neutral-50 py-8">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <Button
                variant="ghost"
                className="mb-4"
                onClick={() => navigate("/browse")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Continue Shopping
              </Button>
              <h1 className="text-3xl font-bold">Checkout</h1>
            </div>

            {cartItems.length === 0 ? (
              <Card className="mb-8">
                <CardContent className="p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                    <ShoppingCart className="h-8 w-8 text-neutral-400" />
                  </div>
                  <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
                  <p className="text-neutral-600 mb-6">
                    Add some assets to your cart before proceeding to checkout.
                  </p>
                  <Button onClick={() => navigate("/browse")}>
                    Browse Assets
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Order Summary for Mobile */}
                <Card className="mb-8 lg:hidden">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                    <CardDescription>
                      {cartItems.length} item{cartItems.length !== 1 && "s"} in your cart
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="max-h-60 overflow-y-auto space-y-4 pr-2">
                        {cartAssets.map((asset) => (
                          <div key={asset.id} className="flex gap-3">
                            <div className="w-16 h-16 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                              <img
                                src={asset.thumbnailUrl}
                                alt={asset.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-sm line-clamp-1">{asset.title}</h3>
                              <p className="text-sm text-neutral-500 capitalize">
                                {asset.type} • {asset.licenseType} License
                              </p>
                              <p className="text-sm font-medium mt-1">
                                {formatPrice(asset.price)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Subtotal</span>
                          <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-neutral-600">Tax (10%)</span>
                          <span>{formatPrice(tax)}</span>
                        </div>
                        <div className="flex justify-between font-medium mt-2">
                          <span>Total</span>
                          <span className="text-primary">{formatPrice(total)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Notice about test environment */}
                <Card className="mb-8 border-amber-200 bg-amber-50">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-amber-800">Test Environment</h3>
                        <p className="text-sm text-amber-700">
                          This is a demo checkout. No actual payment will be processed.
                          <br />
                          You can use any test card details to complete the purchase.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <CheckoutForm />
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Checkout;
