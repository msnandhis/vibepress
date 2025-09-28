'use client';

import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  FileText,
  Image as ImageIcon,
  Folder,
  ListFilter,
  Hash,
  Users,
  Plus,
  MessageCircle,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useTheme } from "@/context/theme-provider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin/dashboard", color: "text-blue-600" },
  { icon: FileText, label: "Posts", href: "/admin/posts", color: "text-green-600" },
  { icon: FileText, label: "Pages", href: "/admin/pages", color: "text-purple-600" },
  { icon: ImageIcon, label: "Media", href: "/admin/media", color: "text-orange-600" },
  { icon: Hash, label: "Categories", href: "/admin/categories", color: "text-pink-600" },
  { icon: ListFilter, label: "Tags", href: "/admin/tags", color: "text-yellow-600" },
  { icon: Users, label: "Users", href: "/admin/users", color: "text-indigo-600" },
  { icon: Settings, label: "Themes", href: "/admin/themes", color: "text-cyan-600" },
  { icon: Settings, label: "Settings", href: "/admin/settings", color: "text-gray-600" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { mode, setMode } = useTheme();

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  const handleSignOut = async () => {
    const { error } = await authClient.signOut();
    if (error) {
      toast.error(error);
    } else {
      localStorage.removeItem("bearer_token");
      router.push("/");
    }
  };

  if (!session?.user) {
    if (isPending) {
      return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-50 w-full bg-card border-b border-border shadow-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-3">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/09933583-8014-4369-931a-d462f8acb42e-jellywp-com/assets/images/logo_n01-1.png"
                alt="VibePress Logo"
                width={85}
                height={21}
                priority
              />
              <div className="hidden md:block h-6 w-px bg-border" />
              <h1 className="hidden md:block font-display text-xl font-bold text-foreground">Admin Panel</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm w-48 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  {mode === "light" && <Sun className="h-5 w-5" />}
                  {mode === "dark" && <Moon className="h-5 w-5" />}
                  {mode === "system" && <Monitor className="h-5 w-5" />}
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setMode("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMode("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setMode("system")}>
                  <Monitor className="mr-2 h-4 w-4" />
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {session?.user?.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-foreground">{session?.user?.name || "Admin"}</p>
                <p className="text-xs text-muted-foreground">{session?.user?.email || "admin@vibepress.com"}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-card border-r border-border shadow-sm transition-transform lg:translate-x-0 z-40",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="p-4">
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-card-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className={cn(
                      "h-5 w-5 transition-colors",
                      isActive ? "text-primary-foreground" : item.color
                    )} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
              <h3 className="font-display text-sm font-semibold text-foreground mb-1">Need Help?</h3>
              <p className="text-xs text-muted-foreground mb-3">Check our documentation for guides and tutorials.</p>
              <Button size="sm" className="w-full text-xs h-8">
                View Docs
              </Button>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 min-h-[calc(100vh-4rem)] bg-background">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}