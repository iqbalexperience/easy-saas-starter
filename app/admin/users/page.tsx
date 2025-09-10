// app/admin/users/page.tsx
import { Suspense } from "react";
import { Metadata } from "next";
import UsersPageContent from "@/components/admin/users/UsersPageContent";
import UsersPageSkeleton from "@/components/admin/users/UsersPageSkeleton";
import SidebarWrap from "@/components/sidebar/sidebar-wrap";
import { RedirectToSignIn } from "@daveyplate/better-auth-ui";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";


export const metadata: Metadata = {
  title: "User Management | Admin Dashboard",
  description: "Manage users and their permissions",
};

export default async function UsersPage() {
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
        title: "Manage Platform Users"
      },
    ]}>
      <div className="container mx-auto p-2">
        <Suspense fallback={<UsersPageSkeleton />}>
          <UsersPageContent />
        </Suspense>
      </div></SidebarWrap>
  );
}
