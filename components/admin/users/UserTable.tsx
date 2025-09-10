// components/admin/users/UserTable.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { User } from "@/lib/types/user";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import UserTableActions from "@/components/admin/users/UserTableActions";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { toast } from "sonner";

interface UserTableProps {
  selectedUserIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  activeAdminId: string
}

export default function UserTable({ selectedUserIds, onSelectedIdsChange, activeAdminId }: UserTableProps) {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchValue, setSearchValue] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      try {
        const { data, error } = await authClient.admin.listUsers({
          query: {
            limit,
            offset,
            sortBy,
            sortDirection,
            searchValue: searchValue || undefined,
            searchField: searchValue ? "name" : undefined,
            searchOperator: searchValue ? "contains" : undefined,
          },
        });

        if (error) {
          toast.error("Failed to load users");
          return;
        }
        console.log(data)
        // @ts-ignore
        setUsers(data.users);
        setTotal(data.total);
      } catch (err) {
        toast.error("An error occurred while fetching users");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [limit, offset, sortBy, sortDirection, searchValue]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectedIdsChange(users.map(user => user.id));
    } else {
      onSelectedIdsChange([]);
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    if (checked) {
      onSelectedIdsChange([...selectedUserIds, userId]);
    } else {
      onSelectedIdsChange(selectedUserIds.filter(id => id !== userId));
    }
  };

  const handleUserClick = (userId: string) => {
    if (activeAdminId !== userId) {
      router.push(`/admin/users/${userId}`);
    }
  };

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  const handlePageChange = (page: number) => {
    setOffset((page - 1) * limit);
  };

  if (loading && users.length === 0) {
    return <div className="flex justify-center p-8">Loading users...</div>;
  }


  return (
    <div className="space-y-4">
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selectedUserIds.length > 0 && selectedUserIds.length === users.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>User</TableHead>
              {/* <TableHead>Organizations</TableHead>
              <TableHead>Sessions</TableHead> */}
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {activeAdminId !== user.id && <Checkbox
                    checked={selectedUserIds.includes(user.id)}
                    onCheckedChange={(checked) => handleSelectUser(user.id, !!checked)}
                  />}
                </TableCell>
                <TableCell onClick={() => handleUserClick(user.id)} className="cursor-pointer">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.image || ""} alt={user.name} />
                      <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                </TableCell>
                {/* <TableCell>
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-xs">
                    0
                  </span>
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-xs">
                    0
                  </span>
                </TableCell> */}
                <TableCell>
                  <Badge variant={user.role === "admin" ? "default" : "outline"}>
                    {user.role || "user"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.banned ? "destructive" : "default"}>
                    {user.banned ? "Banned" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {activeAdminId !== user.id && <UserTableActions user={user} />}
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      isActive={currentPage === pageNum}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
