// app/(dashboard)/feedback/changelog/new/page.tsx
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SidebarWrap from "@/components/sidebar/sidebar-wrap";
import { SignedIn } from "@daveyplate/better-auth-ui";
import { ChangelogForm } from "@/components/changelog/changelog-form";

interface NewChangelogPageProps {
  searchParams: Promise<{
    task?: string;
  }>;
}

export default async function NewChangelogPage({ searchParams: searchParams_0 }: NewChangelogPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const searchParams = await searchParams_0

  // Only allow admins and developers to create changelogs
  if (!session?.user || !["admin", "developer"].includes(session.user.role as string)) {
    redirect("/feedback/changelog");
  }

  // Get all completed tasks without a changelog
  const tasks = await prisma.task.findMany({
    where: {
      status: "completed",
      changelog: null,
    },
    select: {
      id: true,
      title: true,
      status: true,
      changelog: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
  const tasks_1 = tasks?.map((t) => {
    return {
      ...t,
      changelog: undefined,
      hasChangelog: !!t.changelog
    }
  })

  if (tasks.length === 0) {
    redirect("/feedback/board");
  }

  // If task ID is provided in query params, verify it exists
  let defaultTaskId = undefined;

  if (searchParams.task) {
    const task = await prisma.task.findUnique({
      where: {
        id: searchParams.task,
        status: "completed",
        changelog: null,
      },
    });

    if (task) {
      defaultTaskId = task.id;
    }
  }

  return (<SidebarWrap nav={[
    {
      title: "Feedback Dashboard",
      href: "/feedback"
    },
    {
      title: "Changelog",
      href: "/feedback/changelog"
    },
    {
      title: "New"
    }
  ]}>
    <SignedIn>
      <div className="flex flex-col gap-4 container mx-auto px-4 3xl:p-0">
        <h1 className="text-3xl font-bold tracking-tight">New Changelog Entry</h1>
        <div className="max-w-2xl">
          <ChangelogForm
            tasks={tasks_1}
            defaultTaskId={defaultTaskId}
          />
        </div>
      </div></SignedIn></SidebarWrap>
  );
}
