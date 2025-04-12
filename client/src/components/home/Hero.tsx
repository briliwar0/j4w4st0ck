import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const Hero = () => {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      const queryParam = selectedCategory === "all" 
        ? `query=${encodeURIComponent(searchTerm)}`
        : `query=${encodeURIComponent(searchTerm)}&type=${selectedCategory}`;
      navigate(`/browse?${queryParam}`);
    }
  };

  const categories = [
    { id: "all", label: "All" },
    { id: "photo", label: "Photos" },
    { id: "vector", label: "Vectors" },
    { id: "illustration", label: "Illustrations" },
    { id: "video", label: "Videos" },
    { id: "music", label: "Music" },
  ];

  return (
    <section className="relative h-[500px] overflow-hidden">
      {/* Hero Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 to-primary/90 z-10"></div>
      <img
        src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&h=500&fit=crop"
        alt="Creative workspace"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Hero Content */}
      <div className="container mx-auto px-4 h-full flex flex-col justify-center items-center relative z-20">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-center mb-4">
          Discover High-Quality Stock Assets
        </h1>
        <p className="text-lg md:text-xl text-white text-center mb-8 max-w-3xl">
          Millions of royalty-free images, videos, and digital assets for your
          creative projects
        </p>

        {/* Search Box */}
        <div className="w-full max-w-3xl">
          <form onSubmit={handleSearch} className="relative">
            <div className="search-box bg-white rounded-lg flex items-center p-1 shadow-lg">
              <div className="hidden md:flex items-center px-3 border-r border-neutral-200">
                <span className="text-neutral-500">All Assets</span>
                <svg
                  className="ml-2 h-4 w-4 text-neutral-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 0 1 1.414 0L10 10.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 0-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <Input
                type="text"
                placeholder="Search photos, videos, vectors and more..."
                className="flex-1 p-3 border-none focus:outline-none text-neutral-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button
                type="submit"
                className="bg-primary text-white px-5 py-3 rounded-md hover:bg-primary-dark transition-colors"
              >
                <Search className="mr-2 h-4 w-4" />
                <span>Search</span>
              </Button>
            </div>
          </form>

          {/* Category Pills */}
          <div className="flex justify-center mt-6 flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  selectedCategory === category.id
                    ? "bg-primary text-white"
                    : "bg-neutral-100 text-neutral-700"
                }`}
                variant="ghost"
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
