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
  const { permissions, roles } = usePage().props.auth as {
    permissions: string[];
    roles: string[];
  };

  const filteredMenu = Configs.mainNavItems.filter((item) => {
    if (roles?.includes("admin")) {
      return true;
    }
    
    const isManager = roles?.includes("outlet_manager") || roles?.includes("manager");
    
    if (isManager) {
      if (item.group === "Setup & Config") return false;
      if (item.title === "Organization" || item.title === "Roles and Permissions") return false;
    }

    // Only non-managers get blocked by adminOnly
    if (item.adminOnly && !isManager) {
      return false;
    }

    if (item.permission) {
      const hasPermission = permissions?.some((userPerm) =>
        userPerm.endsWith(`.${item.permission}`)
      );

      if (!hasPermission) {
        return false;
      }
    }

    return true;
  });
  return (
    <Sidebar collapsible="icon" variant="inset" className="print:hidden">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href={dashboard().url} prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <AdvancedScrollArea
        className="flex min-h-0 flex-1 flex-col gap-1"
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
