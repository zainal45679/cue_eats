import { Link, usePage } from "@inertiajs/react";
import { ChevronRight } from "lucide-react";
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
    const href = typeof item.href === "object" ? item.href.url : item.href;
    if (currentUrl.startsWith(href)) return true;
  }
  if (item.children) {
    return item.children.some((child) => isItemActive(child, currentUrl));
  }
  return false;
}

export function NavMain({ items = [] }: { items: NavItem[] }) {
  const page = usePage();
  const groupedItems = groupBy(items, "group");

  return (
    <>
      {Object.entries(groupedItems).map(([groupName, groupItems]) => (
        <SidebarGroup className="px-2 py-0" key={groupName}>
          {!!groupName && <SidebarGroupLabel>{groupName}</SidebarGroupLabel>}
          <SidebarMenu>
            {groupItems.map((item) => {
              const isActive = isItemActive(item, page.url);
              if (item.children && item.children.length > 0) {
                return (
                  <Collapsible asChild defaultOpen={isActive} key={item.title}>
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className="group cursor-pointer"
                          isActive={isActive}
                          tooltip={{ children: item.title }}
                        >
                          {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub className="mr-0 pr-0">
                          {item.children.map((child) => (
                            <SidebarMenuSubItem key={child.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isItemActive(child, page.url)}
                              >
                                <Link href={child.href} prefetch>
                                  {child.icon && (
                                    <child.icon className="mr-2 h-4 w-4" />
                                  )}
                                  <span>{child.title}</span>
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
                    isActive={isActive}
                    tooltip={{ children: item.title }}
                  >
                    <Link href={item.href} prefetch>
                      {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
