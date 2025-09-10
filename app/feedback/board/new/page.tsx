// app/(dashboard)/feedback/board/new/page.tsx
import { TaskForm } from "@/components/kanban/task-form";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SidebarWrap from "@/components/sidebar/sidebar-wrap";
import { SignedIn } from "@daveyplate/better-auth-ui";

interface NewTaskPageProps {
  searchParams: Promise<{
    feedback?: string;
  }>;
}

export default async function NewTaskPage({ searchParams: searchParams_0 }: NewTaskPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const searchParams = await searchParams_0


  // Only allow admins and developers to create tasks
  if (!session?.user || !["admin", "developer"].includes(session.user.role as string)) {
    redirect("/feedback/board");
  }

  // Get all feedback items that are open or in-development
  const feedbacks = await prisma.feedback.findMany({
    where: {
      status: {
        in: ["open", "in-development"],
      },
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

  // If feedback ID is provided in query params, verify it exists
  let defaultFeedbackId = undefined;

  if (searchParams.feedback) {
    const feedback = await prisma.feedback.findUnique({
      where: { id: searchParams.feedback },
    });

    if (feedback) {
      defaultFeedbackId = feedback.id;
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
        title: "New"
      }
    ]}>
      <SignedIn>
        <div className="flex flex-col gap-4 container mx-auto px-4 3xl:p-0">
          <h1 className="text-3xl font-bold tracking-tight">New Task</h1>
          <div className="max-w-2xl">
            <TaskForm
              feedbacks={feedbacks}
              users={users}
              defaultFeedbackId={defaultFeedbackId}
            />
          </div>
        </div></SignedIn></SidebarWrap>
  );
}
