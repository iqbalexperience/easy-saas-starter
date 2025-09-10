// app/(dashboard)/feedback/board/page.tsx
import { Button } from "@/components/ui/button";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { PlusIcon } from "lucide-react";
import Link from "next/link";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import SidebarWrap from "@/components/sidebar/sidebar-wrap";
import { SignedIn } from "@daveyplate/better-auth-ui";

export default async function BoardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Check if user is admin or developer
  const isAuthorized = session?.user && ["admin", "developer"].includes(session.user.role as string);

  // Get all tasks
  const tasks = await prisma.task.findMany({
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
          _count: {
            select: {
              upvotes: true,
              comments: true,
            },
          }
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
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
      }
    ]}>
      <SignedIn>
        <div className="flex flex-col gap-4 container mx-auto px-4 3xl:p-0">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Kanban Board</h1>
            {isAuthorized && (
              <Button asChild>
                <Link href="/feedback/board/new">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  New Task
                </Link>
              </Button>
            )}
          </div>

          {tasks.length === 0 ? (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm flex min-h-[400px] flex-col items-center justify-center p-8">
              <div className="flex flex-col items-center justify-center space-y-4 text-center">
                <h2 className="text-lg font-semibold">No tasks yet</h2>
                <p className="text-sm text-muted-foreground">
                  Convert feedback to tasks or create new tasks directly.
                </p>
                {isAuthorized && (
                  <Button asChild>
                    <Link href="/board/new">
                      <PlusIcon className="mr-2 h-4 w-4" />
                      New Task
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto pb-4">
              <KanbanBoard initialTasks={tasks} />
            </div>
          )}
        </div>
      </SignedIn>
    </SidebarWrap>
  );
}
