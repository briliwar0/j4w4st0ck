import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  ArrowUpCircle, 
  BarChart2, 
  Download, 
  TrendingUp, 
  DollarSign,
  LineChart as LineChartIcon,
  Calendar
} from 'lucide-react';
import { BrandedSpinner } from '@/components/ui/branded-spinner';

// Sample data for demonstration
const DUMMY_VIEW_DATA = [
  { name: 'Jan', views: 120 },
  { name: 'Feb', views: 230 },
  { name: 'Mar', views: 450 },
  { name: 'Apr', views: 320 },
  { name: 'May', views: 380 },
  { name: 'Jun', views: 290 },
  { name: 'Jul', views: 420 },
  { name: 'Aug', views: 380 },
  { name: 'Sep', views: 510 },
  { name: 'Oct', views: 390 },
  { name: 'Nov', views: 620 },
  { name: 'Dec', views: 750 },
];

const DUMMY_DOWNLOAD_DATA = [
  { name: 'Jan', downloads: 12 },
  { name: 'Feb', downloads: 19 },
  { name: 'Mar', downloads: 25 },
  { name: 'Apr', downloads: 34 },
  { name: 'May', downloads: 21 },
  { name: 'Jun', downloads: 18 },
  { name: 'Jul', downloads: 22 },
  { name: 'Aug', downloads: 28 },
  { name: 'Sep', downloads: 42 },
  { name: 'Oct', downloads: 35 },
  { name: 'Nov', downloads: 53 },
  { name: 'Dec', downloads: 61 },
];

const DUMMY_REVENUE_DATA = [
  { name: 'Jan', revenue: 120 },
  { name: 'Feb', revenue: 190 },
  { name: 'Mar', revenue: 250 },
  { name: 'Apr', revenue: 340 },
  { name: 'May', revenue: 210 },
  { name: 'Jun', revenue: 180 },
  { name: 'Jul', revenue: 220 },
  { name: 'Aug', revenue: 280 },
  { name: 'Sep', revenue: 420 },
  { name: 'Oct', revenue: 350 },
  { name: 'Nov', revenue: 530 },
  { name: 'Dec', revenue: 610 },
];

const DUMMY_ENGAGEMENT_DATA = [
  { name: 'Jan', likes: 42, favorites: 23 },
  { name: 'Feb', likes: 53, favorites: 31 },
  { name: 'Mar', likes: 61, favorites: 43 },
  { name: 'Apr', likes: 78, favorites: 52 },
  { name: 'May', likes: 65, favorites: 48 },
  { name: 'Jun', likes: 59, favorites: 39 },
  { name: 'Jul', likes: 67, favorites: 45 },
  { name: 'Aug', likes: 73, favorites: 53 },
  { name: 'Sep', likes: 86, favorites: 63 },
  { name: 'Oct', likes: 79, favorites: 58 },
  { name: 'Nov', likes: 94, favorites: 71 },
  { name: 'Dec', likes: 105, favorites: 82 },
];

interface PerformanceMetricsProps {
  userId?: number;
  isLoading?: boolean;
}

export function PerformanceMetrics({ userId, isLoading = false }: PerformanceMetricsProps) {
  const [timeRange, setTimeRange] = useState('year');
  const [activeTab, setActiveTab] = useState('overview');
  
  // In a real app, we would fetch data based on the timeRange and userId
  // const { data, isLoading, error } = useQuery(['performance', userId, timeRange], 
  //   () => fetchPerformanceMetrics(userId, timeRange));
  
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>Loading your content performance metrics...</CardDescription>
        </CardHeader>
        <CardContent className="min-h-[400px] flex items-center justify-center">
          <BrandedSpinner size="lg" />
        </CardContent>
      </Card>
    );
  }
  
  const totalViews = DUMMY_VIEW_DATA.reduce((sum, item) => sum + item.views, 0);
  const totalDownloads = DUMMY_DOWNLOAD_DATA.reduce((sum, item) => sum + item.downloads, 0);
  const totalRevenue = DUMMY_REVENUE_DATA.reduce((sum, item) => sum + item.revenue, 0);
  const conversionRate = ((totalDownloads / totalViews) * 100).toFixed(1);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold">Performance Metrics</h2>
          <p className="text-muted-foreground">Track how your content is performing</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="quarter">Last 3 months</SelectItem>
              <SelectItem value="year">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Performance summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Views</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              {totalViews.toLocaleString()}
              <span className="text-sm text-green-500 font-normal flex items-center">
                <ArrowUpCircle className="h-4 w-4 mr-1" />
                12.5%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={DUMMY_VIEW_DATA}>
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#0ea5e9" 
                  strokeWidth={2} 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Downloads</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              {totalDownloads.toLocaleString()}
              <span className="text-sm text-green-500 font-normal flex items-center">
                <ArrowUpCircle className="h-4 w-4 mr-1" />
                8.3%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={60}>
              <BarChart data={DUMMY_DOWNLOAD_DATA}>
                <Bar 
                  dataKey="downloads" 
                  fill="#0ea5e9" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Revenue</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              ${totalRevenue.toLocaleString()}
              <span className="text-sm text-green-500 font-normal flex items-center">
                <ArrowUpCircle className="h-4 w-4 mr-1" />
                15.2%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={DUMMY_REVENUE_DATA}>
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Conversion Rate</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              {conversionRate}%
              <span className="text-sm text-amber-500 font-normal flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                0.8%
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-[60px] flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4 border-primary border-r-transparent animate-spin"></div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed charts */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="views" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Views
          </TabsTrigger>
          <TabsTrigger value="engagement" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Engagement
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Revenue
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChartIcon className="h-5 w-5" />
                Performance Overview
              </CardTitle>
              <CardDescription>Combined view of all key metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={DUMMY_VIEW_DATA} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="views" name="Views" stroke="#0ea5e9" activeDot={{ r: 8 }} strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="downloads" name="Downloads" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              Last updated: Today at 10:00 AM
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="views" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Views by Month
              </CardTitle>
              <CardDescription>Total views of all your content</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={DUMMY_VIEW_DATA} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="views" name="Views" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              Last updated: Today at 10:00 AM
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="engagement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Engagement Metrics
              </CardTitle>
              <CardDescription>Likes and favorites of your content</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={DUMMY_ENGAGEMENT_DATA} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="likes" name="Likes" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="favorites" name="Favorites" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              Last updated: Today at 10:00 AM
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Revenue Analytics
              </CardTitle>
              <CardDescription>Your earnings from content sales</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={DUMMY_REVENUE_DATA} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
              Last updated: Today at 10:00 AM
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}