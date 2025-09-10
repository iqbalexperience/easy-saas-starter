// app/(dashboard)/page.tsx
// Update to include changelog information

import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/db";
import { FeedbackCard } from "@/components/feedback/feedback-card";
import { MessageSquare, Tag, ArrowRight, Kanban, FileText, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow, format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import SidebarWrap from "@/components/sidebar/sidebar-wrap";
import { SignedIn } from "@daveyplate/better-auth-ui";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard | FeedFlow",
  description: "Overview of your feedback and tasks",
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Get feedback statistics
  const feedbackCount = await prisma.feedback.count();
  const openFeedbackCount = await prisma.feedback.count({
    where: { status: "open" },
  });
  const inDevelopmentCount = await prisma.feedback.count({
    where: { status: "in-development" },
  });
  const completedCount = await prisma.feedback.count({
    where: { status: "completed" },
  });

  // Get task statistics
  const taskCount = await prisma.task.count();
  const backlogCount = await prisma.task.count({
    where: { status: "backlog" },
  });
  const inProgressCount = await prisma.task.count({
    where: { status: "in-progress" },
  });
  const nextUpCount = await prisma.task.count({
    where: { status: "next-up" },
  });
  const testingCount = await prisma.task.count({
    where: { status: "testing" },
  });
  const completedTaskCount = await prisma.task.count({
    where: { status: "completed" },
  });

  // Get changelog statistics
  const changelogCount = await prisma.changelog.count();
  const completedTasksWithoutChangelog = await prisma.task.count({
    where: {
      status: "completed",
      changelog: null,
    },
  });

  // Get recent feedback
  const recentFeedback = await prisma.feedback.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      topic: true,
      _count: {
        select: {
          upvotes: true,
          comments: true,
        },
      },
    },
  });

  // Get recent tasks
  const recentTasks = await prisma.task.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      assignee: {
        select: {
          id: true,
          name: true,
          image: true,
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
  });

  // Get recent changelogs
  const recentChangelogs = await prisma.changelog.findMany({
    take: 3,
    orderBy: { createdAt: "desc" },
    include: {
      task: {
        select: {
          id: true,
          title: true,
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
  });

  // Get popular topics
  const popularTopics = await prisma.topic.findMany({
    take: 5,
    include: {
      _count: {
        select: {
          feedbacks: true,
        },
      },
    },
    orderBy: {
      feedbacks: {
        _count: "desc",
      },
    },
  });

  // Get recent activity
  const recentActivity = await prisma.feedback.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      topic: true,
    },
  });

  // Check if user is admin or developer
  const isAuthorized = session?.user && ["admin", "developer"].includes(session.user.role as string);
  const isAdmin = session?.user && session.user.role === "admin";

  if (!isAuthorized) {
    redirect("/feedback/feedback")
  }


  return (
    <SidebarWrap nav={[
      {
        title: "Feedback Dashboard",
        href: "/feedback"
      },
      {
        title: "Topics"
      },

    ]}>
      <SignedIn>
        <div className="flex flex-col gap-4 container mx-auto px-4 3xl:p-0">
          <div className="flex justify-between">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="gap-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{feedbackCount}</div>
                <p className="text-xs text-muted-foreground">
                  Across all topics
                </p>
              </CardContent>
            </Card>
            <Card className="gap-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Open Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{openFeedbackCount}</div>
                <p className="text-xs text-muted-foreground">
                  Waiting for review
                </p>
              </CardContent>
            </Card>
            <Card className="gap-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Development</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inDevelopmentCount}</div>
                <p className="text-xs text-muted-foreground">
                  Being worked on
                </p>
              </CardContent>
            </Card>
            <Card className="gap-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedCount}</div>
                <p className="text-xs text-muted-foreground">
                  Implemented features
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="gap-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-xl">
                  <span className=" font-semibold mr-2">{taskCount}</span>
                  Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-row gap-2 items-center">
                    <span className="text-sm font-medium">{backlogCount}</span>
                    <span className="text-xs text-muted-foreground">Backlog</span>
                  </div>
                  <div className="flex flex-row gap-2 items-center">
                    <span className="text-sm font-medium">{nextUpCount}</span>
                    <span className="text-xs text-muted-foreground">Next-Up</span>
                  </div>
                  <div className="flex flex-row gap-2 items-center">
                    <span className="text-sm font-medium">{inProgressCount}</span>
                    <span className="text-xs text-muted-foreground">In Progress</span>
                  </div>
                  <div className="flex flex-row gap-2 items-center">
                    <span className="text-sm font-medium">{testingCount}</span>
                    <span className="text-xs text-muted-foreground">Testing</span>
                  </div>
                  <div className="flex flex-row gap-2 items-center">
                    <span className="text-sm font-medium">{completedTaskCount}</span>
                    <span className="text-xs text-muted-foreground">Completed</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="gap-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="font-medium text-xl">
                  <span className=" font-semibold mr-2">{changelogCount}</span>
                  Changelogs
                </CardTitle>
              </CardHeader>
              <CardContent>

                <div className="mt-2">
                  <div className="flex flex-row gap-2 items-center">
                    <span className="text-sm font-medium">{completedTasksWithoutChangelog}</span>
                    <span className="text-xs text-muted-foreground">Pending Changelog Entries</span>
                  </div>
                  {isAuthorized && completedTasksWithoutChangelog > 0 && (
                    <Button size="sm" className="mt-2 w-full" asChild>
                      <Link href="/feedback/changelog/new">
                        <FileText className="h-3 w-3 mr-1" />
                        Create Changelog
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="gap-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 ">
                <CardTitle className="text-sm font-medium">Topics</CardTitle>
              </CardHeader>
              <CardContent className="">
                <div className="space-y-2">
                  {popularTopics.map((topic) => (
                    <div key={topic.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: topic.color }}
                        />
                        <Link
                          href={`/feedback?topic=${topic.id}`}
                          className="text-sm font-medium hover:underline"
                        >
                          {topic.name}
                        </Link>
                      </div>
                      <Badge variant="secondary">
                        {topic._count.feedbacks} {topic._count.feedbacks === 1 ? "item" : "items"}
                      </Badge>
                    </div>
                  ))}
                  {isAdmin && (
                    <Button variant="outline" size="sm" className="w-full mt-2" asChild>
                      <Link href="/feedback/topics">
                        Manage Topics
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Activity</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/feedback/feedback">
                    View All
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((item) => {
                      const createdAt = new Date(item.createdAt);
                      const initials = item.user.name
                        ? item.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                        : "U";

                      return (
                        <div key={item.id} className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={item.user.image || ""} alt={item.user.name} />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm">
                              <span className="font-medium">{item.user.name}</span>{" "}
                              submitted{" "}
                              <Link
                                href={`/feedback/${item.id}`}
                                className="font-medium hover:underline"
                              >
                                {item.title}
                              </Link>
                            </p>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="text-xs"
                                style={{ borderColor: item.topic.color, color: item.topic.color }}
                              >
                                {item.topic.name}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(createdAt, { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Changelogs</CardTitle>
                <CardDescription>
                  Latest features and improvements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recentChangelogs.length === 0 ? (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">No changelog entries yet</p>
                    {isAuthorized && completedTasksWithoutChangelog > 0 && (
                      <Button className="mt-4" size="sm" asChild>
                        <Link href="/feedback/changelog/new">Create Changelog</Link>
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentChangelogs.map((changelog) => {
                      const createdAt = new Date(changelog.createdAt);
                      return (
                        <div key={changelog.id} className="space-y-1">
                          <Link
                            href={`/changelog/${changelog.id}`}
                            className="font-medium hover:underline"
                          >
                            {changelog.title}
                          </Link>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-xs"
                              style={{
                                borderColor: changelog.feedback.topic.color,
                                color: changelog.feedback.topic.color
                              }}
                            >
                              {changelog.feedback.topic.name}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {format(createdAt, "MMM d, yyyy")}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                            {changelog.description.substring(0, 100)}...
                          </p>
                        </div>
                      );
                    })}

                    <div className="pt-2 border-t">
                      <p className="text-sm mb-2">
                        <span className="font-medium">Recent Updates:</span>
                      </p>
                      <ul className="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
                        {recentChangelogs.slice(0, 3).map(changelog => (
                          <li key={changelog.id}>
                            <span className="font-medium">{changelog.title}</span> - {format(new Date(changelog.createdAt), "MMM d")}
                          </li>
                        ))}
                      </ul>
                      <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                        <Link href="/feedback/changelog">
                          View All Changelogs
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Recent Feedback</h2>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/feedback/feedback">
                    View All
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              {recentFeedback.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-center">
                    <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-3 text-lg font-medium">No feedback yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Create your first feedback to get started.
                    </p>
                    <Button className="mt-4" asChild>
                      <Link href="/feedback/feedback/new">Submit Feedback</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {recentFeedback.map((feedback) => (
                    <FeedbackCard key={feedback.id} feedback={feedback} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Recent Tasks</h2>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/feedback/board">
                    View Board
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              {recentTasks.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-center">
                    <Kanban className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-3 text-lg font-medium">No tasks yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Convert feedback to tasks to get started.
                    </p>
                    {isAuthorized && (
                      <Button className="mt-4" asChild>
                        <Link href="/feedback/board/new">Create Task</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {recentTasks.map((task) => (
                    <Card key={task.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <Link href={`/board/${task.id}`} className="font-medium hover:underline">
                          {task.title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className="capitalize text-xs"
                          >
                            {task.status.replace(/-/g, " ")}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: task.feedback.topic.color,
                              color: task.feedback.topic.color
                            }}
                          >
                            {task.feedback.topic.name}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2 flex justify-between items-center">
                        <Link
                          href={`/feedback/${task.feedback.id}`}
                          className="text-sm text-muted-foreground hover:underline flex items-center"
                        >
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          {task.feedback.title}
                        </Link>
                        {task.assignee ? (
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={task.assignee.image || ""} alt={task.assignee.name} />
                            <AvatarFallback>
                              {task.assignee.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <Badge variant="outline" className="text-xs">Unassigned</Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Latest Changelogs</h2>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/feedback/changelog">
                    View All
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              {recentChangelogs.length === 0 ? (
                <Card>
                  <CardContent className="py-6 text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                    <h3 className="mt-3 text-lg font-medium">No changelogs yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Complete tasks to create changelog entries.
                    </p>
                    {isAuthorized && completedTasksWithoutChangelog > 0 && (
                      <Button className="mt-4" asChild>
                        <Link href="/feedback/changelog/new">Create Changelog</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {recentChangelogs.map((changelog) => (
                    <Card key={changelog.id}>
                      <CardHeader className="p-4 pb-2">
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(changelog.createdAt), "MMMM d, yyyy")}
                        </div>
                        <Link href={`/changelog/${changelog.id}`} className="font-medium hover:underline">
                          {changelog.title}
                        </Link>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: changelog.feedback.topic.color,
                              color: changelog.feedback.topic.color
                            }}
                          >
                            {changelog.feedback.topic.name}
                          </Badge>
                          <Link
                            href={`/board/${changelog.task.id}`}
                            className="text-xs text-muted-foreground hover:underline"
                          >
                            {changelog.task.title}
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </SignedIn>
    </SidebarWrap>
  );
}
