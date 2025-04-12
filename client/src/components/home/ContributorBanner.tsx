import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

const ContributorBanner = () => {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const handleJoinNow = () => {
    if (isAuthenticated && user) {
      navigate("/upload");
    } else {
      navigate("/dashboard?become_contributor=true");
    }
  };

  return (
    <section className="py-16 bg-gradient-to-r from-secondary to-primary">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="text-center md:text-left mb-8 md:mb-0">
            <h2 className="text-3xl font-bold text-white mb-4">
              Become a Contributor
            </h2>
            <p className="text-white/80 text-lg max-w-xl">
              Turn your creativity into income. Join our community of
              contributors and start selling your photos, videos, and
              illustrations today.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 justify-center md:justify-start">
              <Button
                className="bg-white text-primary font-medium hover:bg-neutral-100 transition-colors"
                onClick={handleJoinNow}
              >
                Join Now
              </Button>
              <Button
                variant="outline"
                className="bg-transparent text-white border border-white font-medium hover:bg-white/10 transition-colors"
                asChild
              >
                <Link href="/about/contributors">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:block w-full md:w-1/3 lg:w-1/4">
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400"
              alt="Creative professional with camera"
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContributorBanner;
