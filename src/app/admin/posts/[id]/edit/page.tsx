'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlock from '@tiptap/extension-code-block';
import { Blockquote } from '@tiptap/extension-blockquote';
import { HorizontalRule } from '@tiptap/extension-horizontal-rule';
import { Dropcursor } from '@tiptap/extension-dropcursor';
import { Gapcursor } from '@tiptap/extension-gapcursor';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TextAlign } from '@tiptap/extension-text-align';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { StatusBadge } from '@/components/ui/status-badge';
import { LoadingSkeleton } from '@/components/ui/loading-skeleton';
import { postsService } from '@/lib/posts-service';
import { generateSlug, generateExcerpt, validateSlug } from '@/lib/slug-utils';
import { Post, PostStatus, PostTag, PostCategory } from '@/types/posts';
import {
  Save,
  Eye,
  Trash2,
  Plus,
  X,
  Image as ImageIcon,
  Link as LinkIcon,
  Type,
  List,
  Quote,
  Code,
  Undo,
  Redo,
  Calendar,
  Clock,
  Settings,
  Tag,
  Folder,
  Search,
  FileText,
  ChevronRight
} from 'lucide-react';
import { format, addMinutes, parseISO } from 'date-fns';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [post, setPost] = useState<Post | null>(null);
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [availableTags, setAvailableTags] = useState<PostTag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags, setSelectedTags] = useState<PostTag[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState<any>({
    type: 'doc',
    content: [{ type: 'paragraph' }]
  });
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState<PostStatus>('draft');
  const [featuredImage, setFeaturedImage] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [seoKeywords, setSeoKeywords] = useState('');
  const [canonicalUrl, setCanonicalUrl] = useState('');
  const [isSticky, setIsSticky] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);

  // Auto-save functionality
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    setAutoSaveStatus('saving');
    autoSaveTimeoutRef.current = setTimeout(async () => {
      await performAutoSave();
    }, 2000); // Auto-save after 2 seconds of inactivity
  }, []);

  const performAutoSave = useCallback(async () => {
    if (!title.trim()) return;

    try {
      const postData = {
        title: title.trim(),
        slug: slug.trim(),
        content,
        excerpt: excerpt.trim() || generateExcerpt(content),
        status: 'draft',
        categoryId: selectedCategory || undefined,
        tags: selectedTags,
        featuredMediaId: featuredImage ? 'featured_media_id' : undefined,
        seo: {
          metaTitle: seoTitle.trim() || title,
          metaDescription: seoDescription.trim() || excerpt,
          focusKeyword: seoKeywords.trim(),
          canonicalUrl: canonicalUrl.trim() || undefined,
        },
        isSticky,
        isFeatured,
      };

      if (post) {
        await postsService.updatePost(post.id, postData);
      } else {
        // Create draft post if it doesn't exist
        const newPost = await postsService.createPost(postData);
        setPost(newPost);
        // Update URL to reflect the new post ID
        window.history.replaceState({}, '', `/admin/posts/${newPost.id}/edit`);
      }

      // Save to localStorage for backup
      localStorage.setItem(`post_draft_${postId || 'new'}`, JSON.stringify({
        title, slug, content, excerpt, selectedCategory, selectedTags,
        featuredImage, seoTitle, seoDescription, seoKeywords, canonicalUrl,
        isSticky, isFeatured, lastSaved: new Date().toISOString()
      }));

      setLastSaved(new Date());
      setAutoSaveStatus('saved');
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('error');
    }
  }, [title, slug, content, excerpt, selectedCategory, selectedTags, featuredImage,
      seoTitle, seoDescription, seoKeywords, canonicalUrl, isSticky, isFeatured, post, postId]);

  // Load draft from localStorage on component mount
  useEffect(() => {
    if (!postId) {
      const savedDraft = localStorage.getItem('post_draft_new');
      if (savedDraft) {
        try {
          const draft = JSON.parse(savedDraft);
          setTitle(draft.title || '');
          setSlug(draft.slug || '');
          setContent(draft.content || { type: 'doc', content: [{ type: 'paragraph' }] });
          setExcerpt(draft.excerpt || '');
          setSelectedCategory(draft.selectedCategory || '');
          setSelectedTags(draft.selectedTags || []);
          setFeaturedImage(draft.featuredImage || '');
          setSeoTitle(draft.seoTitle || '');
          setSeoDescription(draft.seoDescription || '');
          setSeoKeywords(draft.seoKeywords || '');
          setCanonicalUrl(draft.canonicalUrl || '');
          setIsSticky(draft.isSticky || false);
          setIsFeatured(draft.isFeatured || false);
          if (draft.lastSaved) {
            setLastSaved(new Date(draft.lastSaved));
          }
        } catch (error) {
          console.error('Failed to load draft:', error);
        }
      }
    }
  }, [postId]);

  // TipTap Editor
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Placeholder.configure({
        placeholder: 'Start writing your post...',
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: 'bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm',
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: 'border-l-4 border-gray-300 pl-4 italic',
        },
      }),
      HorizontalRule,
      Dropcursor,
      Gapcursor,
      TaskList.configure({
        HTMLAttributes: {
          class: 'not-prose pl-2',
        },
      }),
      TaskItem.configure({
        nested: true,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-gray-300 my-4',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'border',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border bg-gray-50 font-bold p-2',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'border p-2',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color.configure({
        types: ['textStyle'],
      }),
      TextStyle,
      Underline,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      setContent(json);

      // Auto-generate excerpt if empty
      if (!excerpt) {
        const generatedExcerpt = generateExcerpt(json);
        setExcerpt(generatedExcerpt);
      }

      // Trigger auto-save
      triggerAutoSave();
    },
  });

  useEffect(() => {
    loadData();
  }, [postId]);

  useEffect(() => {
    // Auto-generate slug from title
    if (title && !slug) {
      const generatedSlug = generateSlug(title);
      setSlug(generatedSlug);
    }
  }, [title]);

  const handleSlugChange = (newSlug: string) => {
    setSlug(newSlug);
  };

  const loadData = async () => {
    try {
      setLoading(true);

      // Load categories and tags
      const [categoriesData, tagsData] = await Promise.all([
        postsService.getCategories(),
        postsService.getTags()
      ]);
      setCategories(categoriesData);
      setAvailableTags(tagsData);

      if (postId) {
        // Load existing post
        const postData = await postsService.getPost(postId);
        if (postData) {
          setPost(postData);
          setTitle(postData.title);
          setSlug(postData.slug);
          setContent(postData.content);
          setExcerpt(postData.excerpt || '');
          setStatus(postData.status);
          setFeaturedImage(postData.featuredMedia?.url || '');
          setSeoTitle(postData.seo.metaTitle || '');
          setSeoDescription(postData.seo.metaDescription || '');
          setSeoKeywords(postData.seo.focusKeyword || '');
          setCanonicalUrl(postData.seo.canonicalUrl || '');
          setIsSticky(postData.isSticky);
          setIsFeatured(postData.isFeatured);
          setSelectedTags(postData.tags || []);

          if (postData.categoryId) {
            setSelectedCategory(postData.categoryId);
          }

          // Set scheduled date/time if scheduled
          if (postData.status === 'scheduled' && postData.scheduledAt) {
            const scheduledDate = new Date(postData.scheduledAt);
            setScheduledDate(scheduledDate.toISOString().split('T')[0]);
            setScheduledTime(scheduledDate.toTimeString().slice(0, 5));
          }
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load post data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (publish = false) => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!validateSlug(slug)) {
      setError('Invalid slug format');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const postData = {
        title: title.trim(),
        slug: slug.trim(),
        content,
        excerpt: excerpt.trim() || generateExcerpt(content),
        status: publish ? 'published' : status,
        authorId: 'current_user_id', // This should come from auth context
        categoryId: selectedCategory || undefined,
        tags: selectedTags,
        featuredMediaId: featuredImage ? 'featured_media_id' : undefined, // This should be handled by media service
        seo: {
          metaTitle: seoTitle.trim() || title,
          metaDescription: seoDescription.trim() || excerpt,
          focusKeyword: seoKeywords.trim(),
          canonicalUrl: canonicalUrl.trim() || undefined,
        },
        isSticky,
        isFeatured,
        publishedAt: publish && status !== 'published' ? new Date().toISOString() : post?.publishedAt,
        scheduledAt: status === 'scheduled' && scheduledDate && scheduledTime
          ? new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
          : undefined,
      };

      if (post) {
        // Update existing post
        await postsService.updatePost(post.id, postData);
        setSuccess('Post updated successfully');
      } else {
        // Create new post
        const newPost = await postsService.createPost(postData);
        setSuccess('Post created successfully');
        router.push(`/admin/posts/${newPost.id}/edit`);
        return;
      }

      // Update local post data
      setPost(prev => prev ? { ...prev, ...postData } : null);
    } catch (error) {
      console.error('Error saving post:', error);
      setError('Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = () => {
    setStatus('published');
    handleSave(true);
  };

  const handleSchedule = () => {
    if (!scheduledDate || !scheduledTime) {
      setError('Please select both date and time for scheduling');
      return;
    }

    setStatus('scheduled');
    handleSave(false);
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) return;

    const existingTag = availableTags.find(tag =>
      tag.name.toLowerCase() === newTagName.trim().toLowerCase()
    );

    if (existingTag) {
      if (!selectedTags.find(tag => tag.id === existingTag.id)) {
        setSelectedTags(prev => [...prev, existingTag]);
      }
    } else {
      const newTag: PostTag = {
        id: `tag_${Date.now()}`,
        name: newTagName.trim(),
        slug: newTagName.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
      };
      setSelectedTags(prev => [...prev, newTag]);
    }

    setNewTagName('');
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags(prev => prev.filter(tag => tag.id !== tagId));
  };

  const MenuBar = () => {
    if (!editor) return null;

    return (
      <div className="flex flex-wrap gap-1 p-2 border-b bg-card">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive('bold') ? 'bg-accent' : ''}
            title="Bold"
          >
            <Type className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive('italic') ? 'bg-accent' : ''}
            title="Italic"
          >
            <em className="h-4 w-4 italic">I</em>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive('underline') ? 'bg-accent' : ''}
            title="Underline"
          >
            <u className="h-4 w-4">U</u>
          </Button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive('heading', { level: 1 }) ? 'bg-accent' : ''}
            title="Heading 1"
          >
            H1
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive('heading', { level: 2 }) ? 'bg-accent' : ''}
            title="Heading 2"
          >
            H2
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive('heading', { level: 3 }) ? 'bg-accent' : ''}
            title="Heading 3"
          >
            H3
          </Button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={editor.isActive('bulletList') ? 'bg-accent' : ''}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive('orderedList') ? 'bg-accent' : ''}
            title="Numbered List"
          >
            <span className="h-4 w-4">1.</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={editor.isActive('taskList') ? 'bg-accent' : ''}
            title="Task List"
          >
            <span className="h-4 w-4">☐</span>
          </Button>
        </div>

        {/* Elements */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive('blockquote') ? 'bg-accent' : ''}
            title="Quote"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive('codeBlock') ? 'bg-accent' : ''}
            title="Code Block"
          >
            <Code className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal Rule"
          >
            <div className="h-4 w-4 border-t" />
          </Button>
        </div>

        {/* Table */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            title="Insert Table"
          >
            <div className="h-4 w-4 border">⊞</div>
          </Button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={editor.isActive({ textAlign: 'left' }) ? 'bg-accent' : ''}
            title="Align Left"
          >
            <span className="h-4 w-4">⌛</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={editor.isActive({ textAlign: 'center' }) ? 'bg-accent' : ''}
            title="Align Center"
          >
            <span className="h-4 w-4">⌛</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={editor.isActive({ textAlign: 'right' }) ? 'bg-accent' : ''}
            title="Align Right"
          >
            <span className="h-4 w-4">⌛</span>
          </Button>
        </div>

        {/* Insert */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMediaLibrary(true)}
            title="Insert Image"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const url = prompt('Enter link URL:');
              if (url) {
                editor.chain().focus().setLink({ href: url }).run();
              }
            }}
            title="Insert Link"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-1 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <LoadingSkeleton className="h-8 w-64" />
          <div className="flex gap-2">
            <LoadingSkeleton className="h-10 w-24" />
            <LoadingSkeleton className="h-10 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <LoadingSkeleton className="h-12 w-full" />
            <LoadingSkeleton className="h-96 w-full" />
          </div>
          <div className="space-y-4">
            <LoadingSkeleton className="h-64 w-full" />
            <LoadingSkeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/posts')}
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back to Posts
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {postId ? 'Edit Post' : 'Create New Post'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <StatusBadge status={status} />
              {post && (
                <span className="text-sm text-muted-foreground">
                  Last edited: {format(new Date(post.updatedAt), 'MMM d, yyyy HH:mm')}
                </span>
              )}
              {autoSaveStatus === 'saving' && (
                <span className="text-sm text-blue-600">Auto-saving...</span>
              )}
              {autoSaveStatus === 'saved' && lastSaved && (
                <span className="text-sm text-green-600">
                  Auto-saved: {format(lastSaved, 'HH:mm:ss')}
                </span>
              )}
              {autoSaveStatus === 'error' && (
                <span className="text-sm text-red-600">Auto-save failed</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {postId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`/posts/${post?.slug}`, '_blank')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          {status !== 'published' && (
            <Button
              size="sm"
              onClick={handlePublish}
              disabled={publishing || saving}
            >
              {publishing ? 'Publishing...' : 'Publish'}
            </Button>
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Title and Slug */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter post title..."
                  className="text-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="post-slug"
                    className={validateSlug(slug) ? '' : 'border-red-500'}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (title) {
                        setSlug(generateSlug(title));
                      }
                    }}
                    title="Generate slug from title"
                  >
                    Generate
                  </Button>
                </div>
                {!validateSlug(slug) && (
                  <p className="text-sm text-red-600">
                    Slug can only contain lowercase letters, numbers, and hyphens
                  </p>
                )}
                {validateSlug(slug) && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Preview: /posts/{slug}</span>
                    {postId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`/posts/${slug}`, '_blank')}
                        className="h-6 px-2 text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <MenuBar />
              <EditorContent
                editor={editor}
                className="prose prose-sm max-w-none p-4 min-h-[400px] focus:outline-none"
              />
            </CardContent>
          </Card>

          {/* Tabs for additional settings */}
          <Tabs defaultValue="seo" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="organization">Organization</TabsTrigger>
              <TabsTrigger value="publishing">Publishing</TabsTrigger>
            </TabsList>

            <TabsContent value="seo" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Search Engine Optimization</CardTitle>
                  <CardDescription>
                    Optimize your post for search engines
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="seo-title">SEO Title</Label>
                    <Input
                      id="seo-title"
                      value={seoTitle}
                      onChange={(e) => setSeoTitle(e.target.value)}
                      placeholder="Custom SEO title (optional)"
                    />
                    <p className="text-sm text-muted-foreground">
                      Leave empty to use the post title
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seo-description">Meta Description</Label>
                    <Textarea
                      id="seo-description"
                      value={seoDescription}
                      onChange={(e) => setSeoDescription(e.target.value)}
                      placeholder="Meta description for search engines"
                      rows={3}
                    />
                    <p className="text-sm text-muted-foreground">
                      {seoDescription.length}/160 characters recommended
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="seo-keywords">Focus Keyword</Label>
                    <Input
                      id="seo-keywords"
                      value={seoKeywords}
                      onChange={(e) => setSeoKeywords(e.target.value)}
                      placeholder="Primary keyword for this post"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="canonical-url">Canonical URL</Label>
                    <Input
                      id="canonical-url"
                      value={canonicalUrl}
                      onChange={(e) => setCanonicalUrl(e.target.value)}
                      placeholder="https://example.com/canonical-url"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="organization" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Organization</CardTitle>
                  <CardDescription>
                    Organize your post with categories and tags
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={selectedCategory || "none"} onValueChange={(value) => setSelectedCategory(value === "none" ? "" : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Category</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="Add a tag..."
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddTag}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedTags.map((tag) => (
                        <Badge key={tag.id} variant="secondary" className="gap-1">
                          {tag.name}
                          <X
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => handleRemoveTag(tag.id)}
                          />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {availableTags
                        .filter(tag => !selectedTags.find(t => t.id === tag.id))
                        .slice(0, 8)
                        .map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="outline"
                            className="cursor-pointer hover:bg-accent"
                            onClick={() => setSelectedTags(prev => [...prev, tag])}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="publishing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Publishing Options</CardTitle>
                  <CardDescription>
                    Control when and how your post is published
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={status} onValueChange={(value: PostStatus) => setStatus(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {status === 'scheduled' && (
                    <div className="space-y-4 border-t pt-4">
                      <div className="space-y-2">
                        <Label>Schedule Date</Label>
                        <Input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Schedule Time</Label>
                        <Input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Timezone</Label>
                        <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                          {timezone} ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                        </div>
                      </div>
                      {scheduledDate && scheduledTime && (
                        <div className="text-sm text-muted-foreground">
                          Will be published: {format(new Date(`${scheduledDate}T${scheduledTime}`), 'MMM d, yyyy HH:mm')} ({timezone})
                        </div>
                      )}
                      <Button
                        onClick={handleSchedule}
                        disabled={!scheduledDate || !scheduledTime}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Schedule Post
                      </Button>
                    </div>
                  )}

                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Sticky Post</Label>
                        <p className="text-sm text-muted-foreground">
                          Keep this post at the top of the blog
                        </p>
                      </div>
                      <Switch
                        checked={isSticky}
                        onCheckedChange={setIsSticky}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Featured Post</Label>
                        <p className="text-sm text-muted-foreground">
                          Show this post in featured sections
                        </p>
                      </div>
                      <Switch
                        checked={isFeatured}
                        onCheckedChange={setIsFeatured}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Featured Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {featuredImage ? (
                <div className="relative">
                  <img
                    src={featuredImage}
                    alt="Featured"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setFeaturedImage('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg h-32 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No featured image</p>
                  </div>
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  const url = prompt('Enter image URL:');
                  if (url) setFeaturedImage(url);
                }}
              >
                <ImageIcon className="h-4 w-4 mr-2" />
                Add Image
              </Button>
            </CardContent>
          </Card>

          {/* Excerpt */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Excerpt</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief summary of your post..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-2">
                {excerpt.length}/160 characters
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {postId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this post?')) {
                      postsService.deletePost(postId);
                      router.push('/admin/posts');
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Post
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => {
                  const slug = prompt('Enter slug to view:');
                  if (slug) window.open(`/posts/${slug}`, '_blank');
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Post
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}