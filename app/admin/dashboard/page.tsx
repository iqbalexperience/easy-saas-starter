// app/admin/dashboard/page.tsx
import { Suspense } from "react";
import { Metadata } from "next";
import DashboardContent from "@/components/admin/dashboard/DashboardContent";
import DashboardSkeleton from "@/components/admin/dashboard/DashboardSkeleton";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { RedirectToSignIn, SignedIn, UserButton } from "@daveyplate/better-auth-ui";
import { format, subDays } from "date-fns";
import SidebarWrap from "@/components/sidebar/sidebar-wrap";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Platform performance and analytics",
};

// Helper function to parse date strings with fallback
function parseDate(dateString: string | null, fallback: Date): Date {
  if (!dateString) return fallback;
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? fallback : date;
  } catch {
    return fallback;
  }
}

async function getData(startDate: Date, endDate: Date) {
  // Format dates for database query
  const startDateISO = startDate.toISOString();
  const endDateISO = endDate.toISOString();

  const users = await prisma.user.findMany({
    where: {
      createdAt: {
        gte: startDateISO,
        lte: endDateISO
      }
    },
    select: {
      createdAt: true,
      banned: true,
      emailVerified: true,
      role: true,
      sessions: {
        select: {
          userAgent: true
        }
      },
      accounts: {
        select: {
          providerId: true
        }
      },
      _count: {
        select: {
          apikey: true
        }
      }
    }
  });

  const orgs = await prisma.organization.findMany({
    where: {
      createdAt: {
        gte: startDateISO,
        lte: endDateISO
      }
    },
    select: {
      name: true,
      createdAt: true,
      members: {
        select: {
          role: true
        }
      },
      invitations: {
        select: {
          status: true
        }
      }
    }
  });

  return { users, orgs };
}

export default async function DashboardPage({
  searchParams: searchParams_1
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string }>
}) {
  const searchParams = await searchParams_1
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user.id) {
    return <RedirectToSignIn />;
  }

  if (session.user.role !== "admin") {
    return (
      <div className="flex flex-row items-center justify-center mt-6">
        <p>You're not allowed to view this page!</p>
      </div>
    );
  }

  // Default to last 30 days if no date range provided
  const today = new Date();
  const defaultStartDate = subDays(today, 30);

  // Parse dates from search params with fallbacks
  const startDate = parseDate(searchParams.startDate || null, defaultStartDate);
  const endDate = parseDate(searchParams.endDate || null, today);

  // Format dates for passing to client component
  const formattedStartDate = format(startDate, 'yyyy-MM-dd');
  const formattedEndDate = format(endDate, 'yyyy-MM-dd');

  const data = await getData(startDate, endDate);

  return (
    <SidebarWrap nav={[
      {
        title: "Admin Dashboard"
      },
    ]}>
      <SignedIn>
        <div className="container mx-auto p-2">

          <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent
              // @ts-ignore
              data={data}
              startDate={formattedStartDate}
              endDate={formattedEndDate}
            />
          </Suspense>
        </div>
      </SignedIn></SidebarWrap>
  );
}
