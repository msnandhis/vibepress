"use client";

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Editor } from '@/components/ui/editor';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
// Placeholder components for missing UI components
const MultiSelect = ({ options, value, onChange }: any) => (
  <select multiple onChange={(e) => onChange(Array.from(e.target.selectedOptions, option => option.value))}>
    {options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
  </select>
);
const TagInput = ({ value, onChange, suggestions }: any) => (
  <input value={value.join(', ')} onChange={(e) => onChange(e.target.value.split(',').map((s: string) => s.trim()))} />
);
const MediaSelector = ({ media, selectedId, onSelect }: any) => (
  <select value={selectedId || ''} onChange={(e) => onSelect(e.target.value ? parseInt(e.target.value) : null)}>
    <option value="">No media</option>
    {media.map((m: any) => <option key={m.id} value={m.id}>{m.filename}</option>)}
  </select>
);

type Post = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'scheduled';
  publishedAt: string | null;
  authorId: string;
  categories: number[];
  tags: string[];
  featuredMediaId: number | null;
  seoTitle: string;
  seoDescription: string;
  metadata?: any;
};

export default function EditPostPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const router = useRouter();
  const params = useParams();
  const postId = parseInt(params.id as string);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'draft' as 'draft' | 'published' | 'scheduled',
    publishedAt: '' as string,
    authorId: session?.user.id || '',
    categories: [] as number[],
    tags: [] as string[],
    featuredMediaId: null as number | null,
    seoTitle: '',
    seoDescription: '',
    isPublished: false
  });
  const [categories, setCategories] = useState([
    { id: 1, name: 'Technology' },
    { id: 2, name: 'Design' },
    { id: 3, name: 'Business' }
  ]);
  const [tags, setTags] = useState([
    { id: 1, name: 'React' },
    { id: 2, name: 'NextJS' },
    { id: 3, name: 'TypeScript' }
  ]);
  const [users, setUsers] = useState([
    { id: '1', name: 'Admin User' },
    { id: '2', name: 'Editor User' }
  ]);
  const [media, setMedia] = useState([]);

  useEffect(() => {
    if (!isSessionPending && (!session?.user || session.user.role !== 'admin')) {
      router.push('/sign-in');
      return;
    }
    if (session?.user && postId) {
      fetchOptions();
      fetchPost();
    }
  }, [session, isSessionPending, router, postId]);

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

  const fetchPost = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?id=${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('bearer_token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch post');
      }
      const data = await res.json();
      setPost(data);
      setFormData({
        title: data.title,
        slug: data.slug,
        content: data.content || '',
        excerpt: data.excerpt || '',
        status: data.status,
        publishedAt: data.publishedAt || '',
        authorId: data.authorId,
        categories: data.categories || [],
        tags: data.tags || [],
        featuredMediaId: data.featuredMediaId || null,
        seoTitle: data.seo?.title || '',
        seoDescription: data.seo?.description || '',
        isPublished: data.status === 'published'
      });
    } catch (err) {
      toast.error('Error loading post');
      router.push('/admin/posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSlugChange = (title: string) => {
    const slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
    setFormData(prev => ({ ...prev, slug }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.content.trim()) newErrors.content = 'Content is required';
    if (!formData.slug.trim()) newErrors.slug = 'Slug is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const body = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        content: formData.content,
        excerpt: formData.excerpt.trim(),
        status: formData.status,
        publishedAt: formData.status === 'published' ? new Date().toISOString() : (formData.publishedAt || null),
        authorId: formData.authorId,
        categories: formData.categories,
        tags: formData.tags,
        featuredMediaId: formData.featuredMediaId,
        seo: {
          title: formData.seoTitle.trim(),
          description: formData.seoDescription.trim()
        },
        metadata: post?.metadata || { viewCount: 0 }
      };
      const res = await fetch(`/api/posts?id=${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('bearer_token')}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update post');
      toast.success('Post updated successfully!');
      router.push('/admin/posts');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update post');
    } finally {
      setSubmitting(false);
    }
  };

  if (isSessionPending || loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin mr-2" />Loading...</div>;
  }

  if (!session?.user || session.user.role !== 'admin' || !post) return null;

  const statusBadges: Record<string, string> = {
    draft: 'bg-muted',
    published: 'bg-success',
    scheduled: 'bg-secondary'
  };

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" asChild>
          <Link href="/admin/posts">
            <span className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Posts
            </span>
          </Link>
        </Button>
        <CardTitle className="text-2xl font-display">Edit Post</CardTitle>
      </div>

      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Update Post</CardTitle>
          <CardDescription>Modify the details of your blog post.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {Object.entries(errors).map(([key, msg]) => (
              <div key={key} className="p-3 border rounded bg-destructive/10 text-destructive">
                {msg}
              </div>
            ))}

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter post title"
                value={formData.title}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, title: e.target.value }));
                  handleSlugChange(e.target.value);
                }}
                className={errors.title ? 'border-destructive' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                placeholder="Slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className={errors.slug ? 'border-destructive' : ''}
              />
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <Editor content={formData.content} onUpdate={(value) => setFormData(prev => ({ ...prev, content: value }))} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                placeholder="Short summary for previews"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categories</Label>
                <MultiSelect
                  options={categories.map(c => ({ value: c.id.toString(), label: c.name }))}
                  value={formData.categories.map(id => id.toString())}
                  onChange={(vals: string[]) => setFormData(prev => ({ ...prev, categories: vals.map(v => parseInt(v)) }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Tags</Label>
                <TagInput
                  suggestions={tags.map(t => t.name)}
                  value={formData.tags}
                  onChange={(newTags: string[]) => setFormData(prev => ({ ...prev, tags: newTags }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Featured Media</Label>
              <MediaSelector
                media={media}
                selectedId={formData.featuredMediaId}
                onSelect={(id: number) => setFormData(prev => ({ ...prev, featuredMediaId: id }))}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                Status
                <Badge className={statusBadges[formData.status] || 'bg-muted'}>{formData.status}</Badge>
              </Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as typeof formData.status }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Author</Label>
              <Select value={formData.authorId} onValueChange={(value) => setFormData(prev => ({ ...prev, authorId: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>SEO</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="seoTitle">SEO Title</Label>
                  <Input id="seoTitle" value={formData.seoTitle} onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))} />
                </div>
                <div>
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea id="seoDescription" value={formData.seoDescription} onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))} rows={2} />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {submitting ? 'Updating...' : 'Update Post'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}