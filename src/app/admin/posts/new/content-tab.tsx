"use client";

import { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlock from "@tiptap/extension-code-block";
import { Blockquote } from "@tiptap/extension-blockquote";
import { HorizontalRule } from "@tiptap/extension-horizontal-rule";
import { Dropcursor } from "@tiptap/extension-dropcursor";
import { Gapcursor } from "@tiptap/extension-gapcursor";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TextAlign } from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import { Underline } from "@tiptap/extension-underline";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { generateSlug, generateExcerpt } from "@/lib/slug-utils";
import { Post } from "@/types/posts";

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
  Link as LinkIcon,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table2,
  Minus,
  Undo,
  Redo
} from "lucide-react";

interface ContentTabProps {
  post: Partial<Post>;
  onUpdate: (updates: Partial<Post>) => void;
}

export function ContentTab({ post, onUpdate }: ContentTabProps) {
  const [showImageDialog, setShowImageDialog] = useState(false);

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
          class: "text-primary hover:text-primary/80 underline",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg my-4",
        },
      }),
      Placeholder.configure({
        placeholder: "Start writing your post...",
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: "bg-muted text-foreground p-4 rounded-lg font-mono text-sm my-4 overflow-x-auto",
        },
      }),
      Blockquote.configure({
        HTMLAttributes: {
          class: "border-l-4 border-primary pl-4 italic my-4",
        },
      }),
      HorizontalRule.configure({
        HTMLAttributes: {
          class: "my-8 border-t border-border",
        },
      }),
      Dropcursor,
      Gapcursor,
      TaskList.configure({
        HTMLAttributes: {
          class: "not-prose pl-2",
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: "flex items-start gap-2",
        },
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse border border-border my-4 w-full",
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: "border-b border-border",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-border bg-muted font-semibold p-2 text-left",
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-border p-2",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Color.configure({
        types: ["textStyle"],
      }),
      TextStyle,
      Underline,
    ],
    content: post.content || { type: "doc", content: [] },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onUpdate({ content: json });

      // Auto-generate excerpt if empty
      if (!post.excerpt) {
        const generatedExcerpt = generateExcerpt(json);
        onUpdate({ excerpt: generatedExcerpt });
      }
    },
  });

  const handleTitleChange = async (title: string) => {
    onUpdate({ title });

    // Auto-generate slug if it's empty
    if (!post.slug && title) {
      try {
        const slug = await generateSlug(title);
        onUpdate({ slug });
      } catch (error) {
        console.error('Error generating slug:', error);
        // Fallback to simple slug generation
        const fallbackSlug = title
          .toLowerCase()
          .trim()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');
        onUpdate({ slug: fallbackSlug });
      }
    }
  };

  const addImage = () => {
    const url = prompt("Enter image URL:");
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const url = prompt("Enter link URL:");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const MenuBar = () => {
    if (!editor) return null;

    return (
      <div className="flex flex-wrap gap-1 p-3 border-b bg-muted/50">
        {/* Text Formatting */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={editor.isActive("bold") ? "bg-accent" : ""}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={editor.isActive("italic") ? "bg-accent" : ""}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={editor.isActive("underline") ? "bg-accent" : ""}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
        </div>

        {/* Headings */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={editor.isActive("heading", { level: 1 }) ? "bg-accent" : ""}
            title="Heading 1"
          >
            H1
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={editor.isActive("heading", { level: 2 }) ? "bg-accent" : ""}
            title="Heading 2"
          >
            H2
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={editor.isActive("heading", { level: 3 }) ? "bg-accent" : ""}
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
            className={editor.isActive("bulletList") ? "bg-accent" : ""}
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={editor.isActive("orderedList") ? "bg-accent" : ""}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleTaskList().run()}
            className={editor.isActive("taskList") ? "bg-accent" : ""}
            title="Task List"
          >
            <span className="text-sm">☐</span>
          </Button>
        </div>

        {/* Elements */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={editor.isActive("blockquote") ? "bg-accent" : ""}
            title="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={editor.isActive("codeBlock") ? "bg-accent" : ""}
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
            <Minus className="h-4 w-4" />
          </Button>
        </div>

        {/* Table */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
            }
            title="Insert Table"
          >
            <Table2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Alignment */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={editor.isActive({ textAlign: "left" }) ? "bg-accent" : ""}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={editor.isActive({ textAlign: "center" }) ? "bg-accent" : ""}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={editor.isActive({ textAlign: "right" }) ? "bg-accent" : ""}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Insert */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button variant="ghost" size="sm" onClick={addImage} title="Insert Image">
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={addLink} title="Insert Link">
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

  return (
    <div className="space-y-6">
      {/* Title and Slug */}
      <Card>
        <CardHeader>
          <CardTitle>Post Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={post.title || ""}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter your post title..."
              className="text-lg font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <div className="flex gap-2">
              <Input
                id="slug"
                value={post.slug || ""}
                onChange={(e) => onUpdate({ slug: e.target.value })}
                placeholder="post-slug"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (post.title) {
                    try {
                      const slug = await generateSlug(post.title);
                      onUpdate({ slug });
                    } catch (error) {
                      console.error('Error generating slug:', error);
                      // Fallback to simple slug generation
                      const fallbackSlug = post.title
                        .toLowerCase()
                        .trim()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/[\s_-]+/g, '-')
                        .replace(/^-+|-+$/g, '');
                      onUpdate({ slug: fallbackSlug });
                    }
                  }
                }}
                title="Generate slug from title"
              >
                Generate
              </Button>
            </div>
            {post.slug && (
              <p className="text-sm text-muted-foreground">
                Preview: /blog/{post.slug}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              value={post.excerpt || ""}
              onChange={(e) => onUpdate({ excerpt: e.target.value })}
              placeholder="Brief summary of your post (optional - will be auto-generated if empty)"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {(post.excerpt || "").length}/160 characters recommended
            </p>
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
          <div className="p-4">
            <EditorContent
              editor={editor}
              className="prose prose-sm max-w-none min-h-[400px] focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[400px]"
            />
          </div>
        </CardContent>
      </Card>

      {/* Featured Image */}
      <Card>
        <CardHeader>
          <CardTitle>Featured Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {post.featuredMedia?.url ? (
            <div className="relative">
              <img
                src={post.featuredMedia.url}
                alt="Featured"
                className="w-full h-48 object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => onUpdate({ featuredMedia: undefined })}
              >
                Remove
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg h-48 flex items-center justify-center">
              <div className="text-center">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">No featured image selected</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = prompt("Enter image URL:");
                    if (url) {
                      onUpdate({
                        featuredMedia: {
                          id: `img_${Date.now()}`,
                          url,
                          filename: "featured-image",
                          mimeType: "image/jpeg",
                          size: 0,
                        },
                      });
                    }
                  }}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Add Featured Image
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}