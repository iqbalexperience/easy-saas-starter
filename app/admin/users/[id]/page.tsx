// app/admin/users/[id]/page.tsx
import { Suspense } from "react";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import UserDetailContent from "@/components/admin/users/UserDetailContent";
import UserDetailSkeleton from "@/components/admin/users/UserDetailSkeleton";
import { Toaster } from "@/components/ui/sonner";
import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import { notFound } from "next/navigation";
import SidebarWrap from "@/components/sidebar/sidebar-wrap";

export const metadata: Metadata = {
  title: "User Details | Admin Dashboard",
  description: "View and manage user details",
};

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user.id) {
    return <RedirectToSignIn />;
  }

  if (session.user.role !== "admin") {
    return notFound();
  }

  return (
    <SidebarWrap nav={[
      {
        title: "Manage Platform Users",
        href: "/admin/users"
      },
      {
        title: (await params).id
      }
    ]}>
      <div className="p-2">
        <SignedIn>
          <Suspense fallback={<UserDetailSkeleton />}>
            <UserDetailContent userId={(await params).id} />
          </Suspense>
        </SignedIn></div>
    </SidebarWrap>
  );
}
