// components/feedback/upvote-button.tsx
"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { ChevronUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface UpvoteButtonProps {
  feedbackId: string;
  initialCount: number;
  size?: "sm" | "default";
}

export function UpvoteButton({
  feedbackId,
  initialCount,
  size = "default",
}: UpvoteButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [userUpvoted, setUserUpvoted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If user is logged in, check if they've upvoted this feedback
    if (session?.user) {
      const checkUpvoteStatus = async () => {
        try {
          const response = await fetch(`/api/feedback/${feedbackId}/upvote`);
          if (response.ok) {
            const data = await response.json();
            setCount(data.count);
            setUserUpvoted(data.userUpvoted);
          }
        } catch (error) {
          console.error("Failed to check upvote status:", error);
        }
      };

      checkUpvoteStatus();
    }
  }, [feedbackId, session?.user]);

  const handleUpvote = async () => {
    if (!session?.user) {
      toast.error("You must be signed in to upvote");
      return;
    }

    if (isLoading) return;

    try {
      setIsLoading(true);

      // Optimistic update
      setUserUpvoted(!userUpvoted);
      setCount(userUpvoted ? count - 1 : count + 1);

      const response = await fetch(`/api/feedback/${feedbackId}/upvote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Revert optimistic update if failed
        setUserUpvoted(userUpvoted);
        setCount(userUpvoted ? count : count - 1);
        throw new Error("Failed to toggle upvote");
      }

      router.refresh();
    } catch (error) {
      console.error("Failed to upvote:", error);
      toast.error("Failed to upvote. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={userUpvoted ? "default" : "outline"}
      size={size === "sm" ? "sm" : "default"}
      className={`flex items-center gap-1 ${size === "sm" ? "px-2" : ""}`}
      onClick={handleUpvote}
      disabled={isLoading}
    >
      <ChevronUp className={`h-4 w-4 ${userUpvoted ? "text-primary-foreground" : ""}`} />
      <span>{count}</span>
    </Button>
  );
}
