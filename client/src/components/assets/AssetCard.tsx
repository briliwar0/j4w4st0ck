import { useState } from "react";
import { Link } from "wouter";
import { Asset } from "@shared/schema";
import { Star, Eye } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import AssetPreviewModal from "./AssetPreviewModal";

interface AssetCardProps {
  asset: Asset;
}

const AssetCard = ({ asset }: AssetCardProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <>
      <div className="group relative rounded-lg overflow-hidden shadow-md transition-all hover:shadow-lg">
        <div className="relative">
          <img
            src={asset.thumbnailUrl}
            alt={asset.title}
            className="w-full h-64 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="bg-white/90 text-neutral-800 text-xs px-2 py-1 rounded-sm">
                {asset.type.charAt(0).toUpperCase() + asset.type.slice(1)}
              </span>
              <button
                className="bg-primary text-white text-sm px-3 py-1 rounded-md hover:bg-primary-dark transition-colors"
                onClick={() => setIsPreviewOpen(true)}
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-3">
          <Link href={`/assets/${asset.id}`} className="block">
            <h3 className="font-medium text-neutral-800 truncate">{asset.title}</h3>
            <div className="flex justify-between items-center mt-2">
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-xs text-neutral-600">4.8</span>
              </div>
              <span className="text-sm font-medium text-primary">
                {formatPrice(asset.price)}
              </span>
            </div>
          </Link>
        </div>
      </div>

      <AssetPreviewModal
        asset={asset}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </>
  );
};

export default AssetCard;
