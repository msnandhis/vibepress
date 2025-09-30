"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Save,
  Eye,
  Clock,
  Upload,
  Settings,
  FileText,
  Search
} from "lucide-react";
import { postsService } from "@/lib/posts-service";
import { useAutosave } from "@/lib/autosave";
import { Post, PostStatus } from "@/types/posts";

// Import tab components
import { ContentTab } from "./content-tab";
import { SEOTab } from "./seo-tab";
import { OrganizationTab } from "./organization-tab";

export default function NewPostPage() {
  const { data: session, isPending: isSessionPending } = useSession();
  const router = useRouter();

  const [post, setPost] = useState<Partial<Post>>({
    title: "",
    content: { type: "doc", content: [] },
    excerpt: "",
    status: "draft" as PostStatus,
    tags: [],
    seo: {},
    isSticky: false,
    isFeatured: false,
  });

  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [showAutosaveMessage, setShowAutosaveMessage] = useState(false);

  // Autosave functionality
  const autosaveKey = `new-post-${Date.now()}`;
  const { loadAutosave, clearAutosave, saveNow } = useAutosave(
    {
      title: post.title || "",
      content: post.content,
      excerpt: post.excerpt || "",
    },
    {
      key: autosaveKey,
      debounceMs: 2000,
    }
  );

  const updatePost = (updates: Partial<Post>) => {
    setPost(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  const handleSave = async (status: PostStatus = "draft", publish = false) => {
    if (!session?.user?.id) {
      toast.error("You must be logged in to save posts");
      return;
    }

    if (!post.title?.trim()) {
      toast.error("Post title is required");
      return;
    }

    setSaving(true);

    try {
      const postData = {
        ...post,
        status,
        authorId: session.user.id,
        publishedAt: publish ? new Date().toISOString() : undefined,
      };

      const savedPost = await postsService.createPost(postData as Omit<Post, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likeCount' | 'commentCount' | 'revisions'>);

      // Clear autosave after successful save
      await clearAutosave();

      toast.success(
        publish ? "Post published successfully!" : "Post saved as draft"
      );

      setIsDirty(false);

      // Redirect to edit page
      router.push(`/admin/posts/${savedPost.id}/edit`);

    } catch (error) {
      console.error("Error saving post:", error);
      toast.error("Failed to save post. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = () => handleSave("published", true);

  // Check for autosaved content on load
  useEffect(() => {
    const checkAutosave = async () => {
      const autosavedData = await loadAutosave();
      if (autosavedData && (autosavedData.title || autosavedData.content)) {
        setShowAutosaveMessage(true);
      }
    };

    checkAutosave();
  }, [loadAutosave]);

  const restoreAutosave = async () => {
    const autosavedData = await loadAutosave();
    if (autosavedData) {
      setPost(prev => ({
        ...prev,
        title: autosavedData.title,
        content: autosavedData.content,
        excerpt: autosavedData.excerpt || "",
      }));
      setShowAutosaveMessage(false);
      toast.success("Autosaved content restored");
    }
  };

  const discardAutosave = async () => {
    await clearAutosave();
    setShowAutosaveMessage(false);
  };

  // Handle browser navigation warnings
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  if (isSessionPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session?.user) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Create New Post</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Draft</span>
                  {isDirty && (
                    <>
                      <span>•</span>
                      <span className="text-warning">Unsaved changes</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSave("draft")}
                disabled={saving || !post.title?.trim()}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : "Save Draft"}
              </Button>

              <Button
                size="sm"
                onClick={handlePublish}
                disabled={saving || !post.title?.trim()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {saving ? "Publishing..." : "Publish"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Autosave notification */}
      {showAutosaveMessage && (
        <div className="bg-info/10 border-b border-info/20">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-info" />
                <span>We found an autosaved version of this post.</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={restoreAutosave}
                >
                  Restore
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={discardAutosave}
                >
                  Discard
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="content" className="gap-2">
                  <FileText className="h-4 w-4" />
                  Content
                </TabsTrigger>
                <TabsTrigger value="seo" className="gap-2">
                  <Search className="h-4 w-4" />
                  SEO
                </TabsTrigger>
                <TabsTrigger value="organization" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Organization
                </TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-6">
                <ContentTab
                  post={post}
                  onUpdate={updatePost}
                />
              </TabsContent>

              <TabsContent value="seo" className="space-y-6">
                <SEOTab
                  post={post}
                  onUpdate={updatePost}
                />
              </TabsContent>

              <TabsContent value="organization" className="space-y-6">
                <OrganizationTab
                  post={post}
                  onUpdate={updatePost}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Post Status */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Post Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant="secondary">
                    {post.status === "draft" ? "Draft" : "Published"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Visibility</span>
                  <span className="text-sm">Public</span>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sticky</span>
                    <input
                      type="checkbox"
                      checked={post.isSticky || false}
                      onChange={(e) => updatePost({ isSticky: e.target.checked })}
                      className="rounded border-border"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Featured</span>
                    <input
                      type="checkbox"
                      checked={post.isFeatured || false}
                      onChange={(e) => updatePost({ isFeatured: e.target.checked })}
                      className="rounded border-border"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={() => {/* Preview functionality */}}
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start gap-2"
                  onClick={saveNow}
                >
                  <Save className="h-4 w-4" />
                  Save Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}