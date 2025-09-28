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

export default function EditPage() {
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
    parentId: "" as string | null,
    template: "" as string,
    order: 0,
    seo: {
      metaTitle: "",
      metaDescription: "",
      keywords: "",
    },
  });

  const [templates, setTemplates] = useState(["page", "landing", "blank", "contact"]);

  useEffect(() => {
    fetch("/api/templates") // Mock, would fetch from DB
      .then(res => res.json())
      .then(setTemplates);
  }, []);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/pages?id=${id}`, {
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
            parentId: data.parentId ? data.parentId.toString() : "",
            template: data.template || "",
            order: data.order || 0,
            seo: data.seo || { metaTitle: "", metaDescription: "", keywords: "" },
          });
          setLoading(false);
        });
      } else {
        toast.error("Page not found");
        router.push("/admin/pages");
      }
    });
  }, [id, router]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/pages?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          parentId: formData.parentId ? Number(formData.parentId) : null,
          template: formData.template,
          order: formData.order,
          seo: formData.seo,
        }),
      });

      if (res.ok) {
        toast.success("Page updated successfully");
        router.push("/admin/pages");
      } else {
        toast.error("Failed to update page");
      }
    } catch (error) {
      toast.error("Error updating page");
    }
    setSaving(false);
  };

  const generateSlug = () => {
    if (formData.title) {
      const slug = formData.title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!session?.user) return null;

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Edit Page</h1>
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
              <Label htmlFor="parentId">Parent Page</Label>
              <Select value={formData.parentId || ""} onValueChange={(value) => setFormData(prev => ({ ...prev, parentId: value || null }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select parent page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No parent</SelectItem>
                  {/* Dynamic parent pages would be fetched here */}
                  {[
                    { id: 1, title: "Home" },
                    { id: 2, title: "About Us" },
                  ].map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="template">Template</Label>
              <Select value={formData.template} onValueChange={(value) => setFormData(prev => ({ ...prev, template: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: Number(e.target.value) || 0 }))}
                placeholder="Menu order"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => router.push("/admin/pages")}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : "Update Page"}
        </Button>
      </div>
    </div>
  );
}