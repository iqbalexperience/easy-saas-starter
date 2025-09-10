"use client"

import { authClient } from '@/lib/auth-client';
import { OrganizationSwitcher } from '@daveyplate/better-auth-ui';

function OrganizationSwitcherClient({ size }: { size: "default" | "icon" | "sm" | "lg" | null | undefined }) {
    const smCls = " text-xs"
    const dfCls = " text-xs w-full h-12"

    return (<OrganizationSwitcher
        className={size === "sm" ? smCls : dfCls}
        size={size}
        variant={"outline"}
        onSetActive={async (organizationId) => {
            await authClient.organization.setActive({
                organizationId: organizationId?.id
            })
            window.location.reload()
        }}
    />);
}

export default OrganizationSwitcherClient;