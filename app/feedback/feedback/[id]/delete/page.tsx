// app/(dashboard)/feedback/[id]/delete/page.tsx
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

interface DeleteFeedbackPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DeleteFeedbackPage({ params }: DeleteFeedbackPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const feedback = await prisma.feedback.findUnique({
    where: {
      id: (await params).id,
    },
    include: {
      _count: {
        select: {
          tasks: true,
        },
      },
    },
  });

  if (!feedback) {
    notFound();
  }

  // Only allow the creator or admins to delete
  const isAuthorized =
    feedback.userId === session.user.id ||
    session.user.role === "admin";

  if (!isAuthorized) {
    redirect("/feedback/feedback");
  }

  const canDelete = feedback._count.tasks === 0;

  async function deleteFeedback() {
    "use server";

    if (!canDelete) {
      return { error: "Cannot delete feedback with associated tasks" };
    }

    try {
      // Delete related comments and upvotes first
      await prisma.comment.deleteMany({
        where: { feedbackId: (await params).id },
      });

      await prisma.upvote.deleteMany({
        where: { feedbackId: (await params).id },
      });

      // Then delete the feedback
      await prisma.feedback.delete({
        where: { id: (await params).id },
      });

      redirect("/feedback/feedback");
    } catch (error) {
      return { error: "Failed to delete feedback" };
    }
  }

  return (
    <SidebarWrap nav={[
      {
        title: "Feedback Dashboard",
        href: "/feedback"
      },
      {
        title: "Feedbacks",
        href: "/feedback/feedback"
      },
      {
        title: feedback.title,
        href: `/feedback/feedback/${feedback.id}`
      },
      {
        title: "Delete"
      }
    ]}>
      <SignedIn>
        <div className="flex flex-col gap-4 container mx-auto px-4 3xl:p-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Confirm Deletion
              </CardTitle>
              <CardDescription>
                You are about to delete the feedback &quot;{feedback.title}&quot;
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!canDelete ? (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md">
                  <p className="font-medium">This feedback cannot be deleted</p>
                  <p className="text-sm mt-1">
                    There are tasks associated with this feedback.
                    You must delete these tasks before deleting this feedback.
                  </p>
                </div>
              ) : (
                <p>
                  This action cannot be undone. This will permanently delete the feedback
                  and all associated comments and upvotes.
                </p>
              )}
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href={`/feedback/feedback/${(await params).id}`}>Cancel</Link>
              </Button>
              {/* @ts-ignore */}
              <form action={deleteFeedback}>
                <Button variant="destructive" type="submit" disabled={!canDelete}>
                  Delete Feedback
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      </SignedIn></SidebarWrap>
  );
}
