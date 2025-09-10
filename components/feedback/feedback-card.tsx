// components/feedback/feedback-card.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, Tag } from "lucide-react";
import Link from "next/link";
import { UpvoteButton } from "./upvote-button";
import * as LucideIcons from "lucide-react";

interface FeedbackCardProps {
  feedback: {
    id: string;
    title: string;
    description: string;
    status: string;
    createdAt: string | Date;
    user: {
      id: string;
      name: string;
      image?: string | null;
    };
    topic: {
      id: string;
      name: string;
      color: string;
      icon?: string | null;
    };
    _count: {
      upvotes: number;
      comments: number;
    };
  };
}

export function FeedbackCard({ feedback }: FeedbackCardProps) {
  const createdAt = new Date(feedback.createdAt);

  // Get icon component if available
  const getIconComponent = (iconName?: string | null) => {
    if (!iconName) return Tag;

    // @ts-ignore - Lucide icons have a dynamic structure
    const IconComponent = LucideIcons[iconName];
    return IconComponent || Tag;
  };

  const TopicIcon = getIconComponent(feedback.topic.icon);

  // Generate initials for avatar fallback
  const initials = feedback.user.name
    ? feedback.user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
    : "U";

  // Status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "open":
        return "success";
      case "in-development":
        return "indev";
      case "completed":
        return "secondary";
      case "closed":
        return "closed";
      default:
        return "default";
    }
  };

  // Truncate description for preview
  const truncateDescription = (text: string, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };


  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div>
          <Link
            href={`/feedback/feedback/${feedback.id}`}
            className="font-semibold hover:underline text-lg line-clamp-2"
          >
            {feedback.title}
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant={getStatusVariant(feedback.status)}>
              {feedback.status.replace("-", " ")}
            </Badge>
            <Badge
              variant="outline"
              className="flex items-center gap-1"
              style={{ borderColor: feedback.topic.color, color: feedback.topic.color }}
            >
              <TopicIcon className="h-3 w-3" />
              {feedback.topic.name}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-2 flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {truncateDescription(feedback.description)}
        </p>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={feedback.user.image || ""} alt={feedback.user.name} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <UpvoteButton
            feedbackId={feedback.id}
            initialCount={feedback._count.upvotes}
          />
          <Badge variant="secondary" className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {feedback._count.comments}
          </Badge>
        </div>
      </CardFooter>
    </Card>
  );
}
