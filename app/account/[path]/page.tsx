import SidebarWrap from "@/components/sidebar/sidebar-wrap"
import { buttonVariants } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { AccountView, AuthView, RedirectToSignIn } from "@daveyplate/better-auth-ui"
import { accountViewPaths } from "@daveyplate/better-auth-ui/server"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"

export const dynamicParams = false

export function generateStaticParams() {
    return Object.values(accountViewPaths).map((path) => ({ path }))
}

export default async function AccountPage({ params }: { params: Promise<{ path: string }> }) {
    const { path } = await params

    const sessionData = await auth.api.getSession({ headers: await headers() })
    if (!sessionData) {
        return <RedirectToSignIn />
    }

    console.log(sessionData)

    return <SidebarWrap nav={[
        {
            title: "Account"
        },
    ]}>
        <div className="container mx-auto p-4">
            {sessionData.user.role === "admin" && <div className="flex flex-row items-center gap-4 pb-4 ">
                <Link href={"/admin/dashboard"}
                    className={buttonVariants({ variant: "outline" })} >
                    Admin Dashboard
                </Link>
                <Link href={"/admin/users"}
                    className={buttonVariants({ variant: "outline" })} >
                    Manage Platform Users
                </Link>
            </div>}
            <AccountView path={path} />
        </div>
    </SidebarWrap>
}