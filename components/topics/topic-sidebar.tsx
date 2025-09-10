// components/topics/topic-sidebar.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { LucideIcon, Tag } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import * as LucideIcons from "lucide-react";

interface Topic {
  id: string;
  name: string;
  color: string;
  icon?: string | null;
  _count?: {
    feedbacks: number;
  };
}

interface TopicSidebarProps {
  topics: Topic[];
  className?: string;
}

export function TopicSidebar({ topics, className }: TopicSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTopicId = searchParams.get("topic");

  // Create a new URLSearchParams instance for manipulation
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }

    return params.toString();
  };

  const handleTopicClick = (topicId: string) => {
    // If already selected, clear the filter
    const newTopicId = currentTopicId === topicId ? "" : topicId;

    // Update the URL with the new query parameter
    const queryString = createQueryString("topic", newTopicId);
    router.push(`${pathname}?${queryString}`);
  };

  // Get Lucide icon component if available
  const getIconComponent = (iconName?: string | null): LucideIcon => {
    if (!iconName) return Tag;

    // @ts-ignore - Lucide icons have a dynamic structure
    const IconComponent = LucideIcons[iconName];
    return IconComponent || Tag;
  };

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className=" py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Topics
          </h2>
          <ScrollArea className="h-[300px] pr-2">
            <div className="space-y-1">
              <Button
                variant={!currentTopicId ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => router.push(pathname)}
              >
                <Tag className="mr-2 h-4 w-4" />
                All Topics
              </Button>

              {topics.map((topic) => {
                const IconComponent = getIconComponent(topic.icon);
                return (
                  <Button
                    key={topic.id}
                    variant={currentTopicId === topic.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleTopicClick(topic.id)}
                  >
                    <IconComponent
                      className="mr-2 h-4 w-4"
                      style={{ color: topic.color }}
                    />
                    {topic.name}
                    {topic._count?.feedbacks ? (
                      <Badge
                        variant="secondary"
                        className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                      >
                        {topic._count.feedbacks}
                      </Badge>
                    ) : null}
                  </Button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
