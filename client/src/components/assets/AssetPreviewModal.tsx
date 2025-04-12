import { Asset } from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ShoppingCart, CreditCard } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatPrice } from "@/lib/utils";
import { useLocation } from "wouter";

interface AssetPreviewModalProps {
  asset: Asset;
  isOpen: boolean;
  onClose: () => void;
}

const AssetPreviewModal = ({ asset, isOpen, onClose }: AssetPreviewModalProps) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to add items to your cart",
        variant: "destructive",
      });
      return;
    }

    addToCart({
      assetId: asset.id,
      licenseType: "standard",
    });

    toast({
      title: "Added to cart",
      description: `${asset.title} has been added to your cart`,
    });

    onClose();
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to purchase items",
        variant: "destructive",
      });
      return;
    }

    addToCart({
      assetId: asset.id,
      licenseType: "standard",
    });

    navigate("/checkout");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader className="border-b border-neutral-200 pb-2">
          <div className="flex justify-between items-center">
            <DialogTitle className="font-medium text-lg text-neutral-800">
              Preview
            </DialogTitle>
            <DialogClose className="text-neutral-500 hover:text-neutral-700">
              <X className="h-5 w-5" />
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="p-4">
          {/* Watermarked preview image */}
          <div className="relative">
            <div className="overflow-hidden relative">
              <img
                src={asset.thumbnailUrl}
                alt={asset.title}
                className="mx-auto max-h-[60vh] object-contain"
              />
              {/* Watermark overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-white text-opacity-70 text-3xl font-bold transform rotate-[-30deg]">
                  JawaStock
                </div>
              </div>
            </div>
          </div>

          {/* Asset details */}
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-medium text-neutral-800">
                {asset.title}
              </h3>
              <span className="text-lg font-medium text-primary">
                {formatPrice(asset.price)}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {asset.tags?.map((tag, index) => (
                <Badge key={index} variant="secondary" className="bg-neutral-100 text-neutral-600">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Description */}
            <p className="text-neutral-600 mb-6">
              {asset.description || "No description available."}
            </p>

            {/* Asset information */}
            <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-sm">
                <span className="block text-neutral-500">Type</span>
                <span className="font-medium">
                  {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
                </span>
              </div>
              {asset.width && asset.height && (
                <div className="text-sm">
                  <span className="block text-neutral-500">Dimensions</span>
                  <span className="font-medium">
                    {asset.width} x {asset.height}
                  </span>
                </div>
              )}
              {asset.fileSize && (
                <div className="text-sm">
                  <span className="block text-neutral-500">File size</span>
                  <span className="font-medium">
                    {Math.round(asset.fileSize / 1024 / 1024)} MB
                  </span>
                </div>
              )}
              {asset.duration && (
                <div className="text-sm">
                  <span className="block text-neutral-500">Duration</span>
                  <span className="font-medium">{asset.duration} seconds</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleAddToCart}
                className="bg-primary text-white hover:bg-primary-dark transition-colors"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
              <Button
                onClick={handleBuyNow}
                className="bg-secondary text-white hover:bg-secondary-dark transition-colors"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AssetPreviewModal;
