
import { NavSidebar } from "@/components/sidebar/nav-sidebar";

import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Fragment, ReactNode } from "react";
import { ModeToggle } from "../mode-toggle";
import { UserButton } from "@daveyplate/better-auth-ui";


export default function SidebarWrap({
    children,
    nav
}: Readonly<{
    children: ReactNode;
    nav: {
        title: string
        href?: string
    }[]
}>) {
    return (
        <div>
            <SidebarProvider>
                <NavSidebar />
                <SidebarInset className="md:max-w-[calc(100vw_-_16rem)]">
                    <header className="flex h-16 shrink-0 items-center gap-2 justify-between pr-4">
                        <div className="flex items-center gap-2 px-4 overflow-hidden">
                            <SidebarTrigger className="-ml-1" />
                            <Separator
                                orientation="vertical"
                                className="mr-2 data-[orientation=vertical]:h-4"
                            />
                            <Breadcrumb className="flex flex-row gap-2 items-center text-sm font-medium overflow-auto line-clamp-1 ">
                                {nav.map((item, index) => (
                                    <Fragment key={index}>
                                        {item?.href ? (
                                            <BreadcrumbItem key={index} className="block text-muted-foreground ">
                                                <BreadcrumbLink href={item.href} >
                                                    {item.title}
                                                </BreadcrumbLink>
                                            </BreadcrumbItem>
                                        ) : (
                                            <BreadcrumbItem>
                                                <BreadcrumbPage>{item.title}</BreadcrumbPage>
                                            </BreadcrumbItem>
                                        )}
                                        {index < nav.length - 1 && ( // Conditionally render separator
                                            <BreadcrumbSeparator className=" block" />
                                        )}
                                    </Fragment>
                                ))}
                            </Breadcrumb>
                        </div>
                        <div className="flex flex-row gap-4 items-center">
                            <ModeToggle />
                            <UserButton size={"icon"} />
                        </div>
                    </header>
                    {children}
                </SidebarInset>

            </SidebarProvider>

        </div>
    );
}
