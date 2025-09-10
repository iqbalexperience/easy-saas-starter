// components/admin/users/UserTableActions.tsx
"use client";

import { useState } from "react";
import { User } from "@/lib/types/user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  UserCog,
  Key,
  Ban,
  UserMinus,
  User as UserIcon,
  Users
} from "lucide-react";
import BanUserModal from "./BanUserModal";
import ChangeRoleModal from "./ChangeRoleModal";
import SessionsModal from "./SessionsModal";
import OrganizationsModal from "./OrganizationsModal";
import UserPasswordModal from "./UserPasswordModal";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface UserTableActionsProps {
  user: User;
}

export default function UserTableActions({ user }: UserTableActionsProps) {
  const [showBanModal, setShowBanModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showOrgsModal, setShowOrgsModal] = useState(false);

  const handleImpersonateUser = async () => {
    try {
      const { error } = await authClient.admin.impersonateUser({
        userId: user.id,
      });

      if (error) {
        toast.error("Failed to impersonate user");
        return;
      }

      toast.success(`Now impersonating ${user.name}`);
      window.location.href = "/";
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleRemoveUser = async () => {
    if (!confirm(`Are you sure you want to permanently delete ${user.name}?`)) {
      return;
    }

    try {
      const { error } = await authClient.admin.removeUser({
        userId: user.id,
      });

      if (error) {
        toast.error("Failed to remove user");
        return;
      }

      toast.success(`User ${user.name} has been removed`);
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setShowRoleModal(true)}>
            <UserCog className="mr-2 h-4 w-4" />
            <span>Change Role</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowPasswordModal(true)}>
            <Key className="mr-2 h-4 w-4" />
            <span>Set Password</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowBanModal(true)}>
            <Ban className="mr-2 h-4 w-4" />
            <span>{user.banned ? "Unban User" : "Ban User"}</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={() => setShowSessionsModal(true)}>
            <Users className="mr-2 h-4 w-4" />
            <span>Manage Sessions</span>
          </DropdownMenuItem>

          {/* <DropdownMenuItem onClick={() => setShowOrgsModal(true)}>
            <Users className="mr-2 h-4 w-4" />
            <span>Organizations</span>
          </DropdownMenuItem> */}

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={handleImpersonateUser}>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Impersonate User</span>
          </DropdownMenuItem>

          <DropdownMenuItem onClick={handleRemoveUser} className="text-destructive">
            <UserMinus className="mr-2 h-4 w-4" />
            <span>Remove User</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {showBanModal && (
        <BanUserModal
          user={user}
          isOpen={showBanModal}
          onClose={() => setShowBanModal(false)}
        />
      )}

      {showRoleModal && (
        <ChangeRoleModal
          user={user}
          isOpen={showRoleModal}
          onClose={() => setShowRoleModal(false)}
        />
      )}

      {showPasswordModal && (
        <UserPasswordModal
          user={user}
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      {showSessionsModal && (
        <SessionsModal
          user={user}
          isOpen={showSessionsModal}
          onClose={() => setShowSessionsModal(false)}
        />
      )}

      {showOrgsModal && (
        <OrganizationsModal
          user={user}
          isOpen={showOrgsModal}
          onClose={() => setShowOrgsModal(false)}
        />
      )}
    </>
  );
}
