// app/(dashboard)/feedback/changelog/page.tsx
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { TopicSidebar } from "@/components/topics/topic-sidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import SortChangelog from "./sortBy";
import SidebarWrap from "@/components/sidebar/sidebar-wrap";
import { SignedIn } from "@daveyplate/better-auth-ui";
import { ChangelogEntry } from "@/components/changelog/changelog-entry";

interface ChangelogPageProps {
  searchParams: Promise<{
    topic?: string;
  }>;
}

export default async function ChangelogPage({ searchParams }: ChangelogPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Check if user is admin or developer
  const isAuthorized = !!session?.user && ["admin", "developer"].includes(session.user.role as string);

  // Get all topics with feedback count
  const topics = await prisma.topic.findMany({
    include: {
      _count: {
        select: {
          feedbacks: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Build where clause for filtering
  const where: any = {};

  if ((await searchParams).topic) {
    where.feedback = {
      topicId: (await searchParams).topic,
    };
  }

  // Get all changelogs
  const changelogs = await prisma.changelog.findMany({
    where,
    include: {
      task: {
        select: {
          id: true,
          title: true,
          creator: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
      feedback: {
        select: {
          id: true,
          title: true,
          topic: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Group changelogs by month/year
  const groupedChangelogs = changelogs.reduce((groups: any, changelog) => {
    const date = new Date(changelog.createdAt);
    const monthYear = date.toLocaleString('default', { month: 'long', year: 'numeric' });

    if (!groups[monthYear]) {
      groups[monthYear] = [];
    }

    groups[monthYear].push(changelog);
    return groups;
  }, {});

  const searchParams_1 = await searchParams

  // Get the selected topic name if any
  const selectedTopic = searchParams_1.topic
    ? topics.find(topic => topic.id === searchParams_1.topic)?.name
    : null;

  // Get completed tasks without changelog
  const completedTasksWithoutChangelog = await prisma.task.findMany({
    where: {
      status: "completed",
      changelog: null,
    },
    select: {
      id: true,
      title: true,
    },
  });

  return (
    <SidebarWrap nav={[
      {
        title: "Feedback Dashboard",
        href: "/feedback"
      },
      {
        title: "Changelog"
      }
    ]}>
      <SignedIn>
        <div className="flex flex-col gap-4 container mx-auto px-4 3xl:p-0">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Changelog</h1>
            {isAuthorized && completedTasksWithoutChangelog.length > 0 && (
              <Button asChild>
                <Link href="/feedback/changelog/new">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  New Changelog
                </Link>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
            {/* Topic Sidebar - Hidden on mobile */}
            <div className="hidden md:block">
              <div className="sticky top-20">
                <TopicSidebar topics={topics} />
              </div>
            </div>

            <div className="space-y-8">
              {/* Filter indicators */}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                  {selectedTopic && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      Topic: {selectedTopic}
                    </Badge>
                  )}

                  {selectedTopic && (
                    <Button variant="ghost" size="sm" asChild className="h-7">
                      <Link href="/feedback/changelog">Clear Filters</Link>
                    </Button>
                  )}
                </div>

                {/* Sort dropdown - Hidden on mobile */}
                <div className="hidden md:block">
                  <SortChangelog />
                </div>
              </div>

              {changelogs.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-center">
                    <h3 className="text-lg font-medium">No changelog entries yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Completed tasks will appear here as changelog entries.
                    </p>
                    {isAuthorized && completedTasksWithoutChangelog.length > 0 && (
                      <Button className="mt-4" asChild>
                        <Link href="/feedback/changelog/new">Create Changelog Entry</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-12">
                  {Object.entries(groupedChangelogs).map(([monthYear, entries]: [string, any]) => (
                    <div key={monthYear} className="space-y-4">
                      <h2 className="text-xl font-bold border-b pb-2">{monthYear}</h2>
                      <div className="space-y-6">
                        {entries.map((changelog: any) => (
                          <div key={changelog.id}>
                            <Link href={`/feedback/changelog/${changelog.id}`}>
                              <ChangelogEntry
                                changelog={changelog}
                                isAuthorized={isAuthorized}
                              />
                            </Link>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </SignedIn></SidebarWrap>
  );
}
