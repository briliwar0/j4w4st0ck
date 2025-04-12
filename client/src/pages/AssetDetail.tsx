import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Asset } from "@shared/schema";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { allAssets } from "@/lib/sample-data";
import { formatPrice } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  ShoppingCart,
  Heart,
  Download,
  CreditCard,
  Clock,
  CheckCircle,
  Tag,
  Info,
  Play,
} from "lucide-react";

const AssetDetail = () => {
  const { id } = useParams<{ id: string }>();
  const assetId = parseInt(id);
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("details");

  // Fetch asset details
  const { data: asset, isLoading, error } = useQuery({
    queryKey: ["/api/assets", assetId],
    queryFn: async () => {
      const response = await fetch(`/api/assets/${assetId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch asset details");
      }
      return response.json();
    },
    placeholderData: allAssets.find(a => a.id === assetId), // Use sample data until API returns
  });

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to add items to your cart",
        variant: "destructive",
      });
      return;
    }

    try {
      await addToCart({
        assetId: asset.id,
        licenseType: "standard",
      });

      toast({
        title: "Added to cart",
        description: `${asset.title} has been added to your cart`,
      });
    } catch (error) {
      console.error("Add to cart error:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  // Handle buy now
  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to purchase items",
        variant: "destructive",
      });
      return;
    }

    try {
      await addToCart({
        assetId: asset.id,
        licenseType: "standard",
      });
      navigate("/checkout");
    } catch (error) {
      console.error("Buy now error:", error);
      toast({
        title: "Error",
        description: "Failed to proceed to checkout",
        variant: "destructive",
      });
    }
  };

  // Format dimensions or duration
  const formatSpecifications = (asset: Asset) => {
    if (asset.type === "video" && asset.duration) {
      const minutes = Math.floor(asset.duration / 60);
      const seconds = asset.duration % 60;
      return `${minutes}:${seconds.toString().padStart(2, "0")} • ${
        asset.width && asset.height ? `${asset.width}x${asset.height}` : "HD"
      }`;
    } else if (asset.width && asset.height) {
      return `${asset.width} × ${asset.height} px`;
    }
    return "Specifications not available";
  };

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

  if (error || !asset) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-neutral-800 mb-4">
              Asset Not Found
            </h1>
            <p className="text-neutral-600 mb-6">
              The asset you're looking for could not be found or may have been removed.
            </p>
            <Button onClick={() => navigate("/browse")}>
              Browse Other Assets
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{asset.title} | JawaStock</title>
        <meta name="description" content={asset.description || `${asset.title} - High quality ${asset.type} available for download at JawaStock.`} />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-neutral-50 py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Asset Preview */}
              <div className="lg:col-span-2">
                <Card className="overflow-hidden">
                  <div className="relative">
                    {/* Watermarked preview */}
                    <div className="relative overflow-hidden">
                      {asset.type === "video" ? (
                        <div className="relative aspect-video bg-neutral-900 flex items-center justify-center">
                          <img
                            src={asset.thumbnailUrl}
                            alt={asset.title}
                            className="w-full h-full object-cover opacity-60"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-16 h-16 bg-primary/80 rounded-full flex items-center justify-center text-white">
                              <Play className="h-8 w-8" />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={asset.thumbnailUrl}
                          alt={asset.title}
                          className="w-full object-contain max-h-[600px]"
                        />
                      )}

                      {/* Watermark overlay */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-white text-opacity-70 text-4xl font-bold transform rotate-[-30deg]">
                          JawaStock
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {asset.tags?.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="bg-neutral-100 text-neutral-600">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="mb-4">
                        <TabsTrigger value="details">Details</TabsTrigger>
                        <TabsTrigger value="license">License</TabsTrigger>
                      </TabsList>

                      <TabsContent value="details" className="space-y-4">
                        <div>
                          <h3 className="font-medium text-neutral-700 mb-2">Description</h3>
                          <p className="text-neutral-600">
                            {asset.description || "No description provided."}
                          </p>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <h4 className="text-sm text-neutral-500">Type</h4>
                            <p className="font-medium capitalize">{asset.type}</p>
                          </div>
                          <div>
                            <h4 className="text-sm text-neutral-500">Format</h4>
                            <p className="font-medium">
                              {asset.type === "photo"
                                ? "JPG"
                                : asset.type === "vector"
                                ? "SVG"
                                : asset.type === "video"
                                ? "MP4"
                                : asset.type === "music"
                                ? "MP3"
                                : "PNG"}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm text-neutral-500">
                              {asset.type === "video" || asset.type === "music"
                                ? "Duration"
                                : "Dimensions"}
                            </h4>
                            <p className="font-medium">{formatSpecifications(asset)}</p>
                          </div>
                          {asset.fileSize && (
                            <div>
                              <h4 className="text-sm text-neutral-500">File Size</h4>
                              <p className="font-medium">
                                {(asset.fileSize / (1024 * 1024)).toFixed(2)} MB
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="license" className="space-y-4">
                        <div className="space-y-4">
                          <div className="bg-neutral-50 p-4 rounded-md border border-neutral-200">
                            <h3 className="font-medium text-neutral-800 mb-2 flex items-center">
                              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                              Standard License
                            </h3>
                            <p className="text-neutral-600 text-sm">
                              This license allows you to use the asset for personal and commercial projects, including websites, social media, marketing campaigns, and presentations.
                            </p>
                          </div>

                          <div className="space-y-2">
                            <h4 className="font-medium text-neutral-700">Included Usage Rights:</h4>
                            <ul className="text-sm text-neutral-600 space-y-2">
                              <li className="flex items-start">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span>Unlimited digital use</span>
                              </li>
                              <li className="flex items-start">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span>Print usage up to 500,000 copies</span>
                              </li>
                              <li className="flex items-start">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span>Use in merchandise (non-resale)</span>
                              </li>
                              <li className="flex items-start">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                                <span>Lifetime license</span>
                              </li>
                            </ul>
                          </div>

                          <div className="pt-2">
                            <Button
                              variant="outline"
                              className="w-full text-primary border-primary hover:bg-primary/10"
                            >
                              <Info className="mr-2 h-4 w-4" />
                              View Full License Details
                            </Button>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* Purchase Options */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>{asset.title}</CardTitle>
                    <CardDescription>
                      By <span className="text-primary">Contributor #{asset.authorId}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-primary">
                        {formatPrice(asset.price)}
                      </div>
                      <Badge
                        variant="outline"
                        className="text-green-600 bg-green-50 border-green-200"
                      >
                        Standard License
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <Button
                        className="w-full bg-primary hover:bg-primary-dark transition-colors"
                        onClick={handleBuyNow}
                      >
                        <CreditCard className="mr-2 h-4 w-4" />
                        Buy Now
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={handleAddToCart}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Button>
                      <Button variant="ghost" className="w-full">
                        <Heart className="mr-2 h-4 w-4" />
                        Save to Collection
                      </Button>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-neutral-600">
                        <Download className="h-4 w-4 mr-2 text-neutral-500" />
                        Download immediately after purchase
                      </div>
                      <div className="flex items-center text-sm text-neutral-600">
                        <Clock className="h-4 w-4 mr-2 text-neutral-500" />
                        Access your files anytime in your account
                      </div>
                      <div className="flex items-center text-sm text-neutral-600">
                        <CheckCircle className="h-4 w-4 mr-2 text-neutral-500" />
                        Quality guaranteed
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h3 className="font-medium">Categories</h3>
                      <div className="flex flex-wrap gap-2">
                        {asset.categories?.map((category, index) => (
                          <Badge key={index} variant="outline" className="capitalize">
                            <Tag className="h-3 w-3 mr-1" />
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-neutral-50 border-t px-6 py-4 text-sm text-neutral-600">
                    <div className="space-y-2">
                      <p>
                        Need an extended license? <a href="#" className="text-primary hover:underline">Contact us</a>
                      </p>
                      <p>
                        Have questions? <a href="#" className="text-primary hover:underline">Visit our FAQ</a>
                      </p>
                    </div>
                  </CardFooter>
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

export default AssetDetail;
