// app/(dashboard)/feedback/[id]/edit/page.tsx
import { FeedbackForm } from "@/components/feedback/feedback-form";
import SidebarWrap from "@/components/sidebar/sidebar-wrap";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { SignedIn } from "@daveyplate/better-auth-ui";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

interface EditFeedbackPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditFeedbackPage({ params }: EditFeedbackPageProps) {
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
  });

  if (!feedback) {
    notFound();
  }

  // Only allow the creator or admins/developers to edit
  const isAuthorized =
    feedback.userId === session.user.id ||
    ["admin", "developer"].includes(session.user.role as string);

  if (!isAuthorized) {
    redirect("/feedback/feedback");
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
        title: feedback.title,
        href: `/feedback/feedback/${feedback.id}`
      },
      {
        title: "Update"
      },
    ]}>
      <SignedIn>
        <div className="flex flex-col gap-4 container mx-auto px-4 3xl:p-0">
          <div className="max-w-2xl">
            <FeedbackForm topics={topics} initialData={feedback} />
          </div>
        </div></SignedIn></SidebarWrap>
  );
}
