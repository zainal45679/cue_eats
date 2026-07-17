import { Link, usePage } from "@inertiajs/react";
import { NavMain } from "@/components/dashboard/nav-main";
import { NavUser } from "@/components/dashboard/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/shadcn/ui/sidebar";
import { Configs } from "@/config";
import { dashboard } from "@/generated/routes";
import { AdvancedScrollArea } from "../shadcn/ui/advanced-scroll-area";
import AppLogo from "./app-logo";

export function AppSidebar() {
  const { permissions } = usePage().props.auth as {
    permissions: string[];
    roles: string[];
  };

  const filteredMenu = Configs.mainNavItems.filter((item) => {
    if (item.permission) {
      const hasPermission = permissions.some((userPerm) =>
        userPerm.endsWith(`.${item.permission}`)
      );

      if (!hasPermission) {
        return false;
      }
    }

    return true;
  });
  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href={dashboard()} prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <AdvancedScrollArea
        className="flex min-h-0 flex-1 flex-col gap-2"
        withNavigation
      >
        <SidebarContent>
          <NavMain items={filteredMenu} />
        </SidebarContent>
      </AdvancedScrollArea>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
