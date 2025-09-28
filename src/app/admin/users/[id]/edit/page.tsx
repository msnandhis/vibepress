"use client";

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  bio?: string | null;
};

export default function EditUserPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '', // Optional for reset
    role: 'viewer' as 'admin' | 'editor' | 'author' | 'contributor' | 'viewer',
    avatar: '',
    bio: ''
  });

  useEffect(() => {
    if (!isSessionPending && (!session?.user || session.user.role !== 'admin')) {
      router.push('/sign-in');
      return;
    }
    if (session?.user && userId) {
      fetchUser();
    }
  }, [session, isSessionPending, router, userId]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('bearer_token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch user');
      }
      const data = await res.json();
      setUser(data);
      setFormData({
        name: data.name,
        email: data.email,
        password: '',
        role: data.role,
        avatar: data.avatar || '',
        bio: data.bio || ''
      });
    } catch (err) {
      toast.error('Error loading user data');
      router.push('/admin/users');
    } finally {
      setLoading(false);
    }
  };

  if (isSessionPending || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== 'admin' || !user) {
    router.push('/sign-in');
    return null;
  }

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    if (!['admin', 'editor', 'author', 'contributor', 'viewer'].includes(formData.role)) {
      newErrors.role = 'Invalid role selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const body: any = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        avatar: formData.avatar.trim() || null,
        bio: formData.bio.trim() || null
      };

      // Only include password if provided (for reset)
      if (formData.password) {
        body.password = formData.password;
      }

      const res = await fetch(`/api/users?id=${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('bearer_token')}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      toast.success('User updated successfully!');
      router.push('/admin/users');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update user');
      setErrors({ submit: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setSubmitting(false);
    }
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-primary text-primary-foreground',
    editor: 'bg-secondary',
    author: 'bg-accent',
    contributor: 'bg-muted',
    viewer: 'bg-destructive'
  };

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" asChild>
          <Link href="/admin/users">
            <span className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Users
            </span>
          </Link>
        </Button>
        <CardTitle className="text-2xl font-display">Edit User: {user.name}</CardTitle>
      </div>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Update User Account</CardTitle>
          <CardDescription>
            Modify user details. Password is optional (leave blank to keep current).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="p-4 border rounded-md border-destructive bg-destructive/5 text-destructive-foreground">
                {errors.submit}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password (optional)</Label>
              <Input
                id="password"
                type="password"
                placeholder="Leave blank to keep current password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={errors.password ? 'border-destructive' : ''}
              />
              {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
              <p className="text-sm text-muted-foreground">Enter a new password to reset it (min 8 chars).</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as typeof formData.role })}>
                <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      Admin (full access)
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-secondary/50"></span>
                      Editor (content management)
                    </div>
                  </SelectItem>
                  <SelectItem value="author">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-accent/50"></span>
                      Author (write/publish own content)
                    </div>
                  </SelectItem>
                  <SelectItem value="contributor">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-muted/50"></span>
                      Contributor (submit drafts)
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-destructive/50"></span>
                      Viewer (read only)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar">Avatar URL (optional)</Label>
              <Input
                id="avatar"
                placeholder="https://example.com/avatar.jpg"
                value={formData.avatar}
                onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              />
              <p className="text-sm text-muted-foreground">Optional image URL for user avatar</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (optional)</Label>
              <Textarea
                id="bio"
                placeholder="Enter a short bio..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
              />
              <p className="text-sm text-muted-foreground">Optional short description about the user</p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Updating...' : 'Update User'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}