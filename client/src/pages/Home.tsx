import { Helmet } from "react-helmet";
import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import TrendingAssets from "@/components/home/TrendingAssets";
import FeaturedVideos from "@/components/home/FeaturedVideos";
import PopularIllustrations from "@/components/home/PopularIllustrations";
import ContributorBanner from "@/components/home/ContributorBanner";
import { OnboardingTour } from "@/components/onboarding/OnboardingTour";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/feedback-toast";

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  useEffect(() => {
    // Check if user is newly registered or logged in for the first time
    const isFirstVisit = localStorage.getItem('jawastock_first_visit') !== 'true';
    
    if (isAuthenticated && isFirstVisit) {
      // Set first visit flag to true
      localStorage.setItem('jawastock_first_visit', 'true');
      
      // Show onboarding after a short delay
      setTimeout(() => {
        setShowOnboarding(true);
        
        // Show welcome toast
        toast.success({
          title: `Welcome${user?.firstName ? `, ${user.firstName}` : ''}!`,
          message: "We'll guide you through the main features of JawaStock."
        });
      }, 1500);
    }
  }, [isAuthenticated, user]);
  
  // Handle completion of onboarding
  const handleOnboardingComplete = () => {
    toast.success({
      title: 'Onboarding Complete',
      message: 'You can now explore JawaStock with confidence!'
    });
  };
  
  return (
    <>
      <Helmet>
        <title>JawaStock - Stock Photos, Videos & Digital Assets</title>
        <meta
          name="description"
          content="Discover millions of royalty-free stock photos, videos, vectors, illustrations, and music for your creative projects."
        />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Hero />
          <TrendingAssets />
          <FeaturedVideos />
          <PopularIllustrations />
          <ContributorBanner />
          
          {/* Onboarding Experience */}
          <OnboardingTour 
            forceShow={showOnboarding} 
            onComplete={handleOnboardingComplete}
          />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Home;
