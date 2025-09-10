// app/(dashboard)/feedback/[id]/page.tsx
// Update to include task count and isDeveloper check

import { FeedbackDetail } from "@/components/feedback/feedback-detail";
import { CommentSection } from "@/components/feedback/comment-section";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { Separator } from "@/components/ui/separator";
import SidebarWrap from "@/components/sidebar/sidebar-wrap";
import { SignedIn } from "@daveyplate/better-auth-ui";

interface FeedbackPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const feedback = await prisma.feedback.findUnique({
    where: {
      id: (await params).id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
      topic: true,
      comments: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      },
      _count: {
        select: {
          upvotes: true,
          tasks: true,
        },
      },
    },
  });

  if (!feedback) {
    notFound();
  }

  const isAuthor = session?.user?.id === feedback.userId;
  const isAdmin = session?.user?.role === "admin";
  const isDeveloper = session?.user?.role === "developer";

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
        title: feedback.title
      },
    ]}>
      <SignedIn>
        <div className="flex flex-col gap-6 container mx-auto px-3 3xl:p-0">


          <FeedbackDetail
            feedback={feedback}
            isAuthor={isAuthor}
            isAdmin={isAdmin}
            isDeveloper={isDeveloper}
          />

          <Separator />

          <CommentSection
            feedbackId={feedback.id}
            initialComments={feedback.comments}
            isAuthorized={isAuthor || isAdmin}
          />
        </div>
      </SignedIn>
    </SidebarWrap>
  );
}
