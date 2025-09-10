"use client"

import * as React from "react"
import {
    Clock,
    HomeIcon,
    Kanban,
    Key,
    MessageSquare,
    Send,
    Sparkles,
    SquareTerminal,
    UserCog,
} from "lucide-react"

import { NavMain } from "./nav-primary"
import { NavSecondary } from "./nav-secondary"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { saasMeta } from "@/lib/appMeta/meta"
import OrganizationSwitcherClient from "../organisation-switcher"
import { NavBottom } from "./nav-bottom"
import { authClient, useSession } from "@/lib/auth-client"
import { Button } from "../ui/button"

export const navPaths = {
    navPrimary: [


    ],
    navSecondary: [

    ],
    navBottom: [
        {
            title: "Feedback",
            url: "/feedback/feedback",
            icon: MessageSquare,
        }
    ],

}

export function NavSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { data: session } = useSession()
    return (
        <Sidebar variant="inset" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <a href="/">
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                                    <img src={saasMeta.logo} alt={saasMeta.name} />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-medium font-mono tracking-wider">{saasMeta.name}</span>
                                    <span className="truncate text-xs">{saasMeta.description}</span>
                                </div>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                {session?.session?.impersonatedBy && <Button variant={"destructive"}
                    onClick={async () => {
                        await authClient.admin.stopImpersonating();
                        window.location.reload();
                    }}>
                    <UserCog />
                    Stop Impersonating
                </Button>}
                {/* <div className="pl-3 pr-2 w-full">
                    <OrganizationSwitcherClient />
                </div> */}
                <NavMain items={navPaths.navPrimary} />
                <NavSecondary projects={navPaths.navSecondary} />
                {/* <NavColections /> */}
                <NavBottom items={navPaths.navBottom} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                {/* <NavUser user={data.user} /> */}
                {/* <UserButton size={"default"} className="bg-secondary text-secondary-foreground hover:bg-secondary/50 " /> */}
                <OrganizationSwitcherClient size={"default"} />
            </SidebarFooter>
        </Sidebar>
    )
}
