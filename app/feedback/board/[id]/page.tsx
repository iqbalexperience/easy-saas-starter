// app/(dashboard)/feedback/board/[id]/page.tsx
// Update to include changelog information

import { TaskDetail } from "@/components/kanban/task-detail";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { SignedIn } from "@daveyplate/better-auth-ui";
import SidebarWrap from "@/components/sidebar/sidebar-wrap";

interface TaskPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function TaskPage({ params }: TaskPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const task = await prisma.task.findUnique({
    where: {
      id: (await params).id,
    },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
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
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
      changelog: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!task) {
    notFound();
  }

  // Check if user is admin or developer
  const isAuthorized = !!session?.user && ["admin", "developer"].includes(session.user.role as string);

  // Only admins can delete
  const canDelete = session?.user?.role === "admin";

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
        title: task.title
      }
    ]}>
      <SignedIn>
        <div className="flex flex-col gap-6 px-4 3xl:p-0 container mx-auto">
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/feedback/board">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Board
              </Link>
            </Button>

          </div>

          <TaskDetail
            task={task}
            isAuthorized={isAuthorized}
            canDelete={canDelete}
          />
        </div></SignedIn></SidebarWrap>
  );
}
