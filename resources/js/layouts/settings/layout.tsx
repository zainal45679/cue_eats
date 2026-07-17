import { Link } from "@inertiajs/react";
import type { PropsWithChildren } from "react";
import Heading from "@/components/dashboard/heading";
import { Button } from "@/components/shadcn/ui/button";
import { Separator } from "@/components/shadcn/ui/separator";
import { edit as editAppearance } from "@/generated/routes/appearance";
import { edit as editOrganization } from "@/generated/routes/organization";
import { edit as editPassword } from "@/generated/routes/password";
import { edit } from "@/generated/routes/profile";
import { cn } from "@/lib/utils";
import type { NavItem, SharedData } from "@/types";
import { usePage } from "@inertiajs/react";

const sidebarNavItems: (NavItem & { requireRole?: string })[] = [
  {
    title: "Organization",
    href: editOrganization(),
    icon: null,
    requireRole: "admin",
  },
  {
    title: "Profile",
    href: edit(),
    icon: null,
  },
  {
    title: "Password",
    href: editPassword(),
    icon: null,
  },
  {
    title: "Appearance",
    href: editAppearance(),
    icon: null,
  },
];

export default function SettingsLayout({ children }: PropsWithChildren) {
  const { auth } = usePage<SharedData>().props;
  
  // When server-side rendering, we only render the layout on the client...
  if (typeof window === "undefined") {
    return null;
  }

  const currentPath = window.location.pathname;

  const filteredNavItems = sidebarNavItems.filter((item) => {
    if (item.requireRole && !auth.roles?.includes(item.requireRole)) {
      return false;
    }
    return true;
  });

  return (
    <div className="px-4 py-6">
      <Heading
        description="Manage your profile and account settings"
        title="Settings"
      />

      <div className="flex flex-col lg:flex-row lg:space-x-12">
        <aside className="w-full max-w-xl lg:w-48">
          <nav className="flex flex-col space-x-0 space-y-1">
            {filteredNavItems.map((item, index) => (
              <Button
                asChild
                className={cn("w-full justify-start", {
                  "bg-muted":
                    currentPath ===
                    (typeof item.href === "string" ? item.href : item.href.url),
                })}
                key={`${typeof item.href === "string" ? item.href : item.href.url}-${index}`}
                size="sm"
                variant="ghost"
              >
                <Link href={item.href}>
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.title}
                </Link>
              </Button>
            ))}
          </nav>
        </aside>

        <Separator className="my-6 lg:hidden" />

        <div className="flex-1 md:max-w-2xl">
          <section className="max-w-xl space-y-12">{children}</section>
        </div>
      </div>
    </div>
  );
}
