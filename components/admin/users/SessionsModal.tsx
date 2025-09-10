// components/admin/users/SessionsModal.tsx
"use client";

import { useState, useEffect } from "react";
import { User } from "@/lib/types/user";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw, Trash2 } from "lucide-react";

interface Session {
  id: string;
  sessionToken: string;
  userId: string;
  expires: string;
  userAgent?: string;
  ip?: string;
  lastUsed?: string;
  createdAt?: string;
}

interface SessionsModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export default function SessionsModal({ user, isOpen, onClose }: SessionsModalProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const { data, error } = await authClient.admin.listUserSessions({
        userId: user.id,
      });

      if (error) {
        toast.error("Failed to load sessions");
        return;
      }
      // @ts-ignore
      setSessions(data.sessions);
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionToken: string) => {
    try {
      const { error } = await authClient.admin.revokeUserSession({
        sessionToken,
      });

      if (error) {
        toast.error("Failed to revoke session");
        return;
      }

      toast.success("Session revoked");
      fetchSessions();
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!confirm("Are you sure you want to revoke all sessions? This will log the user out of all devices.")) {
      return;
    }

    setRevoking(true);
    try {
      const { error } = await authClient.admin.revokeUserSessions({
        userId: user.id,
      });

      if (error) {
        toast.error("Failed to revoke all sessions");
        return;
      }

      toast.success("All sessions revoked");
      fetchSessions();
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setRevoking(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>User Sessions</DialogTitle>
          <DialogDescription>
            Manage active sessions for {user.name}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-muted-foreground">
            {sessions.length} active session(s)
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchSessions}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleRevokeAllSessions}
              disabled={revoking || sessions.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Revoke All
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            No active sessions found.
          </div>
        ) : (
          <div className="border rounded-md max-h-[400px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device/Browser</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell>{session.userAgent || "Unknown"}</TableCell>
                    <TableCell>{formatDate(session.lastUsed)}</TableCell>
                    <TableCell>{formatDate(session.createdAt)}</TableCell>
                    <TableCell>{formatDate(session.expires)}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSession(session.sessionToken)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
