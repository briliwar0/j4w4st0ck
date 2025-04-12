import { useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";

import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Download, ArrowRight } from "lucide-react";

const CheckoutSuccess = () => {
  const [, navigate] = useLocation();
  const { isAuthenticated, isLoading } = useAuth();

  // Check if user is authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

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

  if (!isAuthenticated) {
    return null; // Will redirect due to useEffect
  }

  return (
    <>
      <Helmet>
        <title>Pembayaran Berhasil | JawaStock</title>
        <meta
          name="description"
          content="Pembayaran Anda telah berhasil diproses"
        />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-neutral-50 py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <Card className="mb-8 overflow-hidden">
                <div className="bg-green-500 h-2"></div>
                <CardContent className="p-8 text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                  </div>
                  <h1 className="text-2xl font-bold mb-2">Pembayaran Berhasil!</h1>
                  <p className="text-neutral-600 mb-6">
                    Terima kasih telah melakukan pembelian. Aset digital Anda telah ditambahkan ke akun Anda dan siap untuk diunduh.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                    <Button onClick={() => navigate("/dashboard")} className="bg-primary hover:bg-primary-dark">
                      <Download className="mr-2 h-4 w-4" />
                      Lihat Unduhan Saya
                    </Button>
                    <Button variant="outline" onClick={() => navigate("/browse")}>
                      Jelajahi Lebih Banyak
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <div className="text-center text-sm text-neutral-500">
                <p>Konfirmasi pesanan juga telah dikirim ke alamat email Anda.</p>
                <p className="mt-2">
                  Punya pertanyaan? Hubungi <span className="text-primary">support@jawastock.com</span>
                </p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default CheckoutSuccess;