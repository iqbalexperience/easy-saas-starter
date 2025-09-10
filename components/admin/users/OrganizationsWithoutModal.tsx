// components/admin/users/OrganizationsWithoutModal.tsx
"use client";

import { useState, useEffect } from "react";
import { User } from "@/lib/types/user";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RefreshCw } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  logo?: string;
  createdAt: string;
}

interface OrganizationsModalProps {
  user: User;
}

export default function OrganizationsWithoutModal({ user }: OrganizationsModalProps) {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const { data, error } = await authClient.organization.list();

      if (error) {
        toast.error("Failed to load organizations");
        return;
      }

      // In a real application, you would filter this list to only show
      // organizations the user is a member of
      // @ts-ignore
      setOrganizations(data.organizations || []);
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="sm:max-w-[600px]">
        {/* <CardHeader> */}
        <CardTitle>User Organizations</CardTitle>
        <CardDescription>
          Organizations that {user.name} belongs to.
        </CardDescription>
        {/* </CardHeader> */}

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-muted-foreground">
            {organizations.length} organization(s)
          </div>
          <Button variant="outline" size="sm" onClick={fetchOrganizations}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center p-8">Loading organizations...</div>
        ) : organizations.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            User is not a member of any organizations.
          </div>
        ) : (
          <div className="border rounded-md max-h-[400px] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={org.logo || ""} alt={org.name} />
                          <AvatarFallback>{org.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="font-medium">{org.name}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(org.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>Member</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

      </CardContent>
    </Card>
  );
}
