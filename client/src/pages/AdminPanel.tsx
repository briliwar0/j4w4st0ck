import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { allAssets } from "@/lib/sample-data";

import {
  Card,
  CardContent,
  CardDescription,
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  Users,
  CheckCircle,
  XCircle,
  Search,
  Eye,
  Info,
  AlertTriangle,
} from "lucide-react";

const AdminPanel = () => {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  // Check if user is admin
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        toast({
          title: "Authentication required",
          description: "Please sign in to access the admin panel",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      if (user && user.role !== "admin") {
        toast({
          title: "Access denied",
          description: "Only administrators can access this page",
          variant: "destructive",
        });
        navigate("/");
      }
    }
  }, [isAuthenticated, user, isLoading, navigate, toast]);

  // Fetch pending assets
  const { data: pendingAssets, isLoading: isPendingAssetsLoading } = useQuery({
    queryKey: ["/api/admin/pending-assets"],
    queryFn: async () => {
      if (!isAuthenticated || user?.role !== "admin") return [];
      const response = await fetch("/api/admin/pending-assets", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch pending assets");
      }
      return response.json();
    },
    enabled: isAuthenticated && user?.role === "admin",
    placeholderData: allAssets.filter(asset => asset.status === "pending"),
  });

  // Fetch all users
  const { data: allUsers, isLoading: isUsersLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      if (!isAuthenticated || user?.role !== "admin") return [];
      const response = await fetch("/api/users", {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      return response.json();
    },
    enabled: isAuthenticated && user?.role === "admin",
  });

  // Asset approval mutation
  const assetStatusMutation = useMutation({
    mutationFn: async ({ assetId, status }: { assetId: number, status: 'approved' | 'rejected' }) => {
      return apiRequest("PATCH", `/api/assets/${assetId}/status`, { status });
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-assets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/assets"] });
    },
  });

  // Handle asset approval
  const handleApproveAsset = async (assetId: number) => {
    try {
      await assetStatusMutation.mutateAsync({ assetId, status: 'approved' });
      toast({
        title: "Asset approved",
        description: "The asset has been approved and is now publicly available",
      });
    } catch (error) {
      console.error("Approval error:", error);
      toast({
        title: "Error",
        description: "Failed to approve asset",
        variant: "destructive",
      });
    }
  };

  // Handle asset rejection
  const handleRejectAsset = async (assetId: number) => {
    try {
      await assetStatusMutation.mutateAsync({ assetId, status: 'rejected' });
      toast({
        title: "Asset rejected",
        description: "The asset has been rejected",
      });
    } catch (error) {
      console.error("Rejection error:", error);
      toast({
        title: "Error",
        description: "Failed to reject asset",
        variant: "destructive",
      });
    }
  };

  // Filter users based on search term
  const filteredUsers = allUsers
    ? allUsers.filter((user: any) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

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

  if (!isAuthenticated || (user && user.role !== "admin")) {
    return null; // Will redirect due to useEffect
  }

  return (
    <>
      <Helmet>
        <title>Admin Panel | JawaStock</title>
        <meta
          name="description"
          content="JawaStock administrator control panel"
        />
      </Helmet>

      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow bg-neutral-50 py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold">Admin Panel</h1>
              <Badge className="bg-red-500">Admin Access</Badge>
            </div>

            <Tabs defaultValue="dashboard">
              <TabsList className="mb-8">
                <TabsTrigger value="dashboard" className="gap-2">
                  <BarChart className="h-4 w-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="users" className="gap-2">
                  <Users className="h-4 w-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="approvals" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Content Approvals
                </TabsTrigger>
              </TabsList>

              {/* Dashboard Tab */}
              <TabsContent value="dashboard">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Users</CardTitle>
                      <CardDescription>Total registered users</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {isUsersLoading ? "..." : allUsers?.length || 0}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Pending Approvals</CardTitle>
                      <CardDescription>Assets awaiting review</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {isPendingAssetsLoading ? "..." : pendingAssets?.length || 0}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Total Assets</CardTitle>
                      <CardDescription>All assets on platform</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {allAssets.length}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Platform Overview</CardTitle>
                    <CardDescription>
                      Key metrics and statistics for JawaStock
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-8">
                      <div className="space-y-2">
                        <h3 className="font-medium">Asset Distribution</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-neutral-500">Photos</div>
                              <div className="text-xl font-bold">
                                {allAssets.filter(a => a.type === "photo").length}
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-neutral-500">Videos</div>
                              <div className="text-xl font-bold">
                                {allAssets.filter(a => a.type === "video").length}
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-neutral-500">Vectors</div>
                              <div className="text-xl font-bold">
                                {allAssets.filter(a => a.type === "vector").length}
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-neutral-500">Illustrations</div>
                              <div className="text-xl font-bold">
                                {allAssets.filter(a => a.type === "illustration").length}
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-neutral-500">Music</div>
                              <div className="text-xl font-bold">
                                {allAssets.filter(a => a.type === "music").length}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-medium">User Roles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-neutral-500">Regular Users</div>
                              <div className="text-xl font-bold">
                                {isUsersLoading
                                  ? "..."
                                  : allUsers?.filter((u: any) => u.role === "user").length || 0}
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-neutral-500">Contributors</div>
                              <div className="text-xl font-bold">
                                {isUsersLoading
                                  ? "..."
                                  : allUsers?.filter((u: any) => u.role === "contributor").length || 0}
                              </div>
                            </CardContent>
                          </Card>
                          <Card>
                            <CardContent className="p-4">
                              <div className="text-sm text-neutral-500">Admins</div>
                              <div className="text-xl font-bold">
                                {isUsersLoading
                                  ? "..."
                                  : allUsers?.filter((u: any) => u.role === "admin").length || 0}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                      View and manage all registered users
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                        <Input
                          placeholder="Search users by username or email..."
                          className="pl-10"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>

                    {isUsersLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-neutral-500">Loading users...</p>
                      </div>
                    ) : filteredUsers.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-3 px-4 font-medium">Username</th>
                              <th className="text-left py-3 px-4 font-medium">Email</th>
                              <th className="text-left py-3 px-4 font-medium">Role</th>
                              <th className="text-left py-3 px-4 font-medium">Created</th>
                              <th className="text-right py-3 px-4 font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredUsers.map((user: any) => (
                              <tr key={user.id} className="border-b">
                                <td className="py-3 px-4">{user.username}</td>
                                <td className="py-3 px-4">{user.email}</td>
                                <td className="py-3 px-4">
                                  <Badge
                                    className={
                                      user.role === "admin"
                                        ? "bg-red-100 text-red-800"
                                        : user.role === "contributor"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-neutral-100 text-neutral-800"
                                    }
                                  >
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4">
                                  {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <Button variant="ghost" size="sm">
                                    <Info className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    Edit
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-neutral-500">
                        <p>No users found matching your search criteria.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Content Approvals Tab */}
              <TabsContent value="approvals">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Approvals</CardTitle>
                    <CardDescription>
                      Review and approve user-submitted assets
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isPendingAssetsLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-neutral-500">Loading pending assets...</p>
                      </div>
                    ) : pendingAssets?.length > 0 ? (
                      <div className="space-y-8">
                        {pendingAssets.map((asset: any) => (
                          <div key={asset.id}>
                            <div className="flex flex-col md:flex-row gap-6">
                              <div className="w-full md:w-1/3 h-48 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                                <img
                                  src={asset.thumbnailUrl}
                                  alt={asset.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between mb-2">
                                  <h3 className="text-xl font-medium">{asset.title}</h3>
                                  <Badge className="bg-amber-100 text-amber-800">
                                    Pending
                                  </Badge>
                                </div>
                                <p className="text-neutral-600 mb-4">
                                  {asset.description || "No description provided."}
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                  <div>
                                    <p className="text-sm text-neutral-500">Type</p>
                                    <p className="font-medium capitalize">{asset.type}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-neutral-500">Contributor</p>
                                    <p className="font-medium">ID: {asset.authorId}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-neutral-500">Price</p>
                                    <p className="font-medium">
                                      ${(asset.price / 100).toFixed(2)}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-neutral-500">Submitted</p>
                                    <p className="font-medium">
                                      {new Date(asset.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {asset.tags?.map((tag: string, idx: number) => (
                                    <Badge key={idx} variant="secondary" className="bg-neutral-100 text-neutral-600">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="flex flex-wrap gap-3">
                                  <Button
                                    onClick={() => window.open(asset.url, "_blank")}
                                    variant="outline"
                                  >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Preview Full Asset
                                  </Button>
                                  <Button
                                    onClick={() => handleApproveAsset(asset.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Approve
                                  </Button>
                                  <Button
                                    onClick={() => handleRejectAsset(asset.id)}
                                    variant="destructive"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <Separator className="mt-8" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertTriangle className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                        <p className="text-neutral-500">No assets pending approval.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default AdminPanel;
