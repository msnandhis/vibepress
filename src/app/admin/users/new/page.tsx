"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, UserPlus, Mail } from 'lucide-react';
import Link from 'next/link';
import { usersService } from '@/lib/users-service';
import { UserRole, InviteCreate } from '@/types/users';

export default function NewUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    roleId: '',
    bio: '',
    sendInvitation: true
  });
  const [loading, setLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<UserRole[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const response = await usersService.getRoles({}, 1, 100);
      setAvailableRoles(response.roles);
      // Set default role to subscriber/lowest level
      const defaultRole = response.roles.find(r => r.isDefault) || response.roles[response.roles.length - 1];
      if (defaultRole) {
        setFormData(prev => ({ ...prev, roleId: defaultRole.id }));
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      toast.error('Failed to load roles');
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.roleId) {
      newErrors.roleId = 'Role is required';
    }
    if (formData.username && formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (formData.sendInvitation) {
        // Send invitation
        const inviteData: InviteCreate = {
          email: formData.email.trim().toLowerCase(),
          roleId: formData.roleId
        };

        await usersService.createInvite(inviteData);
        toast.success('User invitation sent successfully!');
      } else {
        // Create user directly
        const userData = {
          email: formData.email.trim().toLowerCase(),
          username: formData.username.trim() || undefined,
          firstName: formData.firstName.trim() || undefined,
          lastName: formData.lastName.trim() || undefined,
          role: formData.roleId,
          bio: formData.bio.trim() || undefined,
          sendWelcomeEmail: true
        };

        await usersService.createUser(userData);
        toast.success('User created successfully!');
      }

      router.push('/admin/users');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create user');
      setErrors({ submit: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: UserRole) => {
    if (role.level >= 90) return '👑';
    if (role.level >= 70) return '✏️';
    if (role.level >= 50) return '📝';
    if (role.level >= 30) return '📋';
    return '👁️';
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invite User</h1>
          <p className="text-muted-foreground">Add a new user to your team</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              User Details
            </CardTitle>
            <CardDescription>
              {formData.sendInvitation
                ? 'Send an invitation email to the user. They will receive a link to set up their account.'
                : 'Create a user account directly. The user will need to be given login credentials separately.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {errors.submit && (
                <div className="p-4 border rounded-md border-destructive bg-destructive/5">
                  <p className="text-sm text-destructive">{errors.submit}</p>
                </div>
              )}

              {/* Invitation Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <Label htmlFor="sendInvitation" className="font-medium">
                      Send Invitation Email
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    User will receive an email to set up their account
                  </p>
                </div>
                <Switch
                  id="sendInvitation"
                  checked={formData.sendInvitation}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, sendInvitation: checked })
                  }
                />
              </div>

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

              {/* Name Fields */}
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

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="johndoe (optional)"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className={errors.username ? 'border-destructive' : ''}
                />
                {errors.username && <p className="text-sm text-destructive">{errors.username}</p>}
                <p className="text-sm text-muted-foreground">
                  Optional. Must be at least 3 characters if provided.
                </p>
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

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Optional bio or description..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                />
                <p className="text-sm text-muted-foreground">
                  Optional brief description about the user
                </p>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.push('/admin/users')}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading
                    ? formData.sendInvitation
                      ? 'Sending Invitation...'
                      : 'Creating User...'
                    : formData.sendInvitation
                    ? 'Send Invitation'
                    : 'Create User'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}