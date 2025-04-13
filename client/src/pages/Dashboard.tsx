import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { formatPrice } from "@/lib/utils";
import { allAssets } from "@/lib/sample-data";
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  User,
  Download,
  Upload,
  ShoppingCart,
  Heart,
  Settings,
  LogOut,
  Image,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";

const Dashboard = () => {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Get search parameters to see if we should show the become_contributor message
  const searchParams = new URLSearchParams(window.location.search);
  const showContributorMessage = searchParams.get("become_contributor") === "true";

  // Fetch purchases
  const { data: purchases, isLoading: isPurchasesLoading } = useQuery({
    queryKey: ["/api/purchases"],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      const response = await fetch("/api/purchases", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch purchases");
      }
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Fetch user assets (if contributor)
  const { data: userAssets, isLoading: isAssetsLoading } = useQuery({
    queryKey: ["/api/assets/author", user?.id],
    queryFn: async () => {
      if (!isAuthenticated || !user || (user.role !== "contributor" && user.role !== "admin")) {
        return [];
      }
      const response = await fetch(`/api/assets/author/${user.id}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch user assets");
      }
      return response.json();
    },
    enabled: isAuthenticated && user && (user.role === "contributor" || user.role === "admin"),
    placeholderData: allAssets.filter(asset => asset.authorId === user?.id),
  });

  // Check if user is authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect due to useEffect
  }

  // Determine downloaded assets
  const downloadedAssets = purchases
    ? purchases.map((purchase: any) => {
        const asset = allAssets.find((a) => a.id === purchase.assetId);
        return {
          ...purchase,
          asset,
        };
      })
    : [];

  // Contributor stats
  const pendingAssets = userAssets?.filter((asset: any) => asset.status === "pending").length || 0;
  const approvedAssets = userAssets?.filter((asset: any) => asset.status === "approved").length || 0;
  const rejectedAssets = userAssets?.filter((asset: any) => asset.status === "rejected").length || 0;

  return (
    <>
      <Helmet>
        <title>Dashboard | JawaStock</title>
        <meta
          name="description"
          content="Manage your JawaStock account, view purchases, and track your content."
        />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-neutral-50 py-8">
          <div className="container mx-auto px-4">
            {/* User profile header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.profileImage} alt={user.username} />
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold">
                    {user.firstName
                      ? `${user.firstName} ${user.lastName || ""}`
                      : user.username}
                  </h1>
                  <div className="flex items-center gap-2">
                    <p className="text-neutral-600">@{user.username}</p>
                    <Badge>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                {user.role === "user" && (
                  <Button
                    onClick={() => navigate("/dashboard?become_contributor=true")}
                    className="bg-primary hover:bg-primary-dark"
                  >
                    Become a Contributor
                  </Button>
                )}
                {(user.role === "contributor" || user.role === "admin") && (
                  <Button
                    onClick={() => navigate("/upload")}
                    className="bg-primary hover:bg-primary-dark"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New Asset
                  </Button>
                )}
                <Button variant="outline" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>

            {/* Contributor message (conditional) */}
            {showContributorMessage && (
              <Card className="mb-8 border-primary/20 bg-primary/5">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-primary mb-2">
                        Become a JawaStock Contributor
                      </h2>
                      <p className="text-neutral-700 mb-4">
                        Share your creativity with millions of users and earn money
                        with every download. Join our community of photographers,
                        videographers, illustrators, and designers.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Button className="bg-primary hover:bg-primary-dark">
                          Apply Now
                        </Button>
                        <Button variant="outline">Learn More</Button>
                      </div>
                    </div>
                    <img
                      src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300"
                      alt="Contributor"
                      className="w-[200px] h-[150px] object-cover rounded-md shadow-md hidden md:block"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dashboard tabs */}
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-8">
                <TabsTrigger value="overview" className="gap-2">
                  <BarChart className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="downloads" className="gap-2">
                  <Download className="h-4 w-4" />
                  Downloads
                </TabsTrigger>
                {(user.role === "contributor" || user.role === "admin") && (
                  <TabsTrigger value="uploads" className="gap-2">
                    <Upload className="h-4 w-4" />
                    My Uploads
                  </TabsTrigger>
                )}
                <TabsTrigger value="favorites" className="gap-2">
                  <Heart className="h-4 w-4" />
                  Favorites
                </TabsTrigger>
                <TabsTrigger value="settings" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex justify-between items-center">
                        <span>Downloads</span>
                        <Download className="h-4 w-4 text-primary" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{downloadedAssets.length}</p>
                      <p className="text-sm text-neutral-500">
                        Total assets downloaded
                      </p>
                    </CardContent>
                  </Card>

                  {(user.role === "contributor" || user.role === "admin") && (
                    <>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex justify-between items-center">
                            <span>Uploads</span>
                            <Upload className="h-4 w-4 text-primary" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">{userAssets?.length || 0}</p>
                          <p className="text-sm text-neutral-500">
                            Total assets uploaded
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex justify-between items-center">
                            <span>Sales</span>
                            <ShoppingCart className="h-4 w-4 text-primary" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">0</p>
                          <p className="text-sm text-neutral-500">
                            Total sales of your assets
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex justify-between items-center">
                            <span>Earnings</span>
                            <span className="text-primary">$</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">$0.00</p>
                          <p className="text-sm text-neutral-500">
                            Total earnings to date
                          </p>
                        </CardContent>
                      </Card>
                    </>
                  )}

                  {user.role === "user" && (
                    <>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex justify-between items-center">
                            <span>Favorites</span>
                            <Heart className="h-4 w-4 text-primary" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">0</p>
                          <p className="text-sm text-neutral-500">
                            Saved items
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-lg flex justify-between items-center">
                            <span>Recent</span>
                            <Clock className="h-4 w-4 text-primary" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-3xl font-bold">{downloadedAssets.length > 0 ? downloadedAssets.length : 0}</p>
                          <p className="text-sm text-neutral-500">
                            Recently viewed items
                          </p>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </div>

                {(user.role === "contributor" || user.role === "admin") && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                      <CardHeader>
                        <CardTitle>Asset Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-amber-400 mr-2"></div>
                              Pending Review
                            </span>
                            <Badge variant="outline">{pendingAssets}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                              Approved
                            </span>
                            <Badge variant="outline">{approvedAssets}</Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                              Rejected
                            </span>
                            <Badge variant="outline">{rejectedAssets}</Badge>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button variant="outline" className="w-full" onClick={() => setActiveTab("uploads")}>
                          View All Uploads
                        </Button>
                      </CardFooter>
                    </Card>

                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle>Recent Sales</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-neutral-500">
                          <p>No sales data available yet.</p>
                          <p className="text-sm mt-2">
                            Your sales will appear here once your assets start selling.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Downloads</CardTitle>
                    <CardDescription>
                      Your recently purchased and downloaded assets
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isPurchasesLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-neutral-500">Loading downloads...</p>
                      </div>
                    ) : downloadedAssets.length > 0 ? (
                      <div className="space-y-4">
                        {downloadedAssets.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                              {item.asset && (
                                <img
                                  src={item.asset.thumbnailUrl}
                                  alt={item.asset.title}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">
                                {item.asset ? item.asset.title : "Asset"}
                              </h3>
                              <p className="text-sm text-neutral-500">
                                Downloaded on{" "}
                                {new Date(item.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-shrink-0"
                              onClick={() => window.open(item.downloadUrl, "_blank")}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-neutral-500">
                        <p>You haven't downloaded any assets yet.</p>
                        <Button
                          className="mt-4"
                          onClick={() => navigate("/browse")}
                        >
                          Browse Assets
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Downloads Tab */}
              <TabsContent value="downloads">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Downloads</CardTitle>
                    <CardDescription>
                      All assets you've purchased and downloaded
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isPurchasesLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-neutral-500">Loading downloads...</p>
                      </div>
                    ) : downloadedAssets.length > 0 ? (
                      <div className="space-y-6">
                        {downloadedAssets.map((item: any) => (
                          <div key={item.id}>
                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="w-full sm:w-32 h-24 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                                {item.asset && (
                                  <img
                                    src={item.asset.thumbnailUrl}
                                    alt={item.asset.title}
                                    className="w-full h-full object-cover"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium">
                                  {item.asset ? item.asset.title : "Asset"}
                                </h3>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  <Badge variant="outline" className="capitalize">
                                    {item.asset ? item.asset.type : "Unknown"}
                                  </Badge>
                                  <Badge variant="outline" className="capitalize">
                                    {item.licenseType}
                                  </Badge>
                                </div>
                                <div className="flex justify-between mt-3">
                                  <p className="text-sm text-neutral-500">
                                    Downloaded on{" "}
                                    {new Date(item.createdAt).toLocaleDateString()}
                                  </p>
                                  <p className="text-sm font-medium">
                                    {formatPrice(item.price)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                className="mr-2"
                                onClick={() => window.open(item.downloadUrl, "_blank")}
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/assets/${item.assetId}`)}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </div>
                            <Separator className="mt-6" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-neutral-500">
                        <p>You haven't downloaded any assets yet.</p>
                        <Button
                          className="mt-4"
                          onClick={() => navigate("/browse")}
                        >
                          Browse Assets
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Uploads Tab */}
              <TabsContent value="uploads">
                {(user.role === "contributor" || user.role === "admin") && (
                  <div className="mb-8">
                    <PerformanceMetrics />
                  </div>
                )}
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle>Your Uploads</CardTitle>
                      <CardDescription>
                        Manage your contributed assets
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => navigate("/upload")}
                      className="bg-primary hover:bg-primary-dark"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload New
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {isAssetsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-neutral-500">Loading your uploads...</p>
                      </div>
                    ) : userAssets?.length > 0 ? (
                      <div className="space-y-6">
                        {userAssets.map((asset: any) => (
                          <div key={asset.id}>
                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="w-full sm:w-32 h-24 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                                <img
                                  src={asset.thumbnailUrl}
                                  alt={asset.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between">
                                  <h3 className="font-medium">{asset.title}</h3>
                                  <Badge
                                    className={
                                      asset.status === "approved"
                                        ? "bg-green-100 text-green-800"
                                        : asset.status === "rejected"
                                        ? "bg-red-100 text-red-800"
                                        : "bg-amber-100 text-amber-800"
                                    }
                                  >
                                    {asset.status.charAt(0).toUpperCase() +
                                      asset.status.slice(1)}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-1">
                                  <Badge variant="outline" className="capitalize">
                                    {asset.type}
                                  </Badge>
                                  {asset.categories?.map((category: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="capitalize">
                                      {category}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex justify-between mt-3">
                                  <p className="text-sm text-neutral-500">
                                    Uploaded on{" "}
                                    {new Date(asset.createdAt).toLocaleDateString()}
                                  </p>
                                  <p className="text-sm font-medium">
                                    {formatPrice(asset.price)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end mt-4">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/assets/${asset.id}`)}
                              >
                                <Image className="h-4 w-4 mr-2" />
                                View Asset
                              </Button>
                            </div>
                            <Separator className="mt-6" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-neutral-500">
                        <p>You haven't uploaded any assets yet.</p>
                        <Button
                          className="mt-4"
                          onClick={() => navigate("/upload")}
                        >
                          Upload Your First Asset
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Favorites Tab */}
              <TabsContent value="favorites">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Favorites</CardTitle>
                    <CardDescription>
                      Assets you've saved to your favorites
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-neutral-500">
                      <p>You haven't added any favorites yet.</p>
                      <p className="text-sm mt-2">
                        Click the heart icon on any asset to add it to your favorites.
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => navigate("/browse")}
                      >
                        Browse Assets
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle>Account Settings</CardTitle>
                      <CardDescription>
                        Update your personal information and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form className="space-y-6">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label
                                htmlFor="firstName"
                                className="text-sm font-medium"
                              >
                                First Name
                              </label>
                              <input
                                id="firstName"
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                defaultValue={user.firstName || ""}
                              />
                            </div>
                            <div className="space-y-2">
                              <label
                                htmlFor="lastName"
                                className="text-sm font-medium"
                              >
                                Last Name
                              </label>
                              <input
                                id="lastName"
                                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                defaultValue={user.lastName || ""}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="email"
                              className="text-sm font-medium"
                            >
                              Email Address
                            </label>
                            <input
                              id="email"
                              type="email"
                              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              defaultValue={user.email}
                            />
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="username"
                              className="text-sm font-medium"
                            >
                              Username
                            </label>
                            <input
                              id="username"
                              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              defaultValue={user.username}
                            />
                          </div>

                          <div className="space-y-2">
                            <label
                              htmlFor="bio"
                              className="text-sm font-medium"
                            >
                              Bio
                            </label>
                            <textarea
                              id="bio"
                              rows={4}
                              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              defaultValue={user.bio || ""}
                              placeholder="Tell us about yourself..."
                            ></textarea>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button className="bg-primary hover:bg-primary-dark">
                            Save Changes
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>

                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Profile Picture</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center">
                          <Avatar className="h-24 w-24 mb-4">
                            <AvatarImage src={user.profileImage} alt={user.username} />
                            <AvatarFallback className="bg-primary text-white text-3xl">
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <Button variant="outline" className="w-full">
                            Change Picture
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Account Security</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button variant="outline" className="w-full justify-between">
                          Change Password
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" className="w-full justify-between">
                          Two-Factor Authentication
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Dashboard;
