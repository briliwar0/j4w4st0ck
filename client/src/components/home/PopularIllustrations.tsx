import { Link } from "wouter";
import IllustrationCard from "@/components/assets/IllustrationCard";
import { popularIllustrations } from "@/lib/sample-data";
import { useQuery } from "@tanstack/react-query";

const PopularIllustrations = () => {
  // Fetch only illustrations first
  const { data: illustrationsData, isLoading: illustrationsLoading } = useQuery({
    queryKey: ["/api/assets", { type: "illustration", limit: 6 }],
    queryFn: () => fetch("/api/assets?type=illustration&limit=6").then(res => res.json()),
    staleTime: 60000, // 1 minute
  });
  
  // Fetch vectors separately
  const { data: vectorsData, isLoading: vectorsLoading } = useQuery({
    queryKey: ["/api/assets", { type: "vector", limit: 6 }],
    queryFn: () => fetch("/api/assets?type=vector&limit=6").then(res => res.json()),
    staleTime: 60000, // 1 minute
  });
  
  // Combine the results and limit to 6 total items
  const illustrations = 
    illustrationsData && vectorsData 
      ? [...(illustrationsData || []), ...(vectorsData || [])].slice(0, 6)
      : (illustrationsData || vectorsData || popularIllustrations);
  
  const isLoading = illustrationsLoading || vectorsLoading;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-neutral-800">
            Popular Illustrations & Vectors
          </h2>
          <Link
            href="/browse?type=illustration,vector"
            className="text-primary font-medium hover:underline"
          >
            View All
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden shadow-md">
                <div className="animate-pulse">
                  <div className="bg-neutral-200 aspect-square w-full"></div>
                  <div className="p-2">
                    <div className="h-3 bg-neutral-200 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {illustrations.map((illustration) => (
              <IllustrationCard key={illustration.id} illustration={illustration} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularIllustrations;
