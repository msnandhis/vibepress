"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  TrendingUp,
  Users,
  FileText,
  Image as ImageIcon,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { useTheme } from "@/context/theme-provider";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type ActivityItem = {
  id: number;
  action: string;
  targetType: string;
  targetId: string;
  user: {
    name: string;
  };
  createdAt: string;
};

type Stats = {
  posts: number;
  pages: number;
  media: number;
  users: number;
  views: number;
};

export default function AdminDashboard() {
  const { data: session, isPending: isSessionPending } = useSession();
  const router = useRouter();
  const { activeTheme } = useTheme();
  const [stats, setStats] = useState<Stats>({
    posts: 0,
    pages: 0,
    media: 0,
    users: 0,
    views: 1.2e5,
  });
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataFetched, setDataFetched] = useState(false);

  useEffect(() => {
    if (!isSessionPending && !session?.user) {
      router.push('/sign-in');
      return;
    }

    if (session?.user && !dataFetched) {
      fetchDashboardData();
    }
  }, [session, isSessionPending, router, dataFetched]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    // Use mock data for now since APIs are not implemented
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Set mock data
      setStats({
        posts: 24,
        pages: 8,
        media: 156,
        users: 45,
        views: 125000,
      });

      // Set mock activity data
      setActivity([
        {
          id: 1,
          action: "Created",
          targetType: "post",
          targetId: "Getting Started with Next.js",
          user: { name: "Admin User" },
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        },
        {
          id: 2,
          action: "Updated",
          targetType: "page",
          targetId: "About Us",
          user: { name: "Content Editor" },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        },
        {
          id: 3,
          action: "Uploaded",
          targetType: "media",
          targetId: "hero-image.jpg",
          user: { name: "Admin User" },
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
        },
      ]);
    } catch (error) {
      console.error('Error setting dashboard data:', error);
      setError('Failed to load dashboard data. Using demo data.');

      // Fallback to basic stats
      setStats({
        posts: 0,
        pages: 0,
        media: 0,
        users: 1,
        views: 0,
      });
    } finally {
      setLoading(false);
      setDataFetched(true);
    }
  };

  if (isSessionPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const handleNewPost = () => router.push('/admin/posts/new');
  const handleNewPage = () => router.push('/admin/pages/new');
  const handleUploadMedia = () => router.push('/admin/media/upload');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, <span className="font-medium text-primary">{session.user.name}</span>! Here's what's happening with your site today.</p>
        </div>
        <div className="flex items-center gap-3">
          {error && <Badge variant="destructive">{error}</Badge>}
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            New Content
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 bg-muted animate-pulse rounded-lg"></div>
                  <div className="h-4 w-16 bg-muted animate-pulse rounded"></div>
                </div>
                <div className="h-8 w-20 bg-muted animate-pulse rounded mb-2"></div>
                <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  12%
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground mb-1">{stats.posts}</p>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-xs text-muted-foreground mt-2">+3 new this week</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-600 rounded-lg">
                  <Eye className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  8%
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground mb-1">{stats.views.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Page Views</p>
                <p className="text-xs text-muted-foreground mt-2">+5.2k this month</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-600 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center text-red-600 text-sm font-medium">
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                  2%
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground mb-1">{stats.users}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-xs text-muted-foreground mt-2">+12 new signups</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-600 rounded-lg">
                  <ImageIcon className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center text-green-600 text-sm font-medium">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  5%
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground mb-1">{stats.media}</p>
                <p className="text-sm text-muted-foreground">Media Files</p>
                <p className="text-xs text-muted-foreground mt-2">2.4 GB storage used</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-xl text-foreground">Quick Actions</CardTitle>
            <CardDescription className="text-muted-foreground">Start creating content with these shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={handleNewPost}
              className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
            >
              <div className="p-1.5 bg-white/20 rounded">
                <FileText className="h-4 w-4" />
              </div>
              <span className="font-medium">Create New Post</span>
            </Button>
            <Button
              onClick={handleNewPage}
              className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              <div className="p-1.5 bg-white/20 rounded">
                <Plus className="h-4 w-4" />
              </div>
              <span className="font-medium">Create New Page</span>
            </Button>
            <Button
              onClick={handleUploadMedia}
              className="w-full justify-start gap-3 h-12 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              <div className="p-1.5 bg-white/20 rounded">
                <ImageIcon className="h-4 w-4" />
              </div>
              <span className="font-medium">Upload Media</span>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-display text-xl text-foreground">Recent Activity</CardTitle>
                <CardDescription className="text-muted-foreground">Latest actions on your site</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activity.length > 0 ? (
                activity.map((item: ActivityItem) => (
                  <div key={item.id} className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {item.action} {item.targetType}: {item.targetId}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>by {item.user?.name || 'Unknown'}</span>
                        <span>•</span>
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground font-medium">No recent activity</p>
                  <p className="text-sm text-muted-foreground mt-1">Activity will appear here once you start creating content</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="font-display text-xl text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Content Performance
            </CardTitle>
            <CardDescription className="text-muted-foreground">Your most popular content this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "Getting Started with React", views: 2430, trend: "+12%" },
                { title: "Best Practices for Web Development", views: 1890, trend: "+8%" },
                { title: "Understanding TypeScript", views: 1650, trend: "+15%" },
              ].map((post, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{post.title}</p>
                    <p className="text-xs text-muted-foreground">{post.views.toLocaleString()} views</p>
                  </div>
                  <div className="text-xs font-medium text-green-600">{post.trend}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="font-display text-xl text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Upcoming Schedule
            </CardTitle>
            <CardDescription className="text-muted-foreground">Your content calendar for this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "Weekly Newsletter", date: "Tomorrow", time: "9:00 AM", type: "publish" },
                { title: "Product Review: MacBook Pro", date: "Friday", time: "2:00 PM", type: "draft" },
                { title: "Team Meeting Notes", date: "Monday", time: "10:00 AM", type: "review" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                  <div className={cn(
                    "p-2 rounded-lg",
                    item.type === "publish" && "bg-green-100 text-green-600",
                    item.type === "draft" && "bg-yellow-100 text-yellow-600",
                    item.type === "review" && "bg-blue-100 text-blue-600"
                  )}>
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.date} at {item.time}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}