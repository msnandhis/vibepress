"use client";

import { Editor } from '@/components/ui/editor'; // Rich text editor
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function NewPostPage() {
  const router = useRouter();
  const [isSessionPending, setIsSessionPending] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    slug: '',
    status: 'draft',
    publishedAt: '',
    authorId: '',
    categories: [] as number[],
    tags: [] as string[],
    featuredMediaId: null as number | null,
    seoTitle: '',
    seoDescription: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);

  useEffect(() => {
    setIsSessionPending(false);
  }, []);

  const fetchOptions = async () => {
    try {
      const [catRes, tagRes, userRes, mediaRes] = await Promise.all([
        fetch('/api/categories', { headers: { Authorization: `Bearer ${localStorage.getItem('bearer_token')}` } }),
        fetch('/api/tags', { headers: { Authorization: `Bearer ${localStorage.getItem('bearer_token')}` } }),
        fetch('/api/users', { headers: { Authorization: `Bearer ${localStorage.getItem('bearer_token')}` } }),
        fetch('/api/media', { headers: { Authorization: `Bearer ${localStorage.getItem('bearer_token')}` } })
      ]);
      setCategories(await catRes.json());
      setTags(await tagRes.json());
      setUsers(await userRes.json());
      setMedia(await mediaRes.json());
    } catch (err) {
      toast.error('Error loading options');
    }
  };

  const handleSlugChange = (title: string) => {
    const slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    setFormData(prev => ({ ...prev, slug }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content) newErrors.content = 'Content is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    if (formData.status === 'published' && !formData.publishedAt) newErrors.publishedAt = 'Published date required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const body = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        content: formData.content,
        excerpt: formData.excerpt.trim(),
        status: formData.status,
        publishedAt: formData.publishedAt || (formData.status === 'published' ? new Date().toISOString() : null),
        authorId: formData.authorId,
        categories: formData.categories,
        tags: formData.tags,
        featuredMediaId: formData.featuredMediaId,
        seo: {
          title: formData.seoTitle.trim(),
          description: formData.seoDescription.trim()
        },
        metadata: { viewCount: 0 }
      };
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('bearer_token')}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create post');
      toast.success('Post created successfully!');
      router.push('/admin/posts');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  if (isSessionPending) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Create New Post</h1>
      </div>
      
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Create Post</CardTitle>
          <CardDescription>Fill in the details to create a new blog post with rich content.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {Object.entries(errors).map(([key, msg]) => (
              <div key={key} className="p-3 border rounded bg-destructive/10 text-destructive">{msg}</div>
            ))}

            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter post title"
                className={errors.title ? 'border-destructive' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="Auto-generated slug"
                className={errors.slug ? 'border-destructive' : ''}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSlugChange(formData.title)}
                disabled={!formData.title.trim()}
              >
                Generate Slug
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Content (Rich Editor)</Label>
              <Editor
                content={formData.content}
                onUpdate={(value) => setFormData(prev => ({ ...prev, content: value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Excerpt</Label>
              <Input
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                placeholder="Enter post excerpt"
                className={errors.excerpt ? 'border-destructive' : ''}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categories</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, categories: [parseInt(value)] }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat: any) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <Input
                  placeholder="Enter tags (comma-separated)"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Featured Media</Label>
              <Select value={formData.featuredMediaId?.toString() || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, featuredMediaId: value ? parseInt(value) : null }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select featured media" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No media</SelectItem>
                  {media.map((m: any) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.filename}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
              {formData.status === 'published' && (
                <Input
                  type="datetime-local"
                  value={formData.publishedAt ? new Date(formData.publishedAt).toISOString().slice(0,16) : ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, publishedAt: e.target.value }))}
                  className={errors.publishedAt ? 'border-destructive' : ''}
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Author</Label>
              <Select value={formData.authorId} onValueChange={(value) => setFormData(prev => ({ ...prev, authorId: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select author" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No author</SelectItem>
                  {users.map((user: any) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>SEO Title</Label>
              <Input
                value={formData.seoTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                placeholder="Enter SEO title"
              />
            </div>

            <div className="space-y-2">
              <Label>SEO Description</Label>
              <Input
                value={formData.seoDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                placeholder="Enter SEO description"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {loading ? 'Creating...' : 'Create Post'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}