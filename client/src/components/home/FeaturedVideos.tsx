import { Link } from "wouter";
import VideoCard from "@/components/assets/VideoCard";
import { featuredVideos } from "@/lib/sample-data";
import { useQuery } from "@tanstack/react-query";

const FeaturedVideos = () => {
  const { data: videos, isLoading } = useQuery({
    queryKey: ["/api/assets", { type: "video", limit: 4 }],
    queryFn: () => fetch("/api/assets?type=video&limit=4").then(res => res.json()),
    placeholderData: featuredVideos, // Use sample data until API returns
    staleTime: 60000, // 1 minute
  });

  return (
    <section className="py-12 bg-neutral-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-neutral-800">Featured Videos</h2>
          <Link href="/browse?type=video" className="text-primary font-medium hover:underline">
            View All
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden shadow-md">
                <div className="animate-pulse">
                  <div className="bg-neutral-200 h-48 w-full"></div>
                  <div className="p-3">
                    <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.isArray(videos) && videos.length > 0 
              ? videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))
              : <div className="col-span-4 text-center py-8 text-gray-500">No featured videos available at the moment.</div>
            }
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedVideos;
