// app/(dashboard)/feedback/page.tsx
import { Button } from "@/components/ui/button";
import { FeedbackCard } from "@/components/feedback/feedback-card";
import { PlusIcon, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/db";
import { TopicSidebar } from "@/components/topics/topic-sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";
import SortSelect from "./sortSelect";
import SidebarWrap from "@/components/sidebar/sidebar-wrap";
import { SignedIn } from "@daveyplate/better-auth-ui";
import { Input } from "@/components/ui/input";

interface FeedbackPageProps {
  searchParams: Promise<{
    topic?: string;
    status?: string;
    sort?: string;
    search?: string;
  }>
}

export default async function FeedbackPage({ searchParams: searchParams_0 }: FeedbackPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const searchParams = await searchParams_0

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

  if (searchParams.topic) {
    where.topicId = searchParams.topic;
  }

  if (searchParams.status) {
    where.status = searchParams.status;
  }

  // Add search functionality
  if (searchParams.search && searchParams.search.trim() !== '') {
    where.OR = [
      { title: { contains: searchParams.search, mode: 'insensitive' } },
      { description: { contains: searchParams.search, mode: 'insensitive' } },
    ];
  }

  // Determine ordering based on sort parameter
  let orderBy: any = { createdAt: "desc" }; // default to newest

  if (searchParams.sort === "oldest") {
    orderBy = { createdAt: "asc" };
  } else if (searchParams.sort === "most-upvotes") {
    orderBy = { upvotes: { _count: "desc" } };
  } else if (searchParams.sort === "least-upvotes") {
    orderBy = { upvotes: { _count: "asc" } };
  }

  // Get feedback with filtering and sorting
  const feedbacks = await prisma.feedback.findMany({
    where,
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
    orderBy,
  });

  // Get the selected topic name if any
  const selectedTopic = searchParams.topic
    ? topics.find(topic => topic.id === searchParams.topic)?.name
    : null;

  return (
    <SidebarWrap nav={[
      {
        title: "Feedback Dashboard",
        href: "/feedback"
      },
      {
        title: "Feedbacks",
      },
    ]}>
      <SignedIn>
        <div className="flex flex-col gap-4 container mx-auto px-4 3xl:p-0">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Feedback</h1>
            <Button asChild>
              <Link href="/feedback/feedback/new">
                <PlusIcon className="mr-2 h-4 w-4" />
                New Feedback
              </Link>
            </Button>
          </div>

          <div className="flex lg:flex-row lg:justify-between lg:items-center flex-col gap-2">

            {/* Add search form */}
            <div className="w-full">
              <form className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  type="search"
                  placeholder="Search feedback..."
                  name="search"
                  defaultValue={searchParams.search || ''}
                  className="w-full"
                />
                <Button type="submit" size="sm">
                  <Search className="h-4 w-4 mr-1" />
                  Search
                </Button>
                {searchParams.search && (
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-8 px-2"
                  >
                    <Link href={{
                      pathname: '/feedback',
                      query: {
                        ...(searchParams.topic ? { topic: searchParams.topic } : {}),
                        ...(searchParams.status ? { status: searchParams.status } : {}),
                        ...(searchParams.sort ? { sort: searchParams.sort } : {}),
                      }
                    }}>
                      Clear
                    </Link>
                  </Button>
                )}
              </form>
            </div>

            {/* Sort dropdown - Hidden on mobile */}
            <div className="hidden md:block">
              <SortSelect sort={searchParams.sort} />
            </div>
          </div>
          {/* Filters for mobile */}
          <div className="flex md:hidden items-center justify-between gap-2 mb-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/feedback/feedback" className="w-full cursor-pointer">
                    All
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="?status=open" className="w-full cursor-pointer">
                    Open
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="?status=in-development" className="w-full cursor-pointer">
                    In Development
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="?status=completed" className="w-full cursor-pointer">
                    Completed
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="?status=closed" className="w-full cursor-pointer">
                    Closed
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <SortSelect sort={searchParams.sort} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
            {/* Topic Sidebar - Hidden on mobile */}
            <div className="hidden md:block">
              <div className="sticky top-20">
                <TopicSidebar topics={topics} />

                <div className=" py-2 mt-4">
                  <h3 className="mb-2 px-4 text-lg font-semibold tracking-tight">
                    Status
                  </h3>
                  <div className="space-y-1">
                    <Button
                      variant={!searchParams.status ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="/feedback/feedback">All Statuses</Link>
                    </Button>
                    <Button
                      variant={searchParams.status === "open" ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="?status=open">
                        <Badge variant="success" className="mr-2">Open</Badge>
                        Open
                      </Link>
                    </Button>
                    <Button
                      variant={searchParams.status === "in-development" ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="?status=in-development">
                        <Badge variant="indev" className="mr-2">In Dev</Badge>
                        In Development
                      </Link>
                    </Button>
                    <Button
                      variant={searchParams.status === "completed" ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="?status=completed">
                        <Badge variant="secondary" className="mr-2">Done</Badge>
                        Completed
                      </Link>
                    </Button>
                    <Button
                      variant={searchParams.status === "closed" ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="?status=closed">
                        <Badge variant="closed" className="mr-2">Closed</Badge>
                        Closed
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Sort and filter indicators */}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                  {selectedTopic && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      Topic: {selectedTopic}
                    </Badge>
                  )}

                  {searchParams.status && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      Status: {searchParams.status.replace("-", " ")}
                    </Badge>
                  )}

                  {(selectedTopic || searchParams.status) && (
                    <Button variant="ghost" size="sm" asChild className="h-7">
                      <Link href="/feedback/feedback">Clear Filters</Link>
                    </Button>
                  )}
                </div>
                <Suspense>


                </Suspense>
              </div>

              {feedbacks.length === 0 ? (
                <div className="rounded-lg border bg-card text-card-foreground shadow-sm flex min-h-[300px] flex-col items-center justify-center p-8">
                  <div className="flex flex-col items-center justify-center space-y-4 text-center">
                    <h2 className="text-lg font-semibold">No feedback found</h2>
                    <p className="text-sm text-muted-foreground">
                      {selectedTopic || searchParams.status
                        ? "Try changing your filters or create new feedback."
                        : "Create your first feedback item to get started."}
                    </p>
                    <Button asChild>
                      <Link href="/feedback/feedback/new">
                        <PlusIcon className="mr-2 h-4 w-4" />
                        New Feedback
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                  {feedbacks.map((feedback) => (
                    <FeedbackCard key={feedback.id} feedback={feedback} />
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
