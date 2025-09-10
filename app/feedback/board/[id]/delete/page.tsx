// app/(dashboard)/feedback/board/[id]/delete/page.tsx
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

interface DeleteTaskPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DeleteTaskPage({ params }: DeleteTaskPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Only allow admins to delete tasks
  if (!session?.user || session.user.role !== "admin") {
    redirect("/feedback/board");
  }

  const task = await prisma.task.findUnique({
    where: {
      id: (await params).id,
    },
    include: {
      changelog: true,
    },
  });

  if (!task) {
    notFound();
  }

  const canDelete = !task.changelog;

  async function deleteTask() {
    "use server";

    if (!canDelete) {
      return { error: "Cannot delete task with an associated changelog" };
    }

    try {
      await prisma.task.delete({
        where: { id: (await params).id },
      });

      redirect("/feedback/board");
    } catch (error) {
      return { error: "Failed to delete task" };
    }
  }

  return (
    <SidebarWrap nav={[
      {
        title: "Feedback Dashboard",
        href: "/feedback"
      },
      {
        title: "Board",
        href: "/feedback/board"
      },
      {
        title: task.title,
        href: `/feedback/board/${(await params).id}`
      },
      {
        title: "Delete"
      }
    ]}>
      <SignedIn>
        <div className="flex flex-col gap-4 container mx-auto px-4 3xl:p-0">
          <h1 className="text-3xl font-bold tracking-tight">Delete Task</h1>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Confirm Deletion
              </CardTitle>
              <CardDescription>
                You are about to delete the task &quot;{task.title}&quot;
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!canDelete ? (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                  <p className="font-medium">This task cannot be deleted</p>
                  <p className="text-sm mt-1">
                    This task has an associated changelog entry.
                    You must delete the changelog entry before deleting this task.
                  </p>
                </div>
              ) : (
                <p>
                  This action cannot be undone. This will permanently delete the task.
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href={`/feedback/board/${(await params).id}`}>Cancel</Link>
              </Button>
              {/* @ts-ignore */}
              <form action={deleteTask}>
                <Button variant="destructive" type="submit" disabled={!canDelete}>
                  Delete Task
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div></SignedIn></SidebarWrap>
  );
}
