// components/admin/users/UserDetailContent.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { User } from "@/lib/types/user";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ArrowLeft,
  Shield,
  UserCog,
  Key,
  Ban,
  UserMinus,
  User as UserIcon,
  LogOut,
  Mail,
  Calendar,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import BanUserModal from "./BanUserModal";
import ChangeRoleModal from "./ChangeRoleModal";
import SessionsModal from "./SessionsModal";
import OrganizationsModal from "./OrganizationsModal";
import UserPasswordModal from "./UserPasswordModal";
import { RedirectToSignIn, SignedIn } from "@daveyplate/better-auth-ui";
import { useSession } from "@/lib/auth-client";
import UserDetailSkeleton from "./UserDetailSkeleton";
import SessionsWithoutModal from "./SessionsWithoutModel";
import OrganizationsWithoutModal from "./OrganizationsWithoutModal";

interface UserDetailContentProps {
  userId: string;
}

export default function UserDetailContent({ userId }: UserDetailContentProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSessionsModal, setShowSessionsModal] = useState(false);
  const [showOrgsModal, setShowOrgsModal] = useState(false);

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      // In a real application, you would have an API endpoint to fetch a single user
      // For now, we'll use the list endpoint and filter
      const { data, error } = await authClient.admin.listUsers({
        query: {
          filterField: "id",
          filterValue: userId,
          filterOperator: "eq",
        },
      });

      if (error || !data.users.length) {
        toast.error("Failed to load user details");
        router.push("/admin/users");
        return;
      }
      // @ts-ignore
      setUser(data.users[0]);
    } catch (err) {
      toast.error("An error occurred");
      router.push("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonateUser = async () => {
    if (!user) return;

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
    if (!user) return;

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
      router.push("/admin/users");
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  const handleRevokeSessions = async () => {
    if (!user) return;

    if (!confirm(`Revoke all sessions for ${user.name}? This will log them out of all devices.`)) {
      return;
    }

    try {
      const { error } = await authClient.admin.revokeUserSessions({
        userId: user.id,
      });

      if (error) {
        toast.error("Failed to revoke sessions");
        return;
      }

      toast.success("All sessions revoked successfully");
    } catch (err) {
      toast.error("An error occurred");
    }
  };

  if (!session?.user) {
    return <RedirectToSignIn />;
  }

  if (loading || !user) {
    return <UserDetailSkeleton />;
  }

  const formattedCreatedAt = format(new Date(user.createdAt), "PPP");
  const formattedUpdatedAt = format(new Date(user.updatedAt), "PPP");

  return (
    <div className="">
      <div className="flex flex-col gap-4">
        {/* User Profile Sidebar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.image || ""} alt={user.name} />
                <AvatarFallback className="text-lg">
                  {user.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <h2 className="mt-4 text-xl font-semibold">{user.name}</h2>
              <p className="text-muted-foreground">{user.email}</p>

              <div className="mt-2 flex gap-2">
                <Badge variant={user.role === "admin" ? "default" : "outline"}>
                  {user.role || "user"}
                </Badge>
                <Badge variant={user.banned ? "destructive" : "default"}>
                  {user.banned ? "Banned" : "Active"}
                </Badge>
              </div>

              <div className="mt-4 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleImpersonateUser}
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Impersonate
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemoveUser}
                >
                  <UserMinus className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
            </div>

            <Separator className="my-6" />

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{formattedCreatedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Updated</span>
                <span>{formattedUpdatedAt}</span>
              </div>
              {user.banned && user.banExpiresAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ban Expires</span>
                  <span>{format(new Date(user.banExpiresAt), "PPP")}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>


        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Manage user account settings and permissions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => setShowRoleModal(true)}
              >
                <UserCog className="h-4 w-4 mr-2" />
                Change Role
              </Button>

              <Button
                variant="outline"
                className="justify-start"
                onClick={() => setShowPasswordModal(true)}
              >
                <Key className="h-4 w-4 mr-2" />
                Set Password
              </Button>

              <Button
                variant="outline"
                className="justify-start"
                onClick={() => setShowBanModal(true)}
              >
                {user.banned ? (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    Unban User
                  </>
                ) : (
                  <>
                    <Ban className="h-4 w-4 mr-2" />
                    Ban User
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                className="justify-start"
                onClick={handleRevokeSessions}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Revoke All Sessions
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="details">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="sessions" >
              Sessions
            </TabsTrigger>
            <TabsTrigger value="organizations" >
              Organizations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
                <CardDescription>
                  Basic user account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Name
                    </label>
                    <Input value={user.name} readOnly />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <Input value={user.email} readOnly />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Role
                    </label>
                    <Input value={user.role || "user"} readOnly />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Status
                    </label>
                    <Select defaultValue={user.banned ? "banned" : "active"} disabled>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="banned">Banned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {user.banned && user.banReason && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Ban Reason
                    </label>
                    <Input value={user.banReason} readOnly />
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="sessions">
            <SessionsWithoutModal user={user} />
          </TabsContent>
          <TabsContent value="organizations">
            <OrganizationsWithoutModal user={user} />
          </TabsContent>
        </Tabs>

      </div>

      {showBanModal && (
        <BanUserModal
          user={user}
          isOpen={showBanModal}
          onClose={() => {
            setShowBanModal(false);
            fetchUser();
          }}
        />
      )}

      {showRoleModal && (
        <ChangeRoleModal
          user={user}
          isOpen={showRoleModal}
          onClose={() => {
            setShowRoleModal(false);
            fetchUser();
          }}
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
    </div>
  );
}
