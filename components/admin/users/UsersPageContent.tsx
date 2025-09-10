// components/admin/users/UsersPageContent.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import UserTable from "@/components/admin/users/UserTable";
import UserTableFilters from "@/components/admin/users/UserTableFilters";
import CreateUserModal from "@/components/admin/users/CreateUserModal";
import BulkActionsBar from "@/components/admin/users/BulkActionsBar";
import { RedirectToSignIn, SignedIn, UserButton } from "@daveyplate/better-auth-ui";

export default function UsersPageContent() {
  const { data: session } = useSession();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  if (!session?.user) {
    return <RedirectToSignIn />;
  }

  // useEffect(() => {
  //   if (selectedUserIds?.includes(session.user.id)) {
  //     setSelectedUserIds((prev) => prev.filter((id) => id !== session.user.id))
  //   }
  // }, [selectedUserIds])

  return (
    <SignedIn>
      <div className="space-y-4">
        <div className="flex justify-end items-center">
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Create User
          </Button>
        </div>

        <UserTableFilters />

        {selectedUserIds.length > 0 && (
          <BulkActionsBar
            selectedUserIds={selectedUserIds}
            onClearSelection={() => setSelectedUserIds([])}
          />
        )}

        <UserTable
          selectedUserIds={selectedUserIds}
          onSelectedIdsChange={setSelectedUserIds}
          activeAdminId={session.user.id}
        />

        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </div>
    </SignedIn>
  );
}
