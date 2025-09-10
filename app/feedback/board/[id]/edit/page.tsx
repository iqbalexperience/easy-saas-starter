// app/(dashboard)/feedback/board/[id]/edit/page.tsx
import { TaskForm } from "@/components/kanban/task-form";
import SidebarWrap from "@/components/sidebar/sidebar-wrap";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { SignedIn } from "@daveyplate/better-auth-ui";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

interface EditTaskPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Only allow admins and developers to edit tasks
  if (!session?.user || !["admin", "developer"].includes(session.user.role as string)) {
    redirect("/feedback/board");
  }

  const task: any = await prisma.task.findUnique({
    where: {
      id: (await params).id,
    },
  });

  if (!task) {
    notFound();
  }

  // Get all feedback items that are open or in-development
  const feedbacks = await prisma.feedback.findMany({
    where: {
      OR: [
        { status: { in: ["open", "in-development"] } },
        { id: task.feedbackId }, // Always include the current feedback
      ]
    },
    select: {
      id: true,
      title: true,
      topic: {
        select: {
          name: true,
          color: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get all users who are admins or developers
  const users = await prisma.user.findMany({
    where: {
      role: {
        in: ["admin", "developer"],
      },
    },
    select: {
      id: true,
      name: true,
      image: true,
    },
    orderBy: {
      name: "asc",
    },
  });

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
        title: "Update"

      }
    ]}>
      <SignedIn>
        <div className="flex flex-col gap-4 container mx-auto px-4 3xl:p-0">
          <h1 className="text-3xl font-bold tracking-tight">Edit Task</h1>
          <div className="max-w-2xl">
            <TaskForm
              feedbacks={feedbacks}
              users={users}
              initialData={task}
            />
          </div>
        </div></SignedIn></SidebarWrap>
  );
}
