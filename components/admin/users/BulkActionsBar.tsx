// components/admin/users/BulkActionsBar.tsx
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  UserCog,
  Ban,
  ShieldCheck,
  LogOut,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import BulkRoleChangeModal from "./BulkRoleChangeModal";
import BulkBanModal from "./BulkBanModal";

interface BulkActionsBarProps {
  selectedUserIds: string[];
  onClearSelection: () => void;
}

export default function BulkActionsBar({ 
  selectedUserIds, 
  onClearSelection 
}: BulkActionsBarProps) {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  const handleRevokeSessions = async () => {
    if (!confirm(`Revoke all sessions for ${selectedUserIds.length} selected users? This will log them out of all devices.`)) {
      return;
    }
    
    setProcessing(true);
    try {
      let successCount = 0;
      
      for (const userId of selectedUserIds) {
        const { error } = await authClient.admin.revokeUserSessions({
          userId,
        });
        
        if (!error) {
          successCount++;
        }
      }
      
      if (successCount === selectedUserIds.length) {
        toast.success(`Successfully revoked all sessions for ${successCount} users`);
      } else {
        toast.warning(`Revoked sessions for ${successCount} of ${selectedUserIds.length} users`);
      }
      
      onClearSelection();
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setProcessing(false);
    }
  };
  
  const handleUnbanUsers = async () => {
    if (!confirm(`Unban ${selectedUserIds.length} selected users?`)) {
      return;
    }
    
    setProcessing(true);
    try {
      let successCount = 0;
      
      for (const userId of selectedUserIds) {
        const { error } = await authClient.admin.unbanUser({
          userId,
        });
        
        if (!error) {
          successCount++;
        }
      }
      
      if (successCount === selectedUserIds.length) {
        toast.success(`Successfully unbanned ${successCount} users`);
      } else {
        toast.warning(`Unbanned ${successCount} of ${selectedUserIds.length} users`);
      }
      
      onClearSelection();
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setProcessing(false);
    }
  };
  
  return (
    <div className="bg-muted/50 border rounded-md p-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="bg-background">
          {selectedUserIds.length} selected
        </Badge>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClearSelection}
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowRoleModal(true)}
          disabled={processing}
        >
          <UserCog className="h-4 w-4 mr-2" />
          Set Role
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowBanModal(true)}
          disabled={processing}
        >
          <Ban className="h-4 w-4 mr-2" />
          Ban Users
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleUnbanUsers}
          disabled={processing}
        >
          <ShieldCheck className="h-4 w-4 mr-2" />
          Unban Users
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleRevokeSessions}
          disabled={processing}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Revoke Sessions
        </Button>
      </div>
      
      {showRoleModal && (
        <BulkRoleChangeModal
          userIds={selectedUserIds}
          isOpen={showRoleModal}
          onClose={() => setShowRoleModal(false)}
          onSuccess={onClearSelection}
        />
      )}
      
      {showBanModal && (
        <BulkBanModal
          userIds={selectedUserIds}
          isOpen={showBanModal}
          onClose={() => setShowBanModal(false)}
          onSuccess={onClearSelection}
        />
      )}
    </div>
  );
}
