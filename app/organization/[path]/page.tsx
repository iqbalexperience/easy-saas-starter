import SidebarWrap from "@/components/sidebar/sidebar-wrap"
import { buttonVariants } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { OrganizationView } from "@daveyplate/better-auth-ui"
import { organizationViewPaths } from "@daveyplate/better-auth-ui/server"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamicParams = false

export function generateStaticParams() {
    return Object.values(organizationViewPaths).map((path) => ({ path }))
}

export default async function OrganizationPage({ params }: { params: Promise<{ path: string }> }) {
    const { path } = await params

    const sessionData = await auth.api.getSession({ headers: await headers() })
    if (!sessionData) redirect("/auth/sign-in?redirectTo=/auth/settings")

    return (
        <SidebarWrap nav={[
            {
                title: "Account",
                href: "/account/settings"
            }, {
                title: "Organisation"
            },
        ]}>
            <div className="container mx-auto p-2">
                {sessionData.user.role === "admin" && <div className="flex flex-row items-center gap-4 pb-4 ">
                    <Link href={"/account/settings"}
                        className={buttonVariants({ variant: "outline" })} >
                        Account Setting
                    </Link>
                    <Link href={"/admin/dashboard"}
                        className={buttonVariants({ variant: "outline" })} >
                        Admin Dashboard
                    </Link>
                    <Link href={"/admin/users"}
                        className={buttonVariants({ variant: "outline" })} >
                        Manage Platform Users
                    </Link>
                </div>}
                <OrganizationView path={path} />
            </div>
        </SidebarWrap>
    )
}