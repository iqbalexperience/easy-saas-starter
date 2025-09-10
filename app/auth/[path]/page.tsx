import { authViewPaths } from "@daveyplate/better-auth-ui/server"
import { AuthView } from "@daveyplate/better-auth-ui"
import { saasMeta } from "@/lib/appMeta/meta"

export function generateStaticParams() {
    return Object.values(authViewPaths).map((path) => ({ path }))
}

export default async function AuthPage({ params }: { params: Promise<{ path: string }> }) {
    const { path } = await params


    // if (["sign-in", "sign-up", "forgot-password", "reset-password", "/auth/magic-link"].includes(path)) {
    return <div className="container mx-auto w-full p-4">
        <div className="flex flex-row gap-4 items-center justify-center w-fit mx-auto ">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                <img src={saasMeta.logo} alt={saasMeta.name} />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium font-mono tracking-wider text-xl">{saasMeta.name}</span>
                {/* <span className="truncate text-xs">{saasMeta.description}</span> */}
            </div>
        </div>
        <div className="flex grow flex-col items-center justify-center gap-4 p-4">
            <AuthView path={path} />
        </div>
    </div>




}
