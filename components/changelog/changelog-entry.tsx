// components/changelog/changelog-entry.tsx
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow, format } from "date-fns";
import { ArrowUpRight, Calendar, Pencil } from "lucide-react";
import Link from "next/link";
import Markdown from "react-markdown";

interface ChangelogEntryProps {
  changelog: {
    id: string;
    title: string;
    description: string;
    createdAt: string | Date;
    task: {
      id: string;
      title: string;
      creator: {
        id: string;
        name: string;
        image?: string | null;
      };
    };
    feedback: {
      id: string;
      title: string;
      topic: {
        id: string;
        name: string;
        color: string;
      };
    };
  };
  isAuthorized: boolean;
}

export function ChangelogEntry({ changelog, isAuthorized }: ChangelogEntryProps) {
  const createdAt = new Date(changelog.createdAt);

  // Generate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {format(createdAt, "MMMM d, yyyy")}
            </span>
          </div>
          <h1 className="text-2xl font-bold">{changelog.title}</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge
              variant="outline"
              className="flex items-center gap-1"
              style={{ borderColor: changelog.feedback.topic.color, color: changelog.feedback.topic.color }}
            >
              {changelog.feedback.topic.name}
            </Badge>
          </div>
        </div>
        {isAuthorized && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/feedback/changelog/${changelog.id}/edit`}>
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
        )}
      </CardHeader>
      <CardContent className="py-4">
        <div className="mb-4 p-3 bg-muted rounded-md">
          <p className="text-sm mb-2">
            <span className="font-medium">Related Feedback:</span>{" "}
            <Link
              href={`/feedback/${changelog.feedback.id}`}
              className="hover:underline flex items-center "
            >
              {changelog.feedback.title}
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </Link>
          </p>
          <p className="text-sm">
            <span className="font-medium">Completed Task:</span>{" "}
            <Link
              href={`/feedback/board/${changelog.task.id}`}
              className="hover:underline flex items-center "
            >
              {changelog.task.title}
              <ArrowUpRight className="h-3 w-3 ml-1" />
            </Link>
          </p>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <Markdown>{changelog.description}</Markdown>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between items-center border-t">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={changelog.task.creator.image || ""} alt={changelog.task.creator.name} />
            <AvatarFallback>{getInitials(changelog.task.creator.name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{changelog.task.creator.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(createdAt, { addSuffix: true })}
            </p>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
