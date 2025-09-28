"use client";

import { useState, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Trash2, Check, X } from 'lucide-react';

interface Comment {
  id: number;
  content: string;
  status: 'pending' | 'approved' | 'spam';
  author: { name: string; email: string };
  post: { title: string; slug: string };
  createdAt: string;
}

export default function CommentsAdmin() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!session?.user) {
      router.push('/sign-in');
      return;
    }
    fetchComments();
  }, [session, router]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/comments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('bearer_token')}` },
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setComments(data);
    } catch (error) {
      toast.error('Error fetching comments');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: 'approved' | 'spam') => {
    try {
      const res = await fetch(`/api/comments/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('bearer_token')}`,
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update');
      setComments(prev => prev.map(c => c.id === id ? { ...c, status } : c));
      toast.success('Status updated');
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  const deleteComment = async (id: number) => {
    try {
      const res = await fetch(`/api/comments/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('bearer_token')}` } });
      if (!res.ok) throw new Error('Failed to delete');
      setComments(prev => prev.filter(c => c.id !== id));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Error deleting comment');
    }
  };

  const filteredComments = comments.filter(c =>
    c.content.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter === 'all' || c.status === statusFilter)
  );

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">Comment Moderation</h1>
        <Button onClick={() => router.push('/admin')}>Back to Dashboard</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Input placeholder="Search comments..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="spam">Spam</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Author</TableHead>
            <TableHead>Post</TableHead>
            <TableHead>Content Preview</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredComments.map((comment) => (
            <TableRow key={comment.id}>
              <TableCell>{comment.author.name} ({comment.author.email})</TableCell>
              <TableCell>
                <a href={`/blog/${comment.post.slug}`} className="text-primary hover:underline">
                  {comment.post.title}
                </a>
              </TableCell>
              <TableCell className="max-w-xs truncate">{comment.content.substring(0, 50)}...</TableCell>
              <TableCell>
                <Badge variant={comment.status === 'approved' ? 'default' : comment.status === 'spam' ? 'destructive' : 'secondary'}>
                  {comment.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(comment.createdAt).toLocaleDateString()}</TableCell>
              <TableCell className="space-x-2">
                {comment.status === 'pending' && (
                  <>
                    <Button variant="outline" size="sm" onClick={() => updateStatus(comment.id, 'approved')}>
                      <Check className="h-4 w-4 mr-1" /> Approve
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => updateStatus(comment.id, 'spam')} className="bg-destructive text-destructive-foreground">
                      <X className="h-4 w-4 mr-1" /> Spam
                    </Button>
                  </>
                )}
                <Button variant="ghost" size="sm" onClick={() => deleteComment(comment.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {filteredComments.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No comments match the filter.</div>
      )}
    </div>
  );
}