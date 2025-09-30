"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Edit,
  Mail,
  Calendar,
  Users,
  Shield,
  UserCheck,
  UserX,
  Clock,
  FileText,
  Image,
  MessageSquare,
  ExternalLink,
  MapPin,
  Globe,
  Phone
} from 'lucide-react';
import { usersService } from '@/lib/users-service';
import { User, UserStatistics } from '@/types/users';

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadUser();
    }
  }, [userId]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const userData = await usersService.getUser(userId);
      if (!userData) {
        setError('User not found');
        return;
      }
      setUser(userData);
    } catch (err) {
      console.error('Error loading user:', err);
      setError(err instanceof Error ? err.message : 'Failed to load user');
      toast.error('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'active' | 'inactive' | 'suspended') => {
    if (!user) return;

    try {
      await usersService.updateUser(user.id, { status: newStatus });
      setUser({ ...user, status: newStatus });
      toast.success(`User ${newStatus} successfully`);
    } catch (err) {
      console.error('Error updating user status:', err);
      toast.error('Failed to update user status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <UserCheck className="h-4 w-4 text-success" />;
      case 'inactive':
        return <UserX className="h-4 w-4 text-muted-foreground" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'suspended':
        return <Shield className="h-4 w-4 text-destructive" />;
      case 'banned':
        return <Shield className="h-4 w-4 text-destructive" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getUserDisplayName = (user: User) => {
    return user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || user.email;
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="skeleton h-8 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="skeleton h-96" />
          </div>
          <div className="lg:col-span-2">
            <div className="skeleton h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Link>
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">User Not Found</h3>
          <p className="text-muted-foreground mb-6">
            {error || 'The user you are looking for does not exist.'}
          </p>
          <Link href="/admin/users">
            <Button>Back to Users</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/admin/users">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Users
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Profile</h1>
            <p className="text-muted-foreground">View and manage user details</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/users/${user.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit User
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={getUserDisplayName(user)}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <Users className="h-12 w-12 text-primary" />
                )}
              </div>
              <CardTitle>{getUserDisplayName(user)}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge
                  variant="outline"
                  style={{ borderColor: user.role.color, color: user.role.color }}
                >
                  {user.role.name}
                </Badge>
                <div className="status-badge">
                  <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border">
                    {getStatusIcon(user.status)}
                    <span className="ml-1 capitalize">{user.status}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Contact Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                  {!user.emailVerified && (
                    <Badge variant="destructive" className="text-xs">
                      Unverified
                    </Badge>
                  )}
                </div>
                {user.username && (
                  <div className="flex items-center gap-3">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">@{user.username}</span>
                  </div>
                )}
                {user.metadata?.website && (
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={user.metadata.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      Website
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
                {user.metadata?.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.metadata.location}</span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Account Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Joined</span>
                  <span className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                {user.lastLoginAt && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Last Login</span>
                    <span className="text-sm">{new Date(user.lastLoginAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Status Actions */}
              {user.status !== 'active' && (
                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => handleStatusChange('active')}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  Activate User
                </Button>
              )}
              {user.status === 'active' && (
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange('inactive')}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Deactivate
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleStatusChange('suspended')}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Suspend
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Posts</p>
                        <p className="text-2xl font-bold">
                          {(user.statistics?.postsPublished || 0) + (user.statistics?.postsDraft || 0)}
                        </p>
                      </div>
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Pages</p>
                        <p className="text-2xl font-bold">{user.statistics?.pagesCreated || 0}</p>
                      </div>
                      <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Media</p>
                        <p className="text-2xl font-bold">{user.statistics?.mediaUploaded || 0}</p>
                      </div>
                      <Image className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Comments</p>
                        <p className="text-2xl font-bold">{user.statistics?.commentsMade || 0}</p>
                      </div>
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bio */}
              {user.bio && (
                <Card>
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{user.bio}</p>
                  </CardContent>
                </Card>
              )}

              {/* Role & Permissions */}
              <Card>
                <CardHeader>
                  <CardTitle>Role & Permissions</CardTitle>
                  <CardDescription>
                    Current role and associated permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{user.role.name}</h4>
                        {user.role.description && (
                          <p className="text-sm text-muted-foreground">{user.role.description}</p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        style={{ borderColor: user.role.color, color: user.role.color }}
                      >
                        Level {user.role.level}
                      </Badge>
                    </div>
                    {user.role.permissions.length > 0 && (
                      <div>
                        <h5 className="font-medium mb-2">Permissions:</h5>
                        <div className="flex flex-wrap gap-2">
                          {user.role.permissions.slice(0, 6).map((permission) => (
                            <Badge key={permission.id} variant="secondary" className="text-xs">
                              {permission.name}
                            </Badge>
                          ))}
                          {user.role.permissions.length > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.role.permissions.length - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    User activity and login history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Activity tracking coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="content">
              <Card>
                <CardHeader>
                  <CardTitle>Content Overview</CardTitle>
                  <CardDescription>
                    Posts, pages, and media created by this user
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Content overview coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}