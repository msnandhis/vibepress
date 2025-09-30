'use client';

import { useState, useRef } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Globe,
  Search,
  Users,
  FileText,
  Shield,
  TrendingUp,
  Palette,
  Download,
  Upload,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { SettingsProvider, useSettings } from '@/context/settings-provider';
import { toast } from 'sonner';

const settingsCategories = [
  {
    id: 'general',
    title: 'General',
    description: 'Basic site configuration and content settings',
    icon: Globe,
    href: '/admin/settings/general',
    color: 'text-blue-600',
  },
  {
    id: 'seo',
    title: 'SEO & Analytics',
    description: 'Search engine optimization and tracking',
    icon: Search,
    href: '/admin/settings/seo',
    color: 'text-green-600',
  },
  {
    id: 'users',
    title: 'User Management',
    description: 'User registration, profiles, and permissions',
    icon: Users,
    href: '/admin/settings/users',
    color: 'text-purple-600',
  },
  {
    id: 'content',
    title: 'Content & Publishing',
    description: 'Editor settings, media uploads, and organization',
    icon: FileText,
    href: '/admin/settings/content',
    color: 'text-orange-600',
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    description: 'Security hardening and privacy settings',
    icon: Shield,
    href: '/admin/settings/security',
    color: 'text-red-600',
  },
  {
    id: 'marketing',
    title: 'Marketing & SEO Tools',
    description: 'Redirects, 404 monitoring, and SEO tools',
    icon: TrendingUp,
    href: '/admin/settings/marketing',
    color: 'text-indigo-600',
  },
];

// Settings Actions Component
function SettingsActions() {
  const { exportSettings, importSettings, resetToDefaults } = useSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportSettings = async () => {
    try {
      await exportSettings();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const success = await importSettings(text);

      if (success) {
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      toast.error('Failed to read file');
    }
  };

  const handleResetToDefaults = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset all settings to defaults? This action cannot be undone.'
    );

    if (confirmed) {
      try {
        await resetToDefaults();
      } catch (error) {
        toast.error('Failed to reset settings');
      }
    }
  };

  return (
    <div className="p-2 space-y-1">
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground"
        onClick={handleExportSettings}
      >
        <Download className="h-4 w-4 mr-2" />
        Export Settings
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground"
        onClick={handleImportClick}
      >
        <Upload className="h-4 w-4 mr-2" />
        Import Settings
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground"
        onClick={handleResetToDefaults}
      >
        <RotateCcw className="h-4 w-4 mr-2" />
        Reset to Defaults
      </Button>
    </div>
  );
}

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (isPending) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!session?.user) {
    router.push('/sign-in');
    return null;
  }

  const isMainSettings = pathname === '/admin/settings';

  return (
    <SettingsProvider>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">
              Configure your VibePress installation
            </p>
          </div>

          {!isMainSettings && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.back()}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          )}
        </div>

        {isMainSettings ? (
          // Settings Overview Page
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settingsCategories.map((category) => (
              <Link key={category.id} href={category.href}>
                <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "p-3 rounded-lg bg-muted group-hover:bg-muted/80 transition-colors",
                      )}>
                        <category.icon className={cn("h-6 w-6", category.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                          {category.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {category.description}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          // Settings Category Page Layout
          <div className="flex gap-6">
            {/* Sidebar Navigation */}
            <div className={cn(
              "flex-shrink-0 transition-all duration-300",
              sidebarCollapsed ? "w-16" : "w-64"
            )}>
              <Card className="h-fit sticky top-6">
                <CardContent className="p-0">
                  <div className="p-4 border-b border-border">
                    <div className="flex items-center justify-between">
                      {!sidebarCollapsed && (
                        <h3 className="font-semibold text-foreground">Categories</h3>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                      >
                        {sidebarCollapsed ? (
                          <ChevronRight className="h-4 w-4" />
                        ) : (
                          <ChevronLeft className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <nav className="p-2">
                    {settingsCategories.map((category) => {
                      const isActive = pathname.startsWith(category.href);
                      return (
                        <Link
                          key={category.id}
                          href={category.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 mb-1",
                            isActive
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                          title={sidebarCollapsed ? category.title : undefined}
                        >
                          <category.icon className={cn(
                            "h-4 w-4 flex-shrink-0",
                            isActive ? "text-primary-foreground" : category.color
                          )} />
                          {!sidebarCollapsed && (
                            <span className="truncate">{category.title}</span>
                          )}
                        </Link>
                      );
                    })}
                  </nav>

                  {!sidebarCollapsed && (
                    <>
                      <Separator className="mx-2" />
                      <SettingsActions />
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {children}
            </div>
          </div>
        )}
      </div>
    </SettingsProvider>
  );
}