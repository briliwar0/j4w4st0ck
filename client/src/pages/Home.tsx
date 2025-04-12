import { Helmet } from "react-helmet";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import TrendingAssets from "@/components/home/TrendingAssets";
import FeaturedVideos from "@/components/home/FeaturedVideos";
import PopularIllustrations from "@/components/home/PopularIllustrations";
import ContributorBanner from "@/components/home/ContributorBanner";

const Home = () => {
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
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Home;
