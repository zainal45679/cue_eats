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
            <SidebarMenuButton 
              asChild 
              size="lg" 
              className="hover:bg-transparent active:bg-transparent hover:text-foreground active:text-foreground focus-visible:ring-0 shadow-none hover:shadow-none"
            >
              <Link href={dashboard().url} prefetch>
                <AppLogo />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="min-h-0 flex-1 overflow-x-hidden overflow-y-scroll overscroll-contain touch-pan-y [scrollbar-gutter:stable]">
        <NavMain items={filteredMenu} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
