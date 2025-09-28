"use client";

import React, { useCallback, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import CodeBlock from "@tiptap/extension-code-block";
import Placeholder from "@tiptap/extension-placeholder";
import Focus from "@tiptap/extension-focus";
import History from "@tiptap/extension-history";
import Typography from "@tiptap/extension-typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Toggle } from "@/components/ui/toggle";
import { Bold, Code, Heading1, Heading2, Heading3, Image as ImageIcon, Italic, Link as LinkIcon, List, ListOrdered, Quote, Redo, Undo } from "lucide-react";

type EditorProps = {
  content: any;
  onUpdate?: (content: any) => void;
  editable?: boolean;
  placeholder?: string;
};

export function Editor({ content, onUpdate, editable = true, placeholder = "Start typing..." }: EditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "underline text-blue-500",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "mx-auto max-w-full h-auto rounded-lg",
        },
        inline: false,
      }),
      CodeBlock.configure({
        HTMLAttributes: {
          class: "bg-muted rounded-md p-4 font-mono",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      Focus.configure({
        className: "focus:outline-none focus:ring-2 ring-ring",
      }),
      History,
      Typography,
    ],
    content,
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none focus:ring-2 ring-ring rounded-lg border border-input min-h-[200px] p-4",
      },
    },
    editable,
    onUpdate: ({ editor }) => {
      onUpdate?.(editor.getJSON());
    },
  });

  const addLink = useCallback(() => {
    const previousUrl = editor?.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();

      return;
    }

    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-4">
      {editable && (
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={editor.isActive("bold") ? "bg-primary" : ""}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={editor.isActive("italic") ? "bg-primary" : ""}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addLink()}
              className={editor.isActive("link") ? "bg-primary" : ""}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={editor.isActive("codeBlock") ? "bg-primary" : ""}
            >
              <Code className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive("bulletList") ? "bg-primary" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive("orderedList") ? "bg-primary" : ""}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={editor.isActive("heading", { level: 1 }) ? "bg-primary" : ""}
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor.isActive("heading", { level: 2 }) ? "bg-primary" : ""}
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={editor.isActive("heading", { level: 3 }) ? "bg-primary" : ""}
            >
              <Heading3 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={editor.isActive("blockquote") ? "bg-primary" : ""}
            >
              <Quote className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = window.prompt("URL");
                if (url) {
                  editor.chain().focus().setImage({ src: url }).run();
                }
              }}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
          <Toggle
            pressed={isPreview}
            onPressedChange={setIsPreview}
            variant="outline"
            size="sm"
          >
            {isPreview ? "Edit" : "Preview"}
          </Toggle>
        </div>
      )}
      <Card>
        <CardContent className="p-0">
          {isPreview ? (
            <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto p-4 min-h-[200px]">
              <div dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
            </div>
          ) : (
            <EditorContent editor={editor} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}