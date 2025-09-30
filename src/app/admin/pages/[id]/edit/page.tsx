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
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

type Page = {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  status: 'draft' | 'published' | 'scheduled';
  publishedAt: string | null;
  parentId: number | null;
  template: string;
  order: number;
  seoTitle: string;
  seoDescription: string;
};

type PageParent = { id: number; title: string };

export default function EditPagePage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const router = useRouter();
  const params = useParams();
  const pageId = parseInt(params.id as string);
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'draft' as 'draft' | 'published' | 'scheduled',
    publishedAt: '',
    parentId: null as number | null,
    template: 'default',
    order: 0,
    seoTitle: '',
    seoDescription: ''
  });
  const [pages, setPages] = useState<PageParent[]>([]);
  const [templates] = useState(['default', 'about', 'contact', 'landing']);

  useEffect(() => {
    if (!isSessionPending && (!session?.user || session.user.role !== 'admin')) {
      router.push('/sign-in');
      return;
    }
    if (session?.user && pageId) {
      fetchPages();
      fetchPage();
    }
  }, [session, isSessionPending, router, pageId]);

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/pages?limit=100&status=published', {
        headers: { Authorization: `Bearer ${localStorage.getItem('bearer_token')}` }
      });
      const data = await res.json();
      setPages(data.filter((p: PageParent) => p.id !== pageId)); // Exclude self
    } catch (err) {
      toast.error('Error loading pages');
    }
  };

  const fetchPage = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/pages?id=${pageId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('bearer_token')}`,
          'Content-Type': 'application/json'
        }
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch page');
      }
      const data = await res.json();
      setPage(data);
      setFormData({
        title: data.title,
        slug: data.slug,
        content: data.content || '',
        excerpt: data.excerpt || '',
        status: data.status,
        publishedAt: data.publishedAt || '',
        parentId: data.parentId,
        template: data.template || 'default',
        order: data.order || 0,
        seoTitle: data.seoTitle || '',
        seoDescription: data.seoDescription || ''
      });
    } catch (err) {
      toast.error('Error loading page');
      router.push('/admin/pages');
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
    if (!formData.content) newErrors.content = 'Content is required';
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
        publishedAt: formData.publishedAt || (formData.status === 'published' ? new Date().toISOString() : null),
        parentId: formData.parentId,
        template: formData.template,
        order: formData.order,
        seoTitle: formData.seoTitle.trim(),
        seoDescription: formData.seoDescription.trim()
      };
      const res = await fetch(`/api/pages?id=${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('bearer_token')}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update page');
      toast.success('Page updated successfully!');
      router.push('/admin/pages');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update page');
    } finally {
      setSubmitting(false);
    }
  };

  if (isSessionPending || loading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin mr-2" />Loading...</div>;
  }

  if (!session?.user || session.user.role !== 'admin' || !page) return null;

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" asChild>
          <Link href="/admin/pages">
            <span className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Pages
            </span>
          </Link>
        </Button>
        <CardTitle className="text-2xl font-display">Edit Page</CardTitle>
      </div>
      <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle>Update Page</CardTitle>
          <CardDescription>Modify the details of your static page.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {Object.entries(errors).map(([key, msg]) => (
              <div key={key} className="p-3 border rounded bg-destructive/10 text-destructive">{msg}</div>
            ))}

            {/* TODO: reuse same form fields as new page, prefilled with formData */}

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {submitting ? 'Updating...' : 'Update Page'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}