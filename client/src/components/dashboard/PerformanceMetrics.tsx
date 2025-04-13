import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  AreaChart,
  BarChart,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { 
  TrendingUp, 
  Download, 
  DollarSign, 
  Eye, 
  ShoppingCart, 
  Calendar, 
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart,
  Filter
} from 'lucide-react';
import { BrandedSpinner } from '@/components/ui/branded-spinner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/feedback-toast';

// Data definitions
interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  isLoading?: boolean;
}

interface AssetPerformance {
  id: number;
  title: string;
  views: number;
  downloads: number;
  sales: number;
  revenue: number;
  conversionRate: number;
  type: string;
}

interface ChartData {
  name: string;
  value: number;
  pv?: number;
  uv?: number;
  amt?: number;
  views?: number;
  downloads?: number;
  sales?: number;
  revenue?: number;
}

// Sample data (to be replaced with real API data)
const sampleLineData: ChartData[] = [
  { name: 'Jan', views: 4000, downloads: 2400, sales: 12, revenue: 240, value: 4000 },
  { name: 'Feb', views: 3000, downloads: 1398, sales: 10, revenue: 210, value: 3000 },
  { name: 'Mar', views: 2000, downloads: 9800, sales: 20, revenue: 290, value: 2000 },
  { name: 'Apr', views: 2780, downloads: 3908, sales: 12, revenue: 200, value: 2780 },
  { name: 'May', views: 1890, downloads: 4800, sales: 21, revenue: 318, value: 1890 },
  { name: 'Jun', views: 2390, downloads: 3800, sales: 25, revenue: 350, value: 2390 },
  { name: 'Jul', views: 3490, downloads: 4300, sales: 37, revenue: 410, value: 3490 },
];

const sampleAssetData: AssetPerformance[] = [
  { id: 1, title: 'Modern Business Meeting', views: 1200, downloads: 350, sales: 25, revenue: 125, conversionRate: 7.1, type: 'photo' },
  { id: 2, title: 'Abstract Background Loop', views: 3500, downloads: 780, sales: 120, revenue: 1200, conversionRate: 15.4, type: 'video' },
  { id: 3, title: 'Corporate Presentation Template', views: 900, downloads: 390, sales: 45, revenue: 675, conversionRate: 11.5, type: 'template' },
  { id: 4, title: 'Hand-drawn Icons Bundle', views: 1800, downloads: 540, sales: 76, revenue: 380, conversionRate: 14.1, type: 'illustration' },
  { id: 5, title: 'Minimalist Desktop Mockup', views: 2200, downloads: 680, sales: 95, revenue: 475, conversionRate: 14.0, type: 'photo' },
];

const sampleCategoryData: ChartData[] = [
  { name: 'Photos', value: 35 },
  { name: 'Videos', value: 40 },
  { name: 'Illustrations', value: 15 },
  { name: 'Templates', value: 10 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Component for each metric card
function MetricCard({ title, value, change, changeLabel, icon, trend = 'neutral', isLoading = false }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-24">
            <BrandedSpinner size="sm" />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <div className="flex items-baseline space-x-2">
                  <h2 className="text-3xl font-bold">{value}</h2>
                  <Badge 
                    variant={trend === 'up' ? 'default' : trend === 'down' ? 'destructive' : 'outline'}
                    className="flex items-center"
                  >
                    {trend === 'up' ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : trend === 'down' ? (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    ) : null}
                    {change}%
                  </Badge>
                </div>
              </div>
              <div className="rounded-md bg-primary/10 p-2">
                {icon}
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{changeLabel}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Main Performance Metrics Component
export function PerformanceMetrics() {
  const [period, setPeriod] = useState('month');
  const [isLoading, setIsLoading] = useState(false);
  const [chartType, setChartType] = useState('area');

  // Function to reload data
  const refreshData = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success({
        title: 'Data Refreshed',
        message: 'Your performance metrics have been updated with the latest data.'
      });
    }, 1500);
  };

  // Filters change
  const handlePeriodChange = (value: string) => {
    setPeriod(value);
    refreshData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Creator Dashboard</h2>
          <p className="text-muted-foreground">
            Track your content performance and earnings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={refreshData} disabled={isLoading}>
            {isLoading ? <BrandedSpinner size="xs" className="mr-2" /> : null}
            Refresh
          </Button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Views"
          value="24.5K"
          change={12.5}
          changeLabel="12.5% from last month"
          icon={<Eye className="h-4 w-4 text-primary" />}
          trend="up"
          isLoading={isLoading}
        />
        <MetricCard
          title="Downloads"
          value="3.2K"
          change={8.2}
          changeLabel="8.2% from last month"
          icon={<Download className="h-4 w-4 text-primary" />}
          trend="up"
          isLoading={isLoading}
        />
        <MetricCard
          title="Sales"
          value="487"
          change={-3.1}
          changeLabel="-3.1% from last month"
          icon={<ShoppingCart className="h-4 w-4 text-primary" />}
          trend="down"
          isLoading={isLoading}
        />
        <MetricCard
          title="Revenue"
          value="$5,240"
          change={15.3}
          changeLabel="15.3% from last month"
          icon={<DollarSign className="h-4 w-4 text-primary" />}
          trend="up"
          isLoading={isLoading}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>
                View your content performance over time
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={chartType === 'area' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setChartType('area')}
                className="h-8 w-8 p-0"
              >
                <LineChart className="h-4 w-4" />
              </Button>
              <Button 
                variant={chartType === 'bar' ? 'default' : 'outline'} 
                size="sm" 
                onClick={() => setChartType('bar')}
                className="h-8 w-8 p-0"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="views">
              <div className="px-6">
                <TabsList className="grid grid-cols-4">
                  <TabsTrigger value="views">Views</TabsTrigger>
                  <TabsTrigger value="downloads">Downloads</TabsTrigger>
                  <TabsTrigger value="sales">Sales</TabsTrigger>
                  <TabsTrigger value="revenue">Revenue</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="views" className="mt-2">
                <div className="h-[300px] w-full px-4">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'area' ? (
                      <AreaChart data={sampleLineData}>
                        <defs>
                          <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#0088FE" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="views" stroke="#0088FE" fillOpacity={1} fill="url(#colorViews)" />
                      </AreaChart>
                    ) : (
                      <BarChart data={sampleLineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="views" fill="#0088FE" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="downloads" className="mt-2">
                <div className="h-[300px] w-full px-4">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'area' ? (
                      <AreaChart data={sampleLineData}>
                        <defs>
                          <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00C49F" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#00C49F" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="downloads" stroke="#00C49F" fillOpacity={1} fill="url(#colorDownloads)" />
                      </AreaChart>
                    ) : (
                      <BarChart data={sampleLineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="downloads" fill="#00C49F" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="sales" className="mt-2">
                <div className="h-[300px] w-full px-4">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'area' ? (
                      <AreaChart data={sampleLineData}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FFBB28" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#FFBB28" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="sales" stroke="#FFBB28" fillOpacity={1} fill="url(#colorSales)" />
                      </AreaChart>
                    ) : (
                      <BarChart data={sampleLineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="sales" fill="#FFBB28" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </TabsContent>

              <TabsContent value="revenue" className="mt-2">
                <div className="h-[300px] w-full px-4">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'area' ? (
                      <AreaChart data={sampleLineData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF8042" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#FF8042" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#FF8042" fillOpacity={1} fill="url(#colorRevenue)" />
                      </AreaChart>
                    ) : (
                      <BarChart data={sampleLineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="revenue" fill="#FF8042" />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="px-6 pt-0">
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </p>
          </CardFooter>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Content Breakdown</CardTitle>
            <CardDescription>
              Distribution of your content by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sampleCategoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sampleCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Assets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top Performing Assets</CardTitle>
              <CardDescription>
                Your best performing content based on sales and views
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Views
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Downloads
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sales
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conversion
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sampleAssetData.map((asset) => (
                    <tr key={asset.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100 flex items-center justify-center">
                            {asset.type === 'photo' && <Eye className="h-5 w-5 text-blue-500" />}
                            {asset.type === 'video' && <TrendingUp className="h-5 w-5 text-green-500" />}
                            {asset.type === 'template' && <Download className="h-5 w-5 text-amber-500" />}
                            {asset.type === 'illustration' && <PieChartIcon className="h-5 w-5 text-violet-500" />}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{asset.title}</div>
                            <div className="text-sm text-gray-500">{asset.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{asset.views.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{asset.downloads.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{asset.sales.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">${asset.revenue.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={asset.conversionRate > 10 ? 'default' : 'outline'}>
                          {asset.conversionRate.toFixed(1)}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {sampleAssetData.length} of {sampleAssetData.length} assets
          </p>
          <Button variant="outline" size="sm">
            View All Assets
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}