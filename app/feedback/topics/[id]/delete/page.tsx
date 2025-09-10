// app/(dashboard)/topics/[id]/delete/page.tsx
import SidebarWrap from "@/components/sidebar/sidebar-wrap";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { SignedIn } from "@daveyplate/better-auth-ui";
import { AlertTriangle } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface DeleteTopicPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DeleteTopicPage({ params }: DeleteTopicPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  const topic = await prisma.topic.findUnique({
    where: {
      id: (await params).id,
    },
    include: {
      _count: {
        select: {
          feedbacks: true,
        },
      },
    },
  });

  if (!topic) {
    notFound();
  }

  const canDelete = topic._count.feedbacks === 0;

  async function deleteTopic() {
    "use server";

    if (!canDelete) {
      return { error: "Cannot delete topic with associated feedback" };
    }

    try {
      await prisma.topic.delete({
        where: { id: (await params).id },
      });

      redirect("/feedback/topics");
    } catch (error) {
      return { error: "Failed to delete topic" };
    }
  }

  return (
    <SidebarWrap nav={[
      {
        title: "Feedback Dashboard",
        href: "/feedback"
      },
      {
        title: "Topics",
        href: "/feedback/topics"
      },
      {
        title: topic?.name
      },
    ]}>
      <SignedIn>
        <div className="flex flex-col gap-4 container mx-auto px-4 3xl:p-0">
          <h1 className="text-3xl font-bold tracking-tight">Delete Topic</h1>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Confirm Deletion
              </CardTitle>
              <CardDescription>
                You are about to delete the topic &quot;{topic.name}&quot;
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!canDelete ? (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                  <p className="font-medium">This topic cannot be deleted</p>
                  <p className="text-sm mt-1">
                    There are {topic._count.feedbacks} feedback items associated with this topic.
                    You must reassign or delete these items before deleting this topic.
                  </p>
                </div>
              ) : (
                <p>
                  This action cannot be undone. This will permanently delete the topic
                  &quot;{topic.name}&quot;.
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href="/feedback/topics">Cancel</Link>
              </Button>
              {/* @ts-ignore */}
              <form action={deleteTopic}>
                <Button variant="destructive" type="submit" disabled={!canDelete}>
                  Delete Topic
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      </SignedIn>
    </SidebarWrap>
  );
}
