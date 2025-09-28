"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { Editor } from "@/components/ui/editor";

export default function EditPost() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const id = params.id as string;

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    content: {
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Loading..." }] }],
    },
    excerpt: "",
    status: "draft" as "draft" | "published" | "scheduled",
    publishedAt: "" as string | null,
    categories: [] as number[],
    tags: [] as number[],
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: "",
    },
  });

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    fetch("/api/categories").then(res => res.json()).then(setCategories);
    fetch("/api/tags").then(res => res.json()).then(setTags);
  }, []);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/posts?id=${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
      },
    }).then(res => {
      if (res.ok) {
        res.json().then(data => {
          setFormData({
            title: data.title,
            slug: data.slug,
            content: data.content,
            excerpt: data.excerpt || "",
            status: data.status,
            publishedAt: data.publishedAt ? data.publishedAt : null,
            categories: data.metadata?.categories || [],
            tags: data.metadata?.tags || [],
            seo: data.seo || { metaTitle: "", metaDescription: "", keywords: "" },
          });
          setLoading(false);
        });
      } else {
        toast.error("Post not found");
        router.push("/admin/posts");
      }
    });
  }, [id, router]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/posts?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          excerpt: formData.excerpt,
          status: formData.status,
          publishedAt: formData.status === "published" ? new Date().toISOString() : (formData.publishedAt ? formData.publishedAt : null),
          seo: formData.seo,
          metadata: {
            categories: formData.categories,
            tags: formData.tags,
          },
        }),
      });

      if (res.ok) {
        toast.success("Post updated successfully");
        router.push("/admin/posts");
      } else {
        toast.error("Failed to update post");
      }
    } catch (error) {
      toast.error("Error updating post");
    }
    setSaving(false);
  };

  const generateSlug = () => {
    if (formData.title) {
      const slug = formData.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!session?.user) return null;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Edit Post</h1>
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
        </TabsList>
        <TabsContent value="content">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                onBlur={generateSlug}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="excerpt">Excerpt</Label>
              <textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                className="w-full h-24 p-2 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Editor
                content={formData.content}
                onUpdate={(content) => setFormData(prev => ({ ...prev, content }))}
                editable={true}
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="seo">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaTitle">Meta Title</Label>
              <Input
                id="metaTitle"
                value={formData.seo.metaTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, metaTitle: e.target.value } }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <textarea
                id="metaDescription"
                value={formData.seo.metaDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, metaDescription: e.target.value } }))}
                className="w-full h-24 p-2 border rounded-md"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                value={formData.seo.keywords}
                onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, keywords: e.target.value } }))}
              />
            </div>
          </div>
        </TabsContent>
        <TabsContent value="organization">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as "draft" | "published" | "scheduled" }))}>
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
            {formData.status === "scheduled" && (
              <div className="space-y-2">
                <Label>Publish Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !formData.publishedAt && "text-muted-foreground")}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.publishedAt ? format(new Date(formData.publishedAt), "PPP") : <span>Pick a date</span>}
                      <ChevronDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    {/* Calendar component would go here */}
                  </PopoverContent>
                </Popover>
              </div>
            )}
            <div className="space-y-2">
              <Label>Categories</Label>
              <Select value={formData.categories[0]?.toString() || ""} onValueChange={(value) => setFormData(prev => ({ ...prev, categories: value ? [Number(value)] : [] }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat: any) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <Select value={formData.tags[0]?.toString() || ""} onValueChange={(value) => setFormData(prev => ({ ...prev, tags: value ? [Number(value)] : [] }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tag" />
                </SelectTrigger>
                <SelectContent>
                  {tags.map((tag: any) => (
                    <SelectItem key={tag.id} value={tag.id.toString()}>
                      {tag.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => router.push("/admin/posts")}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : "Update Post"}
        </Button>
      </div>
    </div>
  );
}