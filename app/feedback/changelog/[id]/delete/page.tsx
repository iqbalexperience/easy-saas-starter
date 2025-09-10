// app/(dashboard)/feedback/changelog/[id]/delete/page.tsx
import SidebarWrap from "@/components/sidebar/sidebar-wrap";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { SignedIn } from "@daveyplate/better-auth-ui";
import { AlertTriangle } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

interface DeleteChangelogPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DeleteChangelogPage({ params }: DeleteChangelogPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Only allow admins to delete changelogs
  if (!session?.user || session.user.role !== "admin") {
    redirect("/feedback/changelog");
  }

  const changelog = await prisma.changelog.findUnique({
    where: {
      id: (await params).id,
    },
    include: {
      task: {
        select: {
          title: true,
        },
      },
    },
  });

  if (!changelog) {
    notFound();
  }

  async function deleteChangelog() {
    "use server";

    try {
      await prisma.changelog.delete({
        where: { id: (await params).id },
      });

      redirect("/feedback/changelog");
    } catch (error) {
      return { error: "Failed to delete changelog entry" };
    }
  }

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
        title: "Delete"
      }
    ]}>
      <SignedIn>
        <div className="flex flex-col gap-4 container mx-auto px-4 3xl:p-0">
          <h1 className="text-3xl font-bold tracking-tight">Delete Changelog Entry</h1>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Confirm Deletion
              </CardTitle>
              <CardDescription>
                You are about to delete the changelog entry &quot;{changelog.title}&quot;
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                This action cannot be undone. This will permanently delete the changelog entry
                for task &quot;{changelog.task.title}&quot;.
              </p>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" asChild>
                <Link href={`/feedback/changelog/${(await params).id}`}>Cancel</Link>
              </Button>
              {/* @ts-ignore */}
              <form action={deleteChangelog}>
                <Button variant="destructive" type="submit">
                  Delete Changelog
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div></SignedIn></SidebarWrap>
  );
}
