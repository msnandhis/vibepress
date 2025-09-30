"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Post } from "@/types/posts";
import { Search, Globe, Twitter, Share2 } from "lucide-react";

interface SEOTabProps {
  post: Partial<Post>;
  onUpdate: (updates: Partial<Post>) => void;
}

export function SEOTab({ post, onUpdate }: SEOTabProps) {
  const updateSEO = (seoUpdates: Partial<typeof post.seo>) => {
    onUpdate({
      seo: {
        ...post.seo,
        ...seoUpdates,
      },
    });
  };

  const getPreviewTitle = () => post.seo?.metaTitle || post.title || "Your Post Title";
  const getPreviewDescription = () => post.seo?.metaDescription || post.excerpt || "Your post description will appear here...";
  const getPreviewUrl = () => `${window.location.origin}/blog/${post.slug || "your-post-slug"}`;

  return (
    <div className="space-y-6">
      {/* SEO Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Engine Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-4 bg-muted/50">
            <div className="space-y-1">
              <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                {getPreviewTitle()}
              </div>
              <div className="text-green-700 text-sm">
                {getPreviewUrl()}
              </div>
              <div className="text-gray-600 text-sm leading-relaxed">
                {getPreviewDescription()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic SEO */}
      <Card>
        <CardHeader>
          <CardTitle>Basic SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="meta-title">Meta Title</Label>
            <Input
              id="meta-title"
              value={post.seo?.metaTitle || ""}
              onChange={(e) => updateSEO({ metaTitle: e.target.value })}
              placeholder="Custom SEO title (leave empty to use post title)"
              maxLength={60}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Recommended: 50-60 characters</span>
              <span>{(post.seo?.metaTitle || "").length}/60</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta-description">Meta Description</Label>
            <Textarea
              id="meta-description"
              value={post.seo?.metaDescription || ""}
              onChange={(e) => updateSEO({ metaDescription: e.target.value })}
              placeholder="Brief description for search engines and social media"
              rows={3}
              maxLength={160}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Recommended: 150-160 characters</span>
              <span>{(post.seo?.metaDescription || "").length}/160</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="focus-keyword">Focus Keyword</Label>
            <Input
              id="focus-keyword"
              value={post.seo?.focusKeyword || ""}
              onChange={(e) => updateSEO({ focusKeyword: e.target.value })}
              placeholder="Primary keyword for this post"
            />
            <p className="text-xs text-muted-foreground">
              The main keyword you want this post to rank for
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="canonical-url">Canonical URL</Label>
            <Input
              id="canonical-url"
              value={post.seo?.canonicalUrl || ""}
              onChange={(e) => updateSEO({ canonicalUrl: e.target.value })}
              placeholder="https://example.com/canonical-url (optional)"
            />
            <p className="text-xs text-muted-foreground">
              Use if this content appears elsewhere to avoid duplicate content issues
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Open Graph / Social Media */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Social Media (Open Graph)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="og-title">Social Media Title</Label>
            <Input
              id="og-title"
              value={post.seo?.ogTitle || ""}
              onChange={(e) => updateSEO({ ogTitle: e.target.value })}
              placeholder="Title for social media shares (leave empty to use meta title)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="og-description">Social Media Description</Label>
            <Textarea
              id="og-description"
              value={post.seo?.ogDescription || ""}
              onChange={(e) => updateSEO({ ogDescription: e.target.value })}
              placeholder="Description for social media shares (leave empty to use meta description)"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="og-image">Social Media Image</Label>
            <Input
              id="og-image"
              value={post.seo?.ogImage || ""}
              onChange={(e) => updateSEO({ ogImage: e.target.value })}
              placeholder="https://example.com/image.jpg (leave empty to use featured image)"
            />
            <p className="text-xs text-muted-foreground">
              Recommended size: 1200x630 pixels
            </p>
          </div>

          <Separator />

          {/* Twitter Cards */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Twitter className="h-4 w-4" />
              <Label className="text-sm font-medium">Twitter Card Settings</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter-title">Twitter Title</Label>
              <Input
                id="twitter-title"
                value={post.seo?.twitterTitle || ""}
                onChange={(e) => updateSEO({ twitterTitle: e.target.value })}
                placeholder="Title for Twitter (leave empty to use OG title)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter-description">Twitter Description</Label>
              <Textarea
                id="twitter-description"
                value={post.seo?.twitterDescription || ""}
                onChange={(e) => updateSEO({ twitterDescription: e.target.value })}
                placeholder="Description for Twitter (leave empty to use OG description)"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter-image">Twitter Image</Label>
              <Input
                id="twitter-image"
                value={post.seo?.twitterImage || ""}
                onChange={(e) => updateSEO({ twitterImage: e.target.value })}
                placeholder="https://example.com/twitter-image.jpg (leave empty to use OG image)"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced SEO */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Advanced SEO
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>No Index</Label>
              <p className="text-sm text-muted-foreground">
                Prevent search engines from indexing this post
              </p>
            </div>
            <Switch
              checked={post.seo?.noIndex || false}
              onCheckedChange={(checked) => updateSEO({ noIndex: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>No Follow</Label>
              <p className="text-sm text-muted-foreground">
                Prevent search engines from following links in this post
              </p>
            </div>
            <Switch
              checked={post.seo?.noFollow || false}
              onCheckedChange={(checked) => updateSEO({ noFollow: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* SEO Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Meta title length</span>
              <Badge variant={
                (post.seo?.metaTitle || post.title || "").length >= 50 &&
                (post.seo?.metaTitle || post.title || "").length <= 60
                  ? "default" : "secondary"
              }>
                {(post.seo?.metaTitle || post.title || "").length >= 50 &&
                 (post.seo?.metaTitle || post.title || "").length <= 60
                  ? "Good" : "Needs improvement"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Meta description length</span>
              <Badge variant={
                (post.seo?.metaDescription || post.excerpt || "").length >= 150 &&
                (post.seo?.metaDescription || post.excerpt || "").length <= 160
                  ? "default" : "secondary"
              }>
                {(post.seo?.metaDescription || post.excerpt || "").length >= 150 &&
                 (post.seo?.metaDescription || post.excerpt || "").length <= 160
                  ? "Good" : "Needs improvement"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Focus keyword set</span>
              <Badge variant={post.seo?.focusKeyword ? "default" : "secondary"}>
                {post.seo?.focusKeyword ? "Good" : "Missing"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm">Social media image</span>
              <Badge variant={
                post.seo?.ogImage || post.featuredMedia?.url ? "default" : "secondary"
              }>
                {post.seo?.ogImage || post.featuredMedia?.url ? "Good" : "Missing"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}