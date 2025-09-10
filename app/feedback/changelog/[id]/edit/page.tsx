// app/(dashboard)/feedback/changelog/[id]/edit/page.tsx
import { ChangelogForm } from "@/components/changelog/changelog-form";
import SidebarWrap from "@/components/sidebar/sidebar-wrap";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { SignedIn } from "@daveyplate/better-auth-ui";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

interface EditChangelogPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditChangelogPage({ params: params_0 }: EditChangelogPageProps) {
  const params = await params_0

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Only allow admins and developers to edit changelogs
  if (!session?.user || !["admin", "developer"].includes(session.user.role as string)) {
    redirect("/feedback/feedback/changelog");
  }

  const changelog = await prisma.changelog.findUnique({
    where: {
      id: (await params).id,
    },
  });

  if (!changelog) {
    notFound();
  }

  // Get all completed tasks
  const tasks = await prisma.task.findMany({
    where: {
      status: "completed",
      OR: [
        { changelog: null },
        { id: changelog.taskId }, // Always include the current task
      ]
    },
    select: {
      id: true,
      title: true,
      status: true,
      changelog: {
        select: {
          id: true
        }
      }
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // Transform the tasks to match the expected format
  const formattedTasks = tasks.map(task => ({
    id: task.id,
    title: task.title,
    status: task.status,
    hasChangelog: !!task.changelog && task.id !== changelog.taskId,
  }));

  return (
    <SidebarWrap nav={[
      {
        title: "Feedback Dashboard",
        href: "/feedback"
      },
      {
        title: "Changelogs",
        href: "/feedback/changelog"
      },
      {
        title: changelog.title,
        href: `/feedback/changelog/${changelog.id}`
      },
      {
        title: "Update"
      }
    ]}>
      <SignedIn>
        <div className="flex flex-col gap-4 container mx-auto px-4 3xl:p-0">
          <h1 className="text-3xl font-bold tracking-tight">Edit Changelog Entry</h1>
          <div className="max-w-2xl">
            <ChangelogForm
              tasks={formattedTasks}
              initialData={changelog}
            />
          </div>
        </div></SignedIn>
    </SidebarWrap>
  );
}
