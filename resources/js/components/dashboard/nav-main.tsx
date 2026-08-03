import { Link, usePage } from "@inertiajs/react";
import { ChevronRight, Package, Truck, ShoppingCart, Settings, Shield, ArrowRightLeft } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/shadcn/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/shadcn/ui/sidebar";
import type { NavItem } from "@/types";

// Group items by their `group` property
function groupBy<T>(arr: T[], key: keyof T) {
  return arr.reduce((acc: Record<string, T[]>, item: T) => {
    const group = String(item[key] ?? "");
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});
}

// Helper to check if any child or the item itself is active
function isItemActive(item: NavItem, currentUrl: string): boolean {
  if (item.href) {
    const href = typeof item.href === "object" ? (item.href as any).url : item.href;
    if (href && typeof href === "string") {
      if (currentUrl === href) return true;
      if (currentUrl.startsWith(href + '/')) return true;
      if (currentUrl.startsWith(href + '&')) return true;
      
      if (currentUrl.startsWith(href + '?')) {
        // Prevent base menus from being active when viewing specific 'type' tabs
        if (currentUrl.includes('type=') && !href.includes('type=')) {
            return false;
        }
        return true;
      }
    }
  }
  if (item.children) {
    return item.children.some((child) => isItemActive(child, currentUrl));
  }
  return false;
}

const getGroupIcon = (groupName: string) => {
  switch (groupName) {
    case "Inventory Operations": return <Package className="h-5 w-5 text-primary" />;
    case "Internal Transfers": return <ArrowRightLeft className="h-5 w-5 text-primary" />;
    case "External Purchasing": return <Truck className="h-5 w-5 text-primary" />;
    case "Setup & Config": return <Settings className="h-5 w-5 text-primary" />;
    case "Settings": return <Settings className="h-5 w-5 text-primary" />;
    default: return null;
  }
};

export function NavMain({ items = [] }: { items: NavItem[] }) {
  const page = usePage();
  const groupedItems = groupBy(items, "group");

  return (
    <>
      {Object.entries(groupedItems).map(([groupName, groupItems]) => {
        const isGroupActive = groupItems.some((item) => isItemActive(item, page.url));

        if (!groupName) {
          return (
            <SidebarGroup className="px-2 py-0" key="root-items">
              <SidebarMenu>
                {groupItems.map((item) => {
                  const isActive = isItemActive(item, page.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className="!text-[14px] !font-normal !h-10 px-3"
                        isActive={isActive}
                        tooltip={{ children: item.title }}
                      >
                        <Link href={item.href as string} prefetch>
                          {item.icon && <item.icon className="mr-2 h-5 w-5" />}
                          <span className="pl-[3px] pr-[6px]">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          );
        }

        return (
          <SidebarGroup className="px-2 py-0" key={groupName}>
            <SidebarMenu>
              <Collapsible asChild defaultOpen={isGroupActive} className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton 
                      className="!text-[14px] !font-normal !h-10 px-3 group-data-[collapsible=icon]:!px-2"
                      tooltip={{ children: groupName }}
                    >
                      {getGroupIcon(groupName)}
                      <span className="pl-[3px] pr-[6px]">{groupName}</span>
                      <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 opacity-50" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenu className="pt-2 gap-1.5">
                      {groupItems.map((item) => {
                        const isActive = isItemActive(item, page.url);
                    if (item.children && item.children.length > 0) {
                      return (
                        <Collapsible asChild defaultOpen={isActive} key={item.title}>
                          <SidebarMenuItem>
                            <CollapsibleTrigger asChild>
                              <SidebarMenuButton
                                className="group cursor-pointer pl-9 text-[14px]"
                                isActive={isActive}
                                tooltip={{ children: item.title }}
                              >
                                {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                                <span className="pl-[3px] pr-[6px]">{item.title}</span>
                                <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90 opacity-50" />
                              </SidebarMenuButton>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <SidebarMenuSub className="mr-0 pr-0">
                                {item.children.map((child) => (
                                  <SidebarMenuSubItem key={child.title}>
                                    <SidebarMenuSubButton
                                      asChild
                                      className="text-[14px]"
                                      isActive={isItemActive(child, page.url)}
                                    >
                                      <Link href={child.href as string} prefetch>
                                        {child.icon && (
                                          <child.icon className="mr-2 h-4 w-4" />
                                        )}
                                        <span className="pl-[3px] pr-[6px]">{child.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            </CollapsibleContent>
                          </SidebarMenuItem>
                        </Collapsible>
                      );
                    }
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={!groupName ? "!text-[14px] !font-normal !h-10 px-3" : "group cursor-pointer pl-9 text-[14px]"}
                          isActive={isActive}
                          tooltip={{ children: item.title }}
                        >
                          <Link href={item.href as string} prefetch>
                            {item.icon && <item.icon className={!groupName ? "mr-2 h-5 w-5" : "mr-2 h-4 w-4"} />}
                            <span className="pl-[3px] pr-[6px]">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroup>
        );
      })}
    </>
  );
}
