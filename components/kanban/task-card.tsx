// components/kanban/task-card.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, ChevronRight, ChevronsRight, ChevronUp, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import { UpvoteButton } from "../feedback/upvote-button";

interface TaskCardProps {
  task: {
    id: string;
    title: string;
    status: string;
    priority: string;
    assignee?: {
      id: string;
      name: string;
      image?: string | null;
    } | null;
    feedback: {
      id: string;
      title: string;
      topic: {
        id: string;
        name: string;
        color: string;
      };
      _count: {
        upvotes: number;
        comments: number;
      }
    };
  };
  handleMoveForward: Function;
  column: any;
  isUpdating: any
}

export function TaskCard({ task, column, handleMoveForward, isUpdating }: TaskCardProps) {
  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  // Priority badge variant
  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case "low":
        return "outline";
      case "medium":
        return "default";
      case "high":
        return "secondary";
      case "urgent":
        return "destructive";
      default:
        return "default";
    }
  };

  const isLastColumn = column.id === "completed";

  // console.log(task)

  return (
    <Card className=" overflow-hidden p-0 ">
      <div className="p-4 gap-2 flex flex-col">
        <div className="flex flex-row justify-between items-center">
          {/* Title */}
          <Link
            href={`/feedback/board/${task.id}`}
            className="hover:underline flex items-center font-medium"
          ><ArrowUpRight className="size-4 mr-1" />
            <span className="line-clamp-1 max-w-[150px]">{task.title}</span>
          </Link>

          {/* Feedback and Assignee */}
          <div className="flex items-center justify-between text-xs text-muted-foreground ">

            {task.assignee ? (
              <Avatar className="h-5 w-5 ml-1">
                <AvatarImage
                  src={task.assignee.image || ""}
                  alt={task.assignee.name}
                />
                <AvatarFallback className="text-[10px]">
                  {getInitials(task.assignee.name)}
                </AvatarFallback>
              </Avatar>
            ) : null}
          </div></div>

        {/* Topic and Priority */}
        <div className="flex items-center gap-2 ">
          <Badge
            variant="outline"
            style={{
              borderColor: task.feedback.topic.color,
              color: task.feedback.topic.color,
            }}
          >
            {task.feedback.topic.name}
          </Badge>
          <Badge
            variant={getPriorityVariant(task.priority)}
            className="capitalize"
          >
            {task.priority}
          </Badge>
        </div>
        {!isLastColumn && (
          <div className="mt-1 flex justify-between">
            <UpvoteButton
              size="sm"
              feedbackId={task.feedback.id}
              initialCount={task?.feedback?._count?.upvotes}
            />
            <div className="flex flex-row items-center gap-2">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <MessageSquare className="size-4" />
                {task?.feedback?._count?.comments}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMoveForward(task.id)}
                disabled={isUpdating === task.id}
              >
                {column.id === "testing" ? (
                  <>Review</>
                ) : (
                  <ChevronsRight />
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
