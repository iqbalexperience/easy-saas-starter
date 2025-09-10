// app/(dashboard)/topics/new/page.tsx
import SidebarWrap from "@/components/sidebar/sidebar-wrap";
import { TopicForm } from "@/components/topics/topic-form";
import { auth } from "@/lib/auth";
import { SignedIn } from "@daveyplate/better-auth-ui";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function NewTopicPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
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
        title: "New"
      },
    ]}>
      <SignedIn>
        <div className="flex flex-col gap-4 container mx-auto px-4 3xl:p-0">
          <h1 className="text-3xl font-bold tracking-tight">New Topic</h1>
          <div className="max-w-2xl">
            <TopicForm />
          </div>
        </div>
      </SignedIn>
    </SidebarWrap>
  );
}
