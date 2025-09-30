"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Users, Shield, Mail, User } from 'lucide-react';
import { usersService } from '@/lib/users-service';
import { User as UserType, UserRole, UserUpdate } from '@/types/users';

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserType | null>(null);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    username: '',
    email: '',
    bio: '',
    roleId: '',
    status: 'active' as 'active' | 'inactive' | 'pending' | 'suspended' | 'banned',
    emailVerified: false,
    website: '',
    location: '',
    company: '',
    jobTitle: ''
  });

  useEffect(() => {
    if (userId) {
      loadData();
    }
  }, [userId]);

  const loadData = async () => {
    try {
      setLoading(true);

      const [userData, rolesResponse] = await Promise.all([
        usersService.getUser(userId),
        usersService.getRoles({}, 1, 100)
      ]);

      if (!userData) {
        toast.error('User not found');
        router.push('/admin/users');
        return;
      }

      setUser(userData);
      setAvailableRoles(rolesResponse.roles);

      // Populate form
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        displayName: userData.displayName || '',
        username: userData.username || '',
        email: userData.email,
        bio: userData.bio || '',
        roleId: userData.role.id,
        status: userData.status,
        emailVerified: userData.emailVerified,
        website: userData.metadata?.website || '',
        location: userData.metadata?.location || '',
        company: userData.metadata?.company || '',
        jobTitle: userData.metadata?.jobTitle || ''
      });
    } catch (error) {
      console.error('Error loading user:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.username && formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!formData.roleId) {
      newErrors.roleId = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    try {
      const updateData: UserUpdate = {
        firstName: formData.firstName.trim() || undefined,
        lastName: formData.lastName.trim() || undefined,
        displayName: formData.displayName.trim() || undefined,
        username: formData.username.trim() || undefined,
        email: formData.email.trim(),
        bio: formData.bio.trim() || undefined,
        role: formData.roleId,
        status: formData.status,
        emailVerified: formData.emailVerified,
        metadata: {
          website: formData.website.trim() || undefined,
          location: formData.location.trim() || undefined,
          company: formData.company.trim() || undefined,
          jobTitle: formData.jobTitle.trim() || undefined
        }
      };

      await usersService.updateUser(userId, updateData);
      toast.success('User updated successfully');
      router.push(`/admin/users/${userId}`);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update user');
      setErrors({ submit: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setSaving(false);
    }
  };

  const getUserDisplayName = (user: UserType) => {
    return user.displayName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || user.email;
  };

  const getRoleIcon = (role: UserRole) => {
    if (role.level >= 90) return '👑';
    if (role.level >= 70) return '✏️';
    if (role.level >= 50) return '📝';
    if (role.level >= 30) return '📋';
    return '👁️';
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="skeleton h-8 w-48" />
        <div className="skeleton h-96" />
      </div>
    );
  }

  if (!user) {
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
            The user you are trying to edit does not exist.
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
            <Link href={`/admin/users/${userId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Edit User</h1>
            <p className="text-muted-foreground">Update user information and settings</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="metadata">Additional Info</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Basic profile information displayed to other users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {errors.submit && (
                  <div className="p-4 border rounded-md border-destructive bg-destructive/5">
                    <p className="text-sm text-destructive">{errors.submit}</p>
                  </div>
                )}

                {/* Names */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                {/* Display Name */}
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    placeholder="How the name appears publicly"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Leave empty to use first and last name
                  </p>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className={errors.username ? 'border-destructive' : ''}
                  />
                  {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Brief description about the user..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Account Settings
                </CardTitle>
                <CardDescription>
                  Account access, role, and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="user@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={errors.email ? 'border-destructive' : ''}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                {/* Email Verified */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <Label htmlFor="emailVerified" className="font-medium">
                        Email Verified
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Mark email as verified if the user has confirmed their email
                    </p>
                  </div>
                  <Switch
                    id="emailVerified"
                    checked={formData.emailVerified}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, emailVerified: checked })
                    }
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.roleId}
                    onValueChange={(value) => setFormData({ ...formData, roleId: value })}
                  >
                    <SelectTrigger className={errors.roleId ? 'border-destructive' : ''}>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles
                        .sort((a, b) => b.level - a.level)
                        .map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            <div className="flex items-center space-x-3">
                              <span className="text-lg">{getRoleIcon(role)}</span>
                              <div>
                                <div className="font-medium">{role.name}</div>
                                {role.description && (
                                  <div className="text-xs text-muted-foreground">
                                    {role.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.roleId && <p className="text-sm text-destructive">{errors.roleId}</p>}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Account Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          <span>Active</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                          <span>Inactive</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="pending">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                          <span>Pending</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="suspended">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                          <span>Suspended</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="banned">
                        <div className="flex items-center space-x-2">
                          <span className="w-2 h-2 rounded-full bg-red-500"></span>
                          <span>Banned</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="metadata" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>
                  Optional metadata and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Website */}
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    placeholder="Company name"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>

                {/* Job Title */}
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    placeholder="Position or role"
                    value={formData.jobTitle}
                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/admin/users/${userId}`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </Tabs>
      </form>
    </div>
  );
}