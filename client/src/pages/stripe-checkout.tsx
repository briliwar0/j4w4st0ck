import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatPrice } from "@/lib/utils";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, AlertTriangle, LockIcon } from "lucide-react";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
let stripePromise = null;
try {
  if (import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
  } else {
    console.warn('Stripe key not found. Checkout functionality will be limited.');
  }
} catch (error) {
  console.error('Error initializing Stripe:', error);
}

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [, navigate] = useLocation();
  const { clearCart } = useCart();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout-success`,
        },
        redirect: 'if_required'
      });

      if (error) {
        toast({
          title: "Pembayaran Gagal",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Clear the cart
        await clearCart();
        
        toast({
          title: "Pembayaran Berhasil!",
          description: "Terima kasih atas pembelian Anda",
        });
        
        // Redirect to success page
        navigate("/checkout-success");
      }
    } catch (err: any) {
      toast({
        title: "Terjadi Kesalahan",
        description: err.message || "Terjadi kesalahan saat memproses pembayaran",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      <Button 
        type="submit" 
        className="w-full bg-primary hover:bg-primary-dark"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <span className="flex items-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Memproses Pembayaran...
          </span>
        ) : (
          <span className="flex items-center">
            <LockIcon className="mr-2 h-4 w-4" />
            Bayar
          </span>
        )}
      </Button>
    </form>
  );
};

const OrderSummary = ({ cartAssets, subtotal, tax, total }: {
  cartAssets: any[];
  subtotal: number;
  tax: number;
  total: number;
}) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Ringkasan Pesanan</h3>
      
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
          <span className="text-neutral-600">Pajak (10%)</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between font-medium mt-2 text-lg">
          <span>Total</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
};

const StripeCheckout = () => {
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { cartItems, cartAssets, isLoading: isCartLoading } = useCart();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");

  // Calculate totals
  const subtotal = cartAssets.reduce((total, asset) => total + asset.price, 0);
  const tax = Math.round(subtotal * 0.1); // 10% tax example
  const total = subtotal + tax;

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      toast({
        title: "Otentikasi diperlukan",
        description: "Silakan masuk untuk mengakses checkout",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAuthenticated, isAuthLoading, navigate, toast]);

  // Create PaymentIntent as soon as the page loads
  useEffect(() => {
    if (isAuthenticated && cartItems.length > 0 && total > 0) {
      const createPaymentIntent = async () => {
        try {
          const response = await apiRequest("POST", "/api/create-payment-intent", { amount: total });
          const data = await response.json();
          setClientSecret(data.clientSecret);
        } catch (error) {
          console.error("Error creating payment intent:", error);
          toast({
            title: "Kesalahan Pembayaran",
            description: "Terjadi kesalahan saat mempersiapkan checkout",
            variant: "destructive",
          });
        }
      };

      createPaymentIntent();
    }
  }, [isAuthenticated, cartItems.length, total, toast]);

  if (isAuthLoading || isCartLoading) {
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

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-neutral-50 py-8">
          <div className="container mx-auto px-4">
            <Card className="mb-8">
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="h-8 w-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h2 className="text-xl font-medium mb-2">Keranjang Anda kosong</h2>
                <p className="text-neutral-600 mb-6">
                  Tambahkan beberapa aset ke keranjang Anda sebelum melanjutkan ke checkout.
                </p>
                <Button onClick={() => navigate("/browse")}>
                  Jelajahi Aset
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout | JawaStock</title>
        <meta
          name="description"
          content="Selesaikan pembelian aset digital Anda dari JawaStock."
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
                Lanjutkan Belanja
              </Button>
              <h1 className="text-3xl font-bold">Checkout dengan Stripe</h1>
            </div>

            {/* Notice about test environment */}
            <Card className="mb-8 border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-amber-800">Lingkungan Pengujian</h3>
                    <p className="text-sm text-amber-700">
                      Ini adalah demo checkout. Tidak ada pembayaran yang akan diproses.
                      <br />
                      Anda dapat menggunakan detail kartu pengujian berikut: 4242 4242 4242 4242, tanggal kedaluwarsa masa depan dan CVC: 123.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Informasi Pembayaran</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!stripePromise ? (
                      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                        <h3 className="text-lg font-medium mb-2">Pembayaran Tidak Tersedia</h3>
                        <p className="text-neutral-600 mb-4">
                          Sistem pembayaran sedang dalam pemeliharaan. Silakan coba kembali nanti.
                        </p>
                        <Button onClick={() => navigate("/")}>
                          Kembali ke Beranda
                        </Button>
                      </div>
                    ) : clientSecret ? (
                      <Elements 
                        stripe={stripePromise} 
                        options={{ 
                          clientSecret,
                          appearance: { 
                            theme: 'stripe',
                            variables: {
                              colorPrimary: '#f03e71',
                            }
                          }
                        }}
                      >
                        <CheckoutForm />
                      </Elements>
                    ) : (
                      <div className="flex justify-center items-center h-48">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardContent className="p-6">
                    <OrderSummary
                      cartAssets={cartAssets}
                      subtotal={subtotal}
                      tax={tax}
                      total={total}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default StripeCheckout;