"use client";

import { useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Comment {
  id: number;
  content: string;
  status: "pending" | "approved" | "spam";
  author: { name: string; avatar?: string };
  createdAt: Date;
  replies?: Comment[];
}

interface CommentsSectionProps {
  postId: number;
  initialComments: Comment[];
}

export function CommentsSection({ postId, initialComments }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent, parentId?: number) => {
    e.preventDefault();
    if (!session || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("bearer_token")}`,
        },
        body: JSON.stringify({
          postId,
          content: newComment,
          parentId,
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        toast.error(error.message || "Failed to post comment");
        return;
      }

      const data = await res.json();
      setComments((prev) =>
        parentId
          ? prev.map((c) =>
              c.id === parentId
                ? { ...c, replies: [...(c.replies || []), data] }
                : c
            )
          : [...prev, data]
      );
      setNewComment("");
      toast.success("Comment posted and awaiting approval");
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Sign in to comment.</p>
          <Button onClick={() => router.push("/sign-in")} className="mt-4">Sign In</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-semibold">
          Comments ({comments.length})
        </h2>
      </div>
      <div className="space-y-6 mb-8">
        {comments.map((comment) => (
          <div key={comment.id} className="border rounded-lg p-6">
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex-shrink-0">
                {comment.author.avatar ? (
                  // Image component would go here
                  (<div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {comment.author.name.charAt(0)}
                    </span>
                  </div>)
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {comment.author.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{comment.author.name}</h4>
                  <span className="text-xs text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm mt-1">{comment.content}</p>
              </div>
            </div>

            {(comment.replies?.length ?? 0) > 0 && (
              <div className="ml-10 space-y-4 mt-4">
                {comment.replies?.map((reply) => (
                  <div key={reply.id} className="border-l pl-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-full bg-muted overflow-hidden flex-shrink-0 mt-1">
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {reply.author.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-xs">{reply.author.name}</h5>
                          <span className="text-xs text-muted-foreground">
                            {new Date(reply.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs mt-1">{reply.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {comments.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No comments yet. Be the first!</p>
          </CardContent>
        </Card>
      )}
      <form onSubmit={(e) => handleSubmit(e)} className="space-y-4">
        <Textarea
          placeholder="Share your thoughts..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px]"
          disabled={isSubmitting}
        />
        <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
          {isSubmitting ? "Posting..." : "Post Comment"}
        </Button>
      </form>
    </section>
  );
}