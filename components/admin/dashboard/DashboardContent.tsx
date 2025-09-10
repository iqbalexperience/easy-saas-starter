// components/admin/dashboard/DashboardContent.tsx
"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from "recharts";
import {
  ChevronUp,
  ChevronDown,
  Users,
  Shield,
  Mail,
  Key,
  Activity,
  Calendar,
  ArrowRight,
  Search,
  Building,
  Smartphone,
  Laptop,
  TabletSmartphone
} from "lucide-react";
import { formatDistanceToNow, format, subDays, startOfDay, endOfDay, parseISO } from "date-fns";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { cn } from "@/lib/utils";
import { UserButton } from "@daveyplate/better-auth-ui";

// Define the types for our data
interface User {
  id?: string;
  createdAt: string;
  banned: boolean;
  emailVerified: boolean | null;
  role: string | null;
  sessions: { userAgent: string | null }[];
  accounts: { providerId: string }[];
  _count: { apikey: number };
}

interface Organization {
  id?: string;
  name: string;
  createdAt: string;
  members: { role: string }[];
  invitations: { status: string }[];
}

interface DashboardData {
  users: User[];
  orgs: Organization[];
}

// Helper functions
function getGrowthColor(growth: number): string {
  return growth >= 0 ? "text-emerald-500 dark:text-emerald-400" : "text-destructive";
}

function getGrowthIcon(growth: number) {
  return growth >= 0 ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
}

// Function to detect device from user agent
function detectDevice(userAgent: string | null): string {
  if (!userAgent) return "Unknown";

  const ua = userAgent.toLowerCase();

  if (ua.includes("android")) return "Android";
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ipod")) return "iOS";
  if (ua.includes("macintosh") || ua.includes("mac os")) return "Mac";
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("linux")) return "Linux";

  return "Other";
}

// Dashboard Component
export default function DashboardContent({
  data,
  startDate,
  endDate
}: {
  data: DashboardData;
  startDate: string;
  endDate: string;
}) {
  const [currentTab, setCurrentTab] = useState<string>("users");

  // Group users by role
  const usersByRole = useMemo(() => {
    const roleGroups: Record<string, number> = {};

    data.users.forEach(user => {
      const role = user.role || "user";
      roleGroups[role] = (roleGroups[role] || 0) + 1;
    });

    return Object.entries(roleGroups).map(([role, count]) => ({
      name: role,
      value: count
    }));
  }, [data.users]);

  // Count banned and verified users
  const userStatusCounts = useMemo(() => {
    const banned = data.users.filter(user => user.banned).length;
    const verified = data.users.filter(user => user.emailVerified).length;
    const active = data.users.filter(user => user.sessions.length > 0).length;

    return {
      banned,
      verified,
      active,
      total: data.users.length
    };
  }, [data.users]);

  // Group API keys by user role
  const apiKeysByRole = useMemo(() => {
    const keyGroups: Record<string, number> = {};

    data.users.forEach(user => {
      const role = user.role || "user";
      keyGroups[role] = (keyGroups[role] || 0) + user._count.apikey;
    });

    return Object.entries(keyGroups).map(([role, count]) => ({
      name: role,
      value: count
    }));
  }, [data.users]);

  // Group authentication providers
  const authProviders = useMemo(() => {
    const providers: Record<string, number> = {};

    data.users.forEach(user => {
      user.accounts.forEach(account => {
        const provider = account.providerId;
        providers[provider] = (providers[provider] || 0) + 1;
      });
    });

    return Object.entries(providers).map(([name, value]) => ({ name, value }));
  }, [data.users]);

  // Group sessions by device
  const sessionsByDevice = useMemo(() => {
    const devices: Record<string, number> = {};
    let totalSessions = 0;

    data.users.forEach(user => {
      user.sessions.forEach(session => {
        totalSessions++;
        const device = detectDevice(session.userAgent);
        devices[device] = (devices[device] || 0) + 1;
      });
    });

    return {
      totalSessions,
      byDevice: Object.entries(devices)
        .map(([device, count]) => ({ device, count }))
        .sort((a, b) => b.count - a.count)
    };
  }, [data.users]);

  // Generate chart data for user growth over time
  const growthChartData = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const chartData = [];

    for (let i = 0; i < days; i++) {
      const date = subDays(end, i);
      const startOfDayDate = startOfDay(date);
      const endOfDayDate = endOfDay(date);

      const newUsers = data.users.filter(user => {
        const createdAt = new Date(user.createdAt);
        return createdAt >= startOfDayDate && createdAt <= endOfDayDate;
      }).length;

      const newOrgs = data.orgs.filter(org => {
        const createdAt = new Date(org.createdAt);
        return createdAt >= startOfDayDate && createdAt <= endOfDayDate;
      }).length;

      chartData.unshift({
        date: format(date, 'MM/dd'),
        users: newUsers,
        organizations: newOrgs,
      });
    }

    return chartData;
  }, [data, startDate, endDate]);

  // Organization metrics
  const orgMetrics = useMemo(() => {
    const totalMembers = data.orgs.reduce((sum, org) => sum + org.members.length, 0);
    const adminMembers = data.orgs.reduce((sum, org) =>
      sum + org.members.filter(member => member.role === 'admin').length, 0);
    const ownerMembers = data.orgs.reduce((sum, org) =>
      sum + org.members.filter(member => member.role === 'owner').length, 0);
    const totalInvitations = data.orgs.reduce((sum, org) => sum + org.invitations.length, 0);

    // Group invitations by status
    const invitationsByStatus: Record<string, number> = {};
    data.orgs.forEach(org => {
      org.invitations.forEach(invitation => {
        const status = invitation.status;
        invitationsByStatus[status] = (invitationsByStatus[status] || 0) + 1;
      });
    });

    return {
      totalMembers,
      adminMembers,
      ownerMembers,
      totalInvitations,
      invitationsByStatus
    };
  }, [data.orgs]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

  return (
    <div className="space-y-6">
      <div className="flex flex-row justify-end items-center">
        <DateRangePicker
          initialDateFrom={startDate}
          initialDateTo={endDate}
        />
      </div>


      {/* Primary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Users Card */}
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Total Users</CardDescription>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">{userStatusCounts.total.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2">
              {usersByRole.map((role, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground capitalize">{role.name}</span>
                  <span className="font-medium">{role.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <div className="flex justify-between items-center w-full text-sm">
              <span className="text-muted-foreground">Banned</span>
              <Badge variant="destructive">{userStatusCounts.banned}</Badge>
            </div>
            <div className="flex justify-between items-center w-full text-sm">
              <span className="text-muted-foreground">Verified</span>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100">{userStatusCounts.verified}</Badge>
            </div>
          </CardFooter>
        </Card>



        {/* API Keys Card */}
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>API Keys</CardDescription>
              <Key className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">
              {data.users.reduce((sum, user) => sum + user._count.apikey, 0).toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2">
              {apiKeysByRole.slice(0, 3).map((role, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground capitalize">{role.name}</span>
                  <span className="font-medium">{role.value}</span>
                </div>
              ))}
            </div>
          </CardContent>

        </Card>

        {/* Sessions Card */}
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Sessions</CardDescription>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">{sessionsByDevice.totalSessions.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2">
              {sessionsByDevice.byDevice.slice(0, 3).map((device, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{device.device}</span>
                  <span className="font-medium">{device.count}</span>
                </div>
              ))}
            </div>
          </CardContent>

        </Card>
      </div>

      {/* Secondary Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Organizations</CardDescription>
              <Building className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">{data.orgs.length.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Members</span>
                <span className="font-medium">{orgMetrics.totalMembers}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Admins</span>
                <span className="font-medium">{orgMetrics.adminMembers}</span>
              </div>
            </div>
          </CardContent>

        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Auth Providers</CardDescription>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">{authProviders.length.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {authProviders.map((provider, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground capitalize">{provider.name}</span>
                  <span className="font-medium">{provider.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardDescription>Devices</CardDescription>
              <Smartphone className="h-4 w-4 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">{sessionsByDevice.byDevice.length.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sessionsByDevice.byDevice.map((device, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">{device.device}</span>
                  <span className="font-medium">{device.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Chart */}
      <Card className="bg-card">
        <CardHeader>
          <CardTitle>Platform Growth</CardTitle>
          <CardDescription>
            Users and organizations growth over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={growthChartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorOrgs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--muted-foreground)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--background)',
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="var(--primary)"
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                  name="Users"
                />
                <Area
                  type="monotone"
                  dataKey="organizations"
                  stroke="var(--secondary)"
                  fillOpacity={1}
                  fill="url(#colorOrgs)"
                  name="Organizations"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Data Tabs */}
      <Card className="bg-card">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Platform Data</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search..."
                  className="w-[200px] rounded-md border border-input bg-background px-3 py-2 pl-8 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="users" onValueChange={setCurrentTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="organizations">Organizations</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="auth">Auth Providers</TabsTrigger>
            </TabsList>

            {/* Users Tab */}
            <TabsContent value="users">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">User Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Active', value: userStatusCounts.active },
                              // { name: 'Inactive', value: userStatusCounts.total - userStatusCounts.active - userStatusCounts.banned },
                              { name: 'Banned', value: userStatusCounts.banned },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="var(--primary)"
                            dataKey="value"
                            label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            <Cell fill={COLORS[0]} />
                            <Cell fill="var(--destructive)" />
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--background)',
                              borderColor: 'var(--border)',
                              color: 'var(--foreground)'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Email Verified Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Verified', value: userStatusCounts.verified },
                              // { name: 'Inactive', value: userStatusCounts.total - userStatusCounts.active - userStatusCounts.banned },
                              { name: 'Unverified', value: userStatusCounts.total - userStatusCounts.verified },
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="var(--primary)"
                            dataKey="value"
                            label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            <Cell fill={COLORS[0]} />
                            <Cell fill="var(--destructive)" />
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--background)',
                              borderColor: 'var(--border)',
                              color: 'var(--foreground)'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Users by Role</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={usersByRole}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="var(--primary)"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {usersByRole.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--background)',
                              borderColor: 'var(--border)',
                              color: 'var(--foreground)'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>


            </TabsContent>

            {/* Organizations Tab */}
            <TabsContent value="organizations">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Members</CardTitle>
                    <CardDescription>Across all organizations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{orgMetrics.totalMembers}</div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {orgMetrics.adminMembers} admin members ({((orgMetrics.adminMembers / orgMetrics.totalMembers) * 100).toFixed(1)}%)
                    </div>
                    <div className="text-sm text-muted-foreground mt-2">
                      {orgMetrics.ownerMembers} owner members ({((orgMetrics.ownerMembers / orgMetrics.totalMembers) * 100).toFixed(1)}%)
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Total Invitations</CardTitle>
                    <CardDescription>Across all organizations</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{orgMetrics.totalInvitations}</div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {Object.entries(orgMetrics.invitationsByStatus).map(([status, count]) => (
                        <Badge key={status} variant="outline" className={cn(
                          status === 'accepted' ? 'text-success' :
                            status === 'pending' ? 'text-warning' :
                              'text-destructive'
                        )}>
                          {status}: {count}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Member Roles</CardTitle>
                    <CardDescription>Distribution by role</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[150px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[
                            { name: 'Owner', value: orgMetrics.ownerMembers },
                            { name: 'Admin', value: orgMetrics.adminMembers },
                            { name: 'Member', value: orgMetrics.totalMembers - orgMetrics.adminMembers },
                          ]}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border)" />
                          <XAxis type="number" stroke="var(--muted-foreground)" />
                          <YAxis dataKey="name" type="category" stroke="var(--muted-foreground)" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--background)',
                              borderColor: 'var(--border)',
                              color: 'var(--foreground)'
                            }}
                          />
                          <Bar dataKey="value" fill="var(--primary)">
                            <Cell fill="var(--warning)" />
                            <Cell fill="var(--primary)" />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Admins</TableHead>
                      <TableHead>Owners</TableHead>
                      <TableHead>Pending Invites</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.orgs.slice(0, 5).map((org, index) => {
                      const adminCount = org.members.filter(m => m.role === 'admin').length;
                      const ownerCount = org.members.filter(m => m.role === 'owner').length;
                      const pendingInvites = org.invitations.filter(i => i.status === 'pending').length;

                      return (
                        <TableRow key={index}>
                          <TableCell>{org.name}</TableCell>
                          <TableCell>{format(new Date(org.createdAt), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{org.members.length}</TableCell>
                          <TableCell>{adminCount}</TableCell>
                          <TableCell>{ownerCount}</TableCell>
                          <TableCell>{pendingInvites}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Devices Tab */}
            <TabsContent value="devices">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Device Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sessionsByDevice.byDevice}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="var(--primary)"
                            dataKey="count"
                            nameKey="device"
                            label={({ device, percent }: any) => `${device}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {sessionsByDevice.byDevice.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--background)',
                              borderColor: 'var(--border)',
                              color: 'var(--foreground)'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Sessions by Device</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={sessionsByDevice.byDevice}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                          <XAxis dataKey="device" stroke="var(--muted-foreground)" />
                          <YAxis stroke="var(--muted-foreground)" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--background)',
                              borderColor: 'var(--border)',
                              color: 'var(--foreground)'
                            }}
                          />
                          <Bar dataKey="count" name="Sessions">
                            {sessionsByDevice.byDevice.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead>Device</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Icon</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessionsByDevice.byDevice.map((device, index) => {
                      const totalSessions = sessionsByDevice.totalSessions;
                      const percentage = totalSessions ? ((device.count / totalSessions) * 100).toFixed(1) : '0';

                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{device.device}</TableCell>
                          <TableCell>{device.count}</TableCell>
                          <TableCell>{percentage}%</TableCell>
                          <TableCell>
                            {device.device === 'Android' && <Smartphone className="h-5 w-5 text-success" />}
                            {device.device === 'iOS' && <Smartphone className="h-5 w-5 text-primary" />}
                            {device.device === 'Windows' && <Laptop className="h-5 w-5 text-primary" />}
                            {device.device === 'Mac' && <Laptop className="h-5 w-5 text-muted-foreground" />}
                            {device.device === 'Linux' && <Laptop className="h-5 w-5 text-warning" />}
                            {device.device === 'Other' && <TabletSmartphone className="h-5 w-5 text-muted-foreground" />}
                            {device.device === 'Unknown' && <TabletSmartphone className="h-5 w-5 text-muted-foreground" />}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Auth Providers Tab */}
            <TabsContent value="auth">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Authentication Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={authProviders}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="var(--primary)"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {authProviders.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--background)',
                              borderColor: 'var(--border)',
                              color: 'var(--foreground)'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Authentication Providers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={authProviders}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                          <XAxis dataKey="name" stroke="var(--muted-foreground)" />
                          <YAxis stroke="var(--muted-foreground)" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'var(--background)',
                              borderColor: 'var(--border)',
                              color: 'var(--foreground)'
                            }}
                          />
                          <Bar dataKey="value" name="Users">
                            {authProviders.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="rounded-md border border-border">
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {authProviders.map((provider, index) => {
                      const totalUsers = authProviders.reduce((sum, p) => sum + p.value, 0);
                      const percentage = totalUsers ? ((provider.value / totalUsers) * 100).toFixed(1) : '0';

                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{provider.name}</TableCell>
                          <TableCell>{provider.value}</TableCell>
                          <TableCell>{percentage}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
