import { useState } from "react";
import { Link } from "wouter";
import { Asset } from "@shared/schema";
import { Play } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import AssetPreviewModal from "./AssetPreviewModal";

interface VideoCardProps {
  video: Asset;
}

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const VideoCard = ({ video }: VideoCardProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  return (
    <>
      <div className="group relative rounded-lg overflow-hidden shadow-md transition-all hover:shadow-lg">
        <div className="aspect-w-16 aspect-h-9 bg-neutral-100 relative">
          <Link href={`/assets/${video.id}`}>
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-primary/80 rounded-full flex items-center justify-center text-white">
                <Play className="h-6 w-6" />
              </div>
            </div>
            {video.duration && (
              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                {formatDuration(video.duration)}
              </span>
            )}
          </Link>
        </div>
        <div className="p-3">
          <Link href={`/assets/${video.id}`} className="block">
            <h3 className="font-medium text-neutral-800 truncate">{video.title}</h3>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-neutral-600">
                {video.width && video.height
                  ? video.width >= 3840
                    ? "4K"
                    : video.width >= 1920
                    ? "HD"
                    : "SD"
                  : "HD"}{" "}
                • {video.duration ? Math.round(video.duration / 30) * 30 : 30}fps
              </span>
              <span className="text-sm font-medium text-primary">
                {formatPrice(video.price)}
              </span>
            </div>
          </Link>
        </div>
      </div>

      <AssetPreviewModal
        asset={video}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </>
  );
};

export default VideoCard;
