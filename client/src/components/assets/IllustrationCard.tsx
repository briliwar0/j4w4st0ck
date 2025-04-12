import { useState } from "react";
import { Link } from "wouter";
import { Asset } from "@shared/schema";
import { Eye } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import AssetPreviewModal from "./AssetPreviewModal";

interface IllustrationCardProps {
  illustration: Asset;
}

const IllustrationCard = ({ illustration }: IllustrationCardProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <>
      <div className="group relative rounded-lg overflow-hidden shadow-md transition-all hover:shadow-lg">
        <div className="aspect-square bg-neutral-100">
          <img
            src={illustration.thumbnailUrl}
            alt={illustration.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <div className="flex justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                className="bg-primary text-white text-xs px-2 py-1 rounded-sm hover:bg-primary-dark transition-colors"
                onClick={() => setIsPreviewOpen(true)}
              >
                <Eye className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-2">
          <Link href={`/assets/${illustration.id}`} className="block">
            <h3 className="text-sm font-medium text-neutral-800 truncate">
              {illustration.title}
            </h3>
            <div className="flex justify-end mt-1">
              <span className="text-xs font-medium text-primary">
                {formatPrice(illustration.price)}
              </span>
            </div>
          </Link>
        </div>
      </div>

      <AssetPreviewModal
        asset={illustration}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </>
  );
};

export default IllustrationCard;
