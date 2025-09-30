"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { postsService } from "@/lib/posts-service";
import { Post, PostCategory, PostTag, PostStatus } from "@/types/posts";
import {
  Plus,
  X,
  Folder,
  Tag,
  User,
  Calendar as CalendarIcon,
  Clock,
  Settings,
  Pin,
  Star
} from "lucide-react";
import { format } from "date-fns";

interface OrganizationTabProps {
  post: Partial<Post>;
  onUpdate: (updates: Partial<Post>) => void;
}

export function OrganizationTab({ post, onUpdate }: OrganizationTabProps) {
  const [categories, setCategories] = useState<PostCategory[]>([]);
  const [availableTags, setAvailableTags] = useState<PostTag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [categoriesData, tagsData] = await Promise.all([
        postsService.getCategories(),
        postsService.getTags()
      ]);
      setCategories(categoriesData);
      setAvailableTags(tagsData);
    } catch (error) {
      console.error("Error loading categories and tags:", error);
    }
  };

  const handleAddTag = () => {
    if (!newTagName.trim()) return;

    const existingTag = availableTags.find(tag =>
      tag.name.toLowerCase() === newTagName.trim().toLowerCase()
    );

    if (existingTag) {
      if (!post.tags?.find(tag => tag.id === existingTag.id)) {
        onUpdate({
          tags: [...(post.tags || []), existingTag]
        });
      }
    } else {
      const newTag: PostTag = {
        id: `tag_${Date.now()}`,
        name: newTagName.trim(),
        slug: newTagName.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
      };
      onUpdate({
        tags: [...(post.tags || []), newTag]
      });
    }

    setNewTagName("");
  };

  const handleRemoveTag = (tagId: string) => {
    onUpdate({
      tags: post.tags?.filter(tag => tag.id !== tagId) || []
    });
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      const newCategory = await postsService.createCategory({
        name: newCategoryName.trim(),
        slug: newCategoryName.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
        description: "",
        color: "#6366F1",
      });

      setCategories(prev => [...prev, newCategory]);
      onUpdate({ categoryId: newCategory.id });
      setNewCategoryName("");
      setShowNewCategoryForm(false);
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const handleScheduleChange = () => {
    if (scheduledDate && scheduledTime) {
      const [hours, minutes] = scheduledTime.split(':');
      const scheduleDateTime = new Date(scheduledDate);
      scheduleDateTime.setHours(parseInt(hours), parseInt(minutes));

      onUpdate({
        status: "scheduled" as PostStatus,
        scheduledAt: scheduleDateTime.toISOString()
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Category
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Category</Label>
            <Select
              value={post.categoryId || "none"}
              onValueChange={(value) => onUpdate({ categoryId: value === "none" ? undefined : value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Category</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center gap-2">
                      {category.color && (
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                      )}
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!showNewCategoryForm ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewCategoryForm(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Category
            </Button>
          ) : (
            <div className="space-y-2 p-3 border rounded-lg">
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name..."
                onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateCategory}>
                  Create
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowNewCategoryForm(false);
                    setNewCategoryName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Tags
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Add Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter tag name..."
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
          </div>

          {/* Selected Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Tags</Label>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag.id} variant="secondary" className="gap-1">
                    {tag.name}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleRemoveTag(tag.id)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Available Tags */}
          {availableTags.length > 0 && (
            <div className="space-y-2">
              <Label>Popular Tags</Label>
              <div className="flex flex-wrap gap-1">
                {availableTags
                  .filter(tag => !post.tags?.find(t => t.id === tag.id))
                  .slice(0, 10)
                  .map((tag) => (
                    <Badge
                      key={tag.id}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent"
                      onClick={() => onUpdate({
                        tags: [...(post.tags || []), tag]
                      })}
                    >
                      {tag.name}
                    </Badge>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Publishing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Publishing Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Post Status</Label>
            <Select
              value={post.status || "draft"}
              onValueChange={(value: PostStatus) => onUpdate({ status: value })}
            >
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

          {/* Scheduled Publishing */}
          {post.status === "scheduled" && (
            <div className="space-y-4 p-3 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <Label>Schedule Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledDate ? format(scheduledDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledDate}
                      onSelect={setScheduledDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Schedule Time</Label>
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => {
                    setScheduledTime(e.target.value);
                    handleScheduleChange();
                  }}
                />
              </div>

              {scheduledDate && scheduledTime && (
                <div className="text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Will be published on {format(scheduledDate, "MMM d, yyyy")} at {scheduledTime}
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Post Options */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Pin className="h-4 w-4" />
                  Sticky Post
                </Label>
                <p className="text-sm text-muted-foreground">
                  Pin this post to the top of the blog
                </p>
              </div>
              <Switch
                checked={post.isSticky || false}
                onCheckedChange={(checked) => onUpdate({ isSticky: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Featured Post
                </Label>
                <p className="text-sm text-muted-foreground">
                  Show this post in featured sections
                </p>
              </div>
              <Switch
                checked={post.isFeatured || false}
                onCheckedChange={(checked) => onUpdate({ isFeatured: checked })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Author */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Author
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Post Author</Label>
            <Select
              value={post.authorId || "current_user"}
              onValueChange={(value) => onUpdate({ authorId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select author" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current_user">Current User</SelectItem>
                {/* You can add more authors here when user management is implemented */}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Template */}
      <Card>
        <CardHeader>
          <CardTitle>Post Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Template</Label>
            <Select
              value={post.template || "default"}
              onValueChange={(value) => onUpdate({ template: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="full-width">Full Width</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose how this post will be displayed
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}