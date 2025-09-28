"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  TrendingUp,
  Users,
  FileText,
  Image as ImageIcon,
  Eye,
  Calendar,
  ArrowUpRight,
  ChevronRight,
  Activity,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type Stats = {
  posts: number;
  pages: number;
  media: number;
  users: number;
  views: number;
};

type ActivityItem = {
  id: number;
  action: string;
  type: string;
  title: string;
  user: string;
  time: string;
  avatar: string;
};

type RecentPost = {
  id: number;
  title: string;
  category: string;
  views: number;
  status: 'published' | 'draft';
  image: string;
  date: string;
};

export default function AdminDashboard() {
  const { data: session, isPending: isSessionPending } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    posts: 0,
    pages: 0,
    media: 0,
    users: 0,
    views: 0,
  });
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSessionPending && !session?.user) {
      router.push('/sign-in');
      return;
    }

    if (session?.user) {
      fetchDashboardData();
    }
  }, [session, isSessionPending, router]);

  const fetchDashboardData = async () => {
    setLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Set mock data with realistic numbers
    setStats({
      posts: 47,
      pages: 12,
      media: 238,
      users: 1247,
      views: 24680,
    });

    setActivity([
      {
        id: 1,
        action: "published",
        type: "post",
        title: "The Future of Digital Publishing",
        user: "Sarah Chen",
        time: "2 hours ago",
        avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/icons/profile_1-60x60-1.jpeg"
      },
      {
        id: 2,
        action: "updated",
        type: "page",
        title: "About Us",
        user: "Mike Johnson",
        time: "4 hours ago",
        avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/icons/profile_1-60x60-1.jpeg"
      },
      {
        id: 3,
        action: "uploaded",
        type: "media",
        title: "hero-banner-2024.jpg",
        user: "Emma Davis",
        time: "6 hours ago",
        avatar: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/icons/profile_1-60x60-1.jpeg"
      }
    ]);

    setRecentPosts([
      {
        id: 1,
        title: "Brain study identifies a cost of caregiving for new fathers",
        category: "Health",
        views: 2840,
        status: 'published',
        image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Modern-Computer-Mouse-on-Beige-Background-680x389-4.jpeg",
        date: "2 days ago"
      },
      {
        id: 2,
        title: "The Art of Mindfulness: Finding Peace in a Chaotic World",
        category: "Lifestyle",
        views: 1920,
        status: 'published',
        image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Software-Developer-at-Work-680x512-19.jpeg",
        date: "3 days ago"
      },
      {
        id: 3,
        title: "Sustainable Living: Small Changes, Big Impact",
        category: "Environment",
        views: 1650,
        status: 'draft',
        image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/Vintage-Rangefinder-Camera-with-Leatherette-Detail-680x512-20.jpeg",
        date: "5 days ago"
      }
    ]);

    setLoading(false);
  };

  if (isSessionPending || loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const handleNewPost = () => router.push('/admin/posts/new');
  const handleNewPage = () => router.push('/admin/pages/new');

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-2xl font-bold text-foreground">
          Welcome back, {session.user.name}
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your content today
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Posts</p>
                <p className="text-3xl font-bold text-foreground">{stats.posts}</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 dark:bg-blue-950/20 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+12%</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Page Views</p>
                <p className="text-3xl font-bold text-foreground">{stats.views.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-green-50 dark:bg-green-950/20 rounded-lg flex items-center justify-center">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+8.2%</span>
              <span className="text-muted-foreground ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Users</p>
                <p className="text-3xl font-bold text-foreground">{stats.users.toLocaleString()}</p>
              </div>
              <div className="h-12 w-12 bg-purple-50 dark:bg-purple-950/20 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600 font-medium">+24</span>
              <span className="text-muted-foreground ml-1">new this week</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Media Files</p>
                <p className="text-3xl font-bold text-foreground">{stats.media}</p>
              </div>
              <div className="h-12 w-12 bg-orange-50 dark:bg-orange-950/20 rounded-lg flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className="text-muted-foreground">2.4 GB storage used</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-semibold text-foreground">Quick Actions</h3>
            </div>
            <div className="space-y-4">
              <Button
                onClick={handleNewPost}
                className="w-full justify-start h-12 bg-primary hover:bg-primary/90"
              >
                <Plus className="h-4 w-4 mr-3" />
                Create New Post
              </Button>
              <Button
                onClick={handleNewPage}
                variant="outline"
                className="w-full justify-start h-12"
              >
                <FileText className="h-4 w-4 mr-3" />
                Create New Page
              </Button>
              <Link href="/admin/media">
                <Button
                  variant="outline"
                  className="w-full justify-start h-12"
                >
                  <ImageIcon className="h-4 w-4 mr-3" />
                  Upload Media
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-semibold text-foreground">Recent Activity</h3>
              <Link href="/admin/activity">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="space-y-4">
              {activity.map((item) => (
                <div key={item.id} className="flex items-start gap-4">
                  <Image
                    src={item.avatar}
                    alt={item.user}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{item.user}</span>
                      <span className="text-muted-foreground"> {item.action} {item.type} </span>
                      <span className="font-medium">"{item.title}"</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{item.time}</p>
                  </div>
                  <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Posts */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg font-semibold text-foreground">Recent Posts</h3>
            <Link href="/admin/posts">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                View All Posts
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentPosts.map((post) => (
              <div key={post.id} className="group">
                <div className="relative aspect-[16/10] mb-4 overflow-hidden rounded-lg">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={cn(
                      "px-2 py-1 text-xs font-medium rounded-md text-white",
                      post.status === 'published' ? 'bg-green-600' : 'bg-yellow-600'
                    )}>
                      {post.status}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.category}</span>
                    <span>{post.date}</span>
                  </div>
                  <h4 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4" />
                    <span>{post.views.toLocaleString()} views</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}