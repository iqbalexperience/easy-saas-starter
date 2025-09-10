import SidebarWrap from "@/components/sidebar/sidebar-wrap";
import { RedirectToSignIn, SignedIn, UserButton } from "@daveyplate/better-auth-ui";

export default function HomePage() {

  return (
    <SidebarWrap nav={[
      {
        title: "Home"
      },
    ]}>
      <div className="flex flex-col items-center py-8 md:py-12 lg:py-16">
        <RedirectToSignIn />

        <SignedIn>
          <div className="container px-4 md:px-6">

            <div className="flex flex-col items-center gap-6 text-center">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Easy SaaS Template
              </h1>
              <UserButton />
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Seamlessly start impleenting your idea.
              </p>
            </div>
          </div>
        </SignedIn>
      </div>
    </SidebarWrap>
  );
}