// app/(dashboard)/feedback/feedback/new/page.tsx
import { FeedbackForm } from "@/components/feedback/feedback-form";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import SidebarWrap from "@/components/sidebar/sidebar-wrap";
import { SignedIn } from "@daveyplate/better-auth-ui";

export default async function NewFeedbackPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  const topics = await prisma.topic.findMany({
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
        title: "Feedbacks",
        href: "/feedback/feedback"
      },
      {
        title: "New"
      }
    ]}>
      <SignedIn>
        <div className="flex flex-col gap-4 container mx-auto px-4 3xl:p-0">
          <div className="max-w-2xl">
            <FeedbackForm topics={topics} />
          </div>
        </div></SignedIn></SidebarWrap>
  );
}
