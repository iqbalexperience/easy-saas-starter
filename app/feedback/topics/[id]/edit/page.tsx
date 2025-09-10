// app/(dashboard)/topics/[id]/edit/page.tsx
import SidebarWrap from "@/components/sidebar/sidebar-wrap";
import { TopicForm } from "@/components/topics/topic-form";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { SignedIn } from "@daveyplate/better-auth-ui";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

interface EditTopicPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTopicPage({ params }: EditTopicPageProps) {
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
  });

  if (!topic) {
    notFound();
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
          <h1 className="text-3xl font-bold tracking-tight">Edit Topic</h1>
          <div className="max-w-2xl">
            {/* @ts-ignore */}
            <TopicForm initialData={topic} />
          </div>
        </div>
      </SignedIn>
    </SidebarWrap>
  );
}
