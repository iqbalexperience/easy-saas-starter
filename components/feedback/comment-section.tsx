// components/feedback/comment-section.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Markdown from "react-markdown";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  CheckCircle2
} from "lucide-react";
import { Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { useHash } from "@/lib/hooks/useHash";

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(1000, "Comment is too long"),
  parentId: z.string().optional(),
});

type CommentFormValues = z.infer<typeof commentSchema>;

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  isAnswer: boolean;
  user: {
    id: string;
    name: string;
    image?: string | null;
  };
  parentId?: string | null;
  replies?: Comment[];
  isDeleted?: boolean;
}

interface CommentSectionProps {
  feedbackId: string;
  initialComments: Comment[];
  isAuthorized: boolean; // admin or feedback creator
}

export function CommentSection({ feedbackId, initialComments, isAuthorized }: CommentSectionProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>(
    organizeComments(initialComments)
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
  const urlHash = useHash()
  const [quotedContent, setQuotedContent] = useState("")

  useEffect(() => {
    if (urlHash) {
      const commentElement = document.getElementById(urlHash)
      commentElement?.scrollIntoView({ behavior: "smooth" })
    }
  }, [urlHash])

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
      parentId: undefined,
    },
  });

  const replyForm = useForm<CommentFormValues>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      content: "",
      parentId: "",
    },
  });

  // Organize comments into parent-child structure
  function organizeComments(flatComments: Comment[]): Comment[] {
    const commentMap: Record<string, Comment> = {};
    const rootComments: Comment[] = [];

    // First pass: create a map of all comments by ID and initialize replies array
    flatComments.forEach(comment => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    // Second pass: organize into parent-child structure
    flatComments.forEach(comment => {
      if (comment.parentId && commentMap[comment.parentId]) {
        // This is a reply, add it to parent's replies
        commentMap[comment.parentId].replies?.push(commentMap[comment.id]);
      } else {
        // This is a root comment
        rootComments.push(commentMap[comment.id]);
      }
    });

    // Sort root comments by answer status (answers first) and then by date
    return rootComments.sort((a, b) => {
      if (a.isAnswer && !b.isAnswer) return -1;
      if (!a.isAnswer && b.isAnswer) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async function onSubmit(data: CommentFormValues) {
    if (!session?.user) {
      toast.error("You must be signed in to comment");
      return;
    }

    setIsSubmitting(true);

    try {
      // Optimistic update
      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        content: data.content,
        createdAt: new Date(),
        isAnswer: false,
        isDeleted: false,
        user: {
          id: session.user.id,
          name: session.user.name || "",
          image: session.user.image || null,
        },
        parentId: data.parentId,
        replies: [],
      };

      // Reset the form first to prevent double submissions
      if (data.parentId) {
        replyForm.reset();
        setReplyingTo(null);
      } else {
        form.reset();
      }

      const data_1 = { ...data }
      data_1.content = quotedContent + "\n\n" + data_1.content

      const response = await fetch(`/api/feedback/${feedbackId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data_1),
      });

      setQuotedContent("")

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Something went wrong");
      }

      const newComment = await response.json();

      // Replace optimistic comment with actual one
      setComments(prev => {
        // Deep clone to avoid mutation issues
        const updatedComments = JSON.parse(JSON.stringify(prev));

        const findAndReplaceComment = (comments: Comment[], tempId: string, newComment: Comment) => {
          for (let i = 0; i < comments.length; i++) {
            if (comments[i].id === tempId) {
              comments[i] = { ...newComment, replies: [] };
              return true;
            }
            // @ts-ignore
            if (comments[i].replies && findAndReplaceComment(comments[i].replies, tempId, newComment)) {
              return true;
            }
          }
          return false;
        };

        // If we couldn't find and replace, just reorganize all comments from the server
        if (!findAndReplaceComment(updatedComments, optimisticComment.id, newComment)) {
          // Fetch all comments again to ensure correct structure
          fetch(`/api/feedback/${feedbackId}/comments`)
            .then(res => res.json())
            .then(data => {
              setComments(organizeComments(data));
            })
            .catch(err => {
              console.error("Failed to refresh comments:", err);
            });
        }

        return updatedComments;
      });

      router.refresh();
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error((error as Error).message || "Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleAnswerStatus(commentId: string, currentIsAnswer: boolean) {
    try {
      const method = currentIsAnswer ? "DELETE" : "POST";
      const response = await fetch(`/api/feedback/${feedbackId}/comments/${commentId}/answer`, {
        method,
      });

      if (!response.ok) {
        throw new Error("Failed to update answer status");
      }

      const result = await response.json();

      // Update local state
      setComments(prev => {
        const updatedComments = JSON.parse(JSON.stringify(prev));

        const updateCommentAnswerStatus = (comments: Comment[], targetId: string, isAnswer: boolean) => {
          for (let i = 0; i < comments.length; i++) {
            if (comments[i].id === targetId) {
              comments[i].isAnswer = isAnswer;
              return true;
            }
            // @ts-ignore
            if (comments[i].replies && updateCommentAnswerStatus(comments[i].replies, targetId, isAnswer)) {
              return true;
            }
          }
          return false;
        };

        // First, unmark all comments as answers if we're setting a new answer
        if (!currentIsAnswer) {
          const unmarkAllAnswers = (comments: Comment[]) => {
            for (let i = 0; i < comments.length; i++) {
              comments[i].isAnswer = false;
              if (comments[i].replies) {
                // @ts-ignore
                unmarkAllAnswers(comments[i].replies);
              }
            }
          };
          unmarkAllAnswers(updatedComments);
        }

        // Then mark/unmark the specific comment
        updateCommentAnswerStatus(updatedComments, commentId, !currentIsAnswer);

        // Resort the comments to keep answers at the top
        return updatedComments.sort((a: Comment, b: Comment) => {
          if (a.isAnswer && !b.isAnswer) return -1;
          if (!a.isAnswer && b.isAnswer) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      });

      toast.success(
        currentIsAnswer
          ? "Comment unmarked as answer"
          : "Comment marked as answer and feedback closed"
      );

      router.refresh();
    } catch (error) {
      console.error("Error updating answer status:", error);
      toast.error("Failed to update answer status");
    }
  }

  function toggleReplies(commentId: string) {
    setExpandedReplies(prev => ({
      ...prev,
      [commentId]: !prev[commentId]
    }));
  }

  function startReply(commentId: string, commentContent: string, commentAuthor: string) {
    setReplyingTo(commentId);
    replyForm.setValue("parentId", commentId);

    // Add quote of the original comment with a link
    const quotedContent = `> [@${commentAuthor}](#${commentId})\n> ${commentContent.replace(/\n/g, '\n> ')?.slice(0, 200)}${commentContent?.length > 200 ? '...' : ''}`;
    setQuotedContent(quotedContent)
  }

  function cancelReply() {
    setReplyingTo(null);
    replyForm.reset();
  }

  // Add this function inside the CommentSection component
  async function deleteComment(commentId: string) {
    try {
      const response = await fetch(`/api/feedback/${feedbackId}/comments/${commentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete comment");
      }

      // Update local state
      setComments(prev => {
        const updatedComments = JSON.parse(JSON.stringify(prev));

        const findAndHandleComment = (comments: Comment[], targetId: string) => {
          for (let i = 0; i < comments.length; i++) {
            if (comments[i].id === targetId) {
              // Check if comment has replies
              // @ts-ignore
              if (comments[i].replies && comments[i].replies.length > 0) {
                // Mark as deleted but keep in place
                comments[i].content = "_This comment has been deleted_";
                comments[i].isDeleted = true;
                comments[i].isAnswer = false;
              } else {
                // Remove from array if no replies
                comments.splice(i, 1);
              }
              return true;
            }
            // @ts-ignore
            if (comments[i].replies && findAndHandleComment(comments[i].replies, targetId)) {
              return true;
            }
          }
          return false;
        };

        findAndHandleComment(updatedComments, commentId);
        return updatedComments;
      });

      toast.success("Comment deleted");
      router.refresh();
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  }



  // Render a single comment with its replies
  const renderComment = (comment: Comment, level = 0) => {
    const createdAt = new Date(comment.createdAt);
    const isOptimistic = comment.id.startsWith('temp-');
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isExpanded = expandedReplies[comment.id] || false;
    const isDeleted = comment.isDeleted || comment.content === "_This comment has been deleted_";
    const isHighlighted = urlHash?.includes(`#${comment.id}`)

    // Generate initials for avatar fallback
    const initials = comment.user.name
      ? comment.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
      : "U";

    return (
      <div key={comment.id} id={`#${comment.id}`} className={`${isOptimistic ? "opacity-70" : ""} ${level > 0 ? "ml-6 pl-4 border-l" : ""} `}>
        <div className={`${comment.isAnswer ? "bg-accent/10 rounded-md p-3 border border-accent/20" : ""}`}>
          <div className="flex items-start gap-4">

            <Avatar className="h-10 w-10">
              <AvatarImage src={comment.user.image || ""} alt={comment.user.name} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.user.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {isOptimistic ? "Just now" : formatDistanceToNow(createdAt, { addSuffix: true })}
                  </span>

                  {comment.isAnswer && (
                    <div className=" bg-background rounded-full">
                      <CheckCircle2 className="h-5 w-5 text-current" />
                    </div>
                  )}
                  {comment.isAnswer && (
                    <Badge variant="success" className="text-accent border-accent text-xs">
                      Solution
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">

                  {isAuthorized && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => toggleAnswerStatus(comment.id, comment.isAnswer)}
                    >
                      <CheckCircle className={`h-4 w-4 mr-1 ${comment.isAnswer ? "text-accent" : "text-muted-foreground"}`} />
                      {comment.isAnswer ? "Unmark Solution" : "Mark as Solution"}
                    </Button>
                  )}
                  {session?.user && !isOptimistic && !isDeleted && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => startReply(comment.id, comment.content, comment.user.name)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Reply
                    </Button>
                  )}
                  {(isAuthorized || comment.user.id === session?.user?.id) && !isOptimistic && !comment.isDeleted && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-destructive hover:text-destructive"
                      onClick={() => deleteComment(comment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  )}
                </div>
              </div>
              <div className={isHighlighted ? "prose dark:prose-invert prose-sm max-w-none p-2 rounded border border-primary" : "prose dark:prose-invert prose-sm max-w-none"}>
                {isDeleted ? (
                  <p className="text-muted-foreground italic">This comment has been deleted</p>
                ) : (
                  <Markdown>{comment.content}</Markdown>
                )}
              </div>

              {/* Reply form */}
              {replyingTo === comment.id && (
                <div className="mt-3 border-t pt-3">
                  <Form {...replyForm}>
                    <form onSubmit={replyForm.handleSubmit(onSubmit)} className="space-y-3">
                      <FormField
                        control={replyForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <Tabs defaultValue="write">
                              <TabsList className="mb-2">
                                <TabsTrigger value="write">Write</TabsTrigger>
                                <TabsTrigger value="preview">Preview</TabsTrigger>
                              </TabsList>
                              <TabsContent value="write">
                                <FormControl>
                                  <Textarea
                                    placeholder="Add your reply..."
                                    className="min-h-24 font-mono"
                                    {...field}
                                  />
                                </FormControl>
                              </TabsContent>
                              <TabsContent value="preview">
                                <Card className="p-4 min-h-24 prose dark:prose-invert max-w-none">
                                  {field.value ? (
                                    <Markdown>{field.value}</Markdown>
                                  ) : (
                                    <p className="text-muted-foreground italic">Nothing to preview</p>
                                  )}
                                </Card>
                              </TabsContent>
                            </Tabs>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" disabled={isSubmitting}>
                          {isSubmitting ? "Posting..." : "Post Reply"}
                        </Button>
                        <Button type="button" variant="outline" size="sm" onClick={cancelReply}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}

              {/* Show/hide replies button */}
              {hasReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-7 px-2"
                  onClick={() => toggleReplies(comment.id)}
                >
                  <CornerDownRight className="h-3 w-3 mr-1" />
                  {isExpanded ? "Hide" : "Show"} {comment.replies?.length} {comment.replies?.length === 1 ? "reply" : "replies"}
                  {isExpanded ? <ChevronUp className="h-3 w-3 ml-1" /> : <ChevronDown className="h-3 w-3 ml-1" />}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Render replies if expanded */}
        {hasReplies && isExpanded && (
          <div className="mt-3 space-y-4">
            {comment.replies?.map(reply => renderComment(reply, level + 1))}
          </div>
        )}

        {comment !== comments[comments.length - 1] && level === 0 && (
          <Separator className="my-4" />
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">
        Comments ({comments.reduce((count, comment) => {
          // Count this comment
          let total = 1;
          // Add replies if any
          if (comment.replies) {
            total += comment.replies.length;
          }
          return count + total;
        }, 0)})
      </h3>

      {session?.user ? (
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <Tabs defaultValue="write">
                      <TabsList className="mb-2">
                        <TabsTrigger value="write">Write</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                      </TabsList>
                      <TabsContent value="write">
                        <FormControl>
                          <Textarea
                            placeholder="Add your comment..."
                            className="min-h-24 font-mono"
                            {...field}
                          />
                        </FormControl>
                      </TabsContent>
                      <TabsContent value="preview">
                        <Card className="p-4 min-h-24 prose dark:prose-invert max-w-none">
                          {field.value ? (
                            <Markdown>{field.value}</Markdown>
                          ) : (
                            <p className="text-muted-foreground italic">Nothing to preview</p>
                          )}
                        </Card>
                      </TabsContent>
                    </Tabs>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </form>
          </Form>
        </div>
      ) : (
        <Card>
          <CardContent className="py-4 text-center">
            <p className="mb-2">Please sign in to leave a comment</p>
            <Button onClick={() => router.push("/sign-in")}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      )}

      {comments.length > 0 ? (
        <div className="space-y-4 mt-6">
          {comments.map(comment => renderComment(comment))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-4 text-center text-muted-foreground">
            No comments yet. Be the first to comment!
          </CardContent>
        </Card>
      )}
    </div>
  );
}
