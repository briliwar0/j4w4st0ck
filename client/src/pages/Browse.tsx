import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Asset } from "@shared/schema";
import { Helmet } from "react-helmet";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AssetCard from "@/components/assets/AssetCard";
import VideoCard from "@/components/assets/VideoCard";
import IllustrationCard from "@/components/assets/IllustrationCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Search, ChevronDown, Filter, X } from "lucide-react";
import { allAssets } from "@/lib/sample-data";

const Browse = () => {
  const [location] = useLocation();
  // Parse the current URL query params
  const searchParams = new URLSearchParams(window.location.search);
  
  const initialQuery = searchParams.get("query") || "";
  const initialType = searchParams.get("type") || "all";
  
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [assetType, setAssetType] = useState(initialType);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [categories, setCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("newest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Build query params for API request
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    
    if (searchQuery) {
      params.append("query", searchQuery);
    }
    
    if (assetType && assetType !== "all") {
      params.append("type", assetType);
    }
    
    if (categories.length > 0) {
      categories.forEach(category => {
        params.append("categories", category);
      });
    }
    
    return params.toString();
  };

  // Fetch assets based on filters
  const { data: assets, isLoading, error } = useQuery({
    queryKey: ["/api/assets", { query: searchQuery, type: assetType, categories }],
    queryFn: async () => {
      const queryParams = buildQueryParams();
      const url = `/api/assets${queryParams ? `?${queryParams}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch assets");
      }
      return response.json();
    },
    placeholderData: allAssets, // Use sample data until API returns
  });

  // Filter assets client-side for price range and sorting
  const filteredAssets = assets
    ? assets.filter(
        (asset: Asset) =>
          asset.price >= priceRange[0] && asset.price <= priceRange[1]
      )
    : [];

  // Sort assets based on selected sort option
  const sortedAssets = [...filteredAssets].sort((a: Asset, b: Asset) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "oldest":
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case "price_high":
        return b.price - a.price;
      case "price_low":
        return a.price - b.price;
      default:
        return 0;
    }
  });

  // Get navigate function outside of handleSearch
  const [, navigate] = useLocation();
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Update URL with search params
    const params = new URLSearchParams();
    if (searchQuery) params.append("query", searchQuery);
    if (assetType && assetType !== "all") params.append("type", assetType);
    navigate(`/browse?${params.toString()}`);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setAssetType("all");
    setPriceRange([0, 5000]);
    setCategories([]);
    setSortBy("newest");
  };

  // Toggle category selection
  const toggleCategory = (category: string) => {
    setCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  // Available categories
  const availableCategories = [
    "nature",
    "business",
    "technology",
    "people",
    "food",
    "travel",
    "backgrounds",
    "icons",
    "lifestyle",
    "fashion",
  ];

  return (
    <>
      <Helmet>
        <title>Browse Assets | JawaStock</title>
        <meta
          name="description"
          content="Browse and search for high-quality stock photos, videos, vectors, illustrations, and more."
        />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-neutral-50 py-8">
          <div className="container mx-auto px-4">
            {/* Search bar */}
            <Card className="mb-8">
              <CardContent className="p-4">
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Select
                    value={assetType}
                    onValueChange={setAssetType}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="All Assets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assets</SelectItem>
                      <SelectItem value="photo">Photos</SelectItem>
                      <SelectItem value="video">Videos</SelectItem>
                      <SelectItem value="vector">Vectors</SelectItem>
                      <SelectItem value="illustration">Illustrations</SelectItem>
                      <SelectItem value="music">Music</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                    <Input
                      type="text"
                      placeholder="Search for assets..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="bg-primary hover:bg-primary-dark">
                    Search
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="flex flex-col md:flex-row gap-6">
              {/* Mobile filter button */}
              <div className="md:hidden mb-4">
                <Button
                  onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                  variant="outline"
                  className="w-full flex justify-between items-center"
                >
                  <span className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              {/* Filters - desktop and mobile */}
              <div
                className={`md:w-1/4 space-y-6 ${
                  mobileFiltersOpen ? "block" : "hidden md:block"
                }`}
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle>Filters</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetFilters}
                        className="h-8 text-primary"
                      >
                        Reset
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">Asset Type</h3>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="type-all"
                            checked={assetType === "all" || assetType === ""}
                            onCheckedChange={() => setAssetType("all")}
                          />
                          <Label
                            htmlFor="type-all"
                            className="capitalize"
                          >
                            All
                          </Label>
                        </div>
                        {["photo", "video", "vector", "illustration", "music"].map(
                          (type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                id={`type-${type}`}
                                checked={assetType === type}
                                onCheckedChange={() =>
                                  setAssetType(assetType === type ? "all" : type)
                                }
                              />
                              <Label
                                htmlFor={`type-${type}`}
                                className="capitalize"
                              >
                                {type}
                              </Label>
                            </div>
                          )
                        )}
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h3 className="font-medium">Price Range</h3>
                      <Slider
                        defaultValue={[0, 5000]}
                        max={5000}
                        step={100}
                        value={priceRange}
                        onValueChange={(value) => setPriceRange(value as [number, number])}
                        className="py-4"
                      />
                      <div className="flex justify-between">
                        <span>
                          ${(priceRange[0] / 100).toFixed(2)}
                        </span>
                        <span>
                          ${(priceRange[1] / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="categories">
                        <AccordionTrigger>Categories</AccordionTrigger>
                        <AccordionContent>
                          <div className="grid grid-cols-1 gap-2">
                            {availableCategories.map((category) => (
                              <div
                                key={category}
                                className="flex items-center space-x-2"
                              >
                                <Checkbox
                                  id={`category-${category}`}
                                  checked={categories.includes(category)}
                                  onCheckedChange={() =>
                                    toggleCategory(category)
                                  }
                                />
                                <Label
                                  htmlFor={`category-${category}`}
                                  className="capitalize"
                                >
                                  {category}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              </div>

              {/* Results */}
              <div className="md:w-3/4">
                {/* Results header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                  <div>
                    <h2 className="text-xl font-bold">
                      {isLoading
                        ? "Loading assets..."
                        : `${sortedAssets.length} results`}
                    </h2>
                    {searchQuery && (
                      <p className="text-sm text-neutral-500">
                        Search results for "{searchQuery}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center">
                    <span className="text-sm text-neutral-500 mr-2">Sort by:</span>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="oldest">Oldest</SelectItem>
                        <SelectItem value="price_high">Price: High to Low</SelectItem>
                        <SelectItem value="price_low">Price: Low to High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Active filters */}
                {((assetType && assetType !== "all") || categories.length > 0 || searchQuery) && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {assetType && assetType !== "all" && (
                      <Badge type={assetType} onRemove={() => setAssetType("all")} />
                    )}
                    {categories.map((category) => (
                      <Badge
                        key={category}
                        type={category}
                        onRemove={() => toggleCategory(category)}
                      />
                    ))}
                    {searchQuery && (
                      <Badge
                        type={`"${searchQuery}"`}
                        onRemove={() => setSearchQuery("")}
                      />
                    )}
                  </div>
                )}

                {/* Results grid */}
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
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
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-lg text-neutral-600">
                      An error occurred while fetching assets.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : sortedAssets.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-lg text-neutral-600">
                      No assets found matching your criteria.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={resetFilters}
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {sortedAssets.map((asset: Asset) => {
                      if (asset.type === "video") {
                        return <VideoCard key={asset.id} video={asset} />;
                      } else if (
                        asset.type === "illustration" ||
                        asset.type === "vector"
                      ) {
                        return (
                          <IllustrationCard
                            key={asset.id}
                            illustration={asset}
                          />
                        );
                      } else {
                        return <AssetCard key={asset.id} asset={asset} />;
                      }
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

// Helper component for active filters
const Badge = ({
  type,
  onRemove,
}: {
  type: string;
  onRemove: () => void;
}) => {
  return (
    <div className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm flex items-center">
      <span className="capitalize">{type}</span>
      <button
        onClick={onRemove}
        className="ml-2 focus:outline-none"
        aria-label={`Remove ${type} filter`}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
};

export default Browse;
