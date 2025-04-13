import { Link } from "wouter";
import AssetCard from "@/components/assets/AssetCard";
import { trendingAssets } from "@/lib/sample-data";
import { useQuery } from "@tanstack/react-query";

const TrendingAssets = () => {
  const { data: assets, isLoading } = useQuery({
    queryKey: ["/api/assets", { limit: 4 }],
    queryFn: () => fetch("/api/assets?limit=4").then(res => res.json()),
    placeholderData: trendingAssets, // Use sample data until API returns
    staleTime: 60000, // 1 minute
  });

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-neutral-800">Trending Assets</h2>
          <Link href="/browse" className="text-primary font-medium hover:underline">
            View All
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden shadow-md">
                <div className="animate-pulse">
                  <div className="bg-neutral-200 h-64 w-full"></div>
                  <div className="p-3">
                    <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.isArray(assets) && assets.length > 0 
              ? assets.map((asset) => (
                  <AssetCard key={asset.id} asset={asset} />
                ))
              : <div className="col-span-4 text-center py-8 text-gray-500">No trending assets available at the moment.</div>
            }
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingAssets;
