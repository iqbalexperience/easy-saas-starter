// app/(dashboard)/topics/page.tsx
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { PlusIcon, Pencil, Trash2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import * as LucideIcons from "lucide-react";
import SidebarWrap from "@/components/sidebar/sidebar-wrap";
import { SignedIn } from "@daveyplate/better-auth-ui";

export default async function TopicsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

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

  // Get Lucide icon component if available
  const getIconComponent = (iconName?: string | null) => {
    if (!iconName) return null;

    // @ts-ignore - Lucide icons have a dynamic structure
    const IconComponent = LucideIcons[iconName];
    return IconComponent || null;
  };

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
            <h1 className="text-3xl font-bold tracking-tight">Topics</h1>
            <Button asChild>
              <Link href="/feedback/topics/new">
                <PlusIcon className="mr-2 h-4 w-4" />
                New Topic
              </Link>
            </Button>
          </div>

          {topics.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-[300px] flex-col items-center justify-center p-8">
                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                  <AlertCircle className="h-10 w-10 text-muted-foreground" />
                  <h2 className="text-lg font-semibold">No topics found</h2>
                  <p className="text-sm text-muted-foreground">
                    Create your first topic to start organizing feedback.
                  </p>
                  <Button asChild>
                    <Link href="/feedback/topics/new">
                      <PlusIcon className="mr-2 h-4 w-4" />
                      New Topic
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topics.map((topic) => {
                const IconComponent = getIconComponent(topic.icon);

                return (
                  <Card key={topic.id}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <div className="flex items-center">
                        {IconComponent && (
                          <IconComponent
                            className="mr-2 h-5 w-5"
                            style={{ color: topic.color }}
                          />
                        )}
                        <CardTitle className="text-md font-medium">
                          {topic.name}
                        </CardTitle>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/feedback/topics/${topic.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={topic._count.feedbacks > 0}
                          asChild
                        >
                          <Link href={`/feedback/topics/${topic.id}/delete`}>
                            <Trash2 className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {topic.description && (
                        <CardDescription className="mt-2">
                          {topic.description}
                        </CardDescription>
                      )}
                      <div className="mt-4 flex items-center justify-between">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: topic.color }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {topic._count.feedbacks} feedback items
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </SignedIn>
    </SidebarWrap>
  );
}
