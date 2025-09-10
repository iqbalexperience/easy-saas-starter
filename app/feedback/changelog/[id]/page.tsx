// app/(dashboard)/feedback/changelog/[id]/page.tsx
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import SidebarWrap from "@/components/sidebar/sidebar-wrap";
import { SignedIn } from "@daveyplate/better-auth-ui";
import { ChangelogEntry } from "@/components/changelog/changelog-entry";

interface ChangelogPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChangelogDetailPage({ params }: ChangelogPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const changelog = await prisma.changelog.findUnique({
    where: {
      id: (await params).id,
    },
    include: {
      task: {
        select: {
          id: true,
          title: true,
          creator: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },
      feedback: {
        select: {
          id: true,
          title: true,
          topic: true,
        },
      },
    },
  });

  if (!changelog) {
    notFound();
  }

  // Check if user is admin or developer
  const isAuthorized = !!session?.user && ["admin", "developer"].includes(session.user.role as string);

  // Only admins can delete
  const canDelete = session?.user?.role === "admin";

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
        title: changelog.title
      }
    ]}>
      <SignedIn>
        <div className="flex flex-col gap-6 container mx-auto px-4 3xl:p-0">
          <div className="flex justify-between items-center">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/feedback/changelog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Changelog
              </Link>
            </Button>
            {canDelete && (
              <Button variant="destructive" size="sm" asChild>
                <Link href={`/feedback/changelog/${changelog.id}/delete`}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Link>
              </Button>
            )}
          </div>

          <ChangelogEntry
            changelog={changelog}
            isAuthorized={isAuthorized}
          />
        </div>
      </SignedIn>
    </SidebarWrap>
  );
}
