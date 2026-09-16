import { useState, useEffect } from "react";
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
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types";

function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const group = String(item[key]);
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

function cleanUrlPath(path: string): string {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
}

function getItemScore(item: NavItem, currentUrl: string): number {
  if (!currentUrl) return 0;

  let maxScore = 0;

  if (item.href) {
    const href = item.href as string;

    if (currentUrl === href) {
      maxScore = Math.max(maxScore, href.length + 1000);
    } else {
      const [rawCurrentPath] = currentUrl.split("?");
      const [rawHrefPath, hrefQuery] = href.split("?");

      const currentPath = cleanUrlPath(rawCurrentPath);
      const hrefPath = cleanUrlPath(rawHrefPath);

      if (hrefQuery) {
        if (currentPath === hrefPath && currentUrl.includes(hrefQuery)) {
          maxScore = Math.max(maxScore, href.length + 500);
        } else if (currentPath === hrefPath && !currentUrl.includes("?") && hrefQuery === "tab=items") {
          maxScore = Math.max(maxScore, href.length + 450);
        }
      } else {
        if (currentPath === hrefPath) {
          maxScore = Math.max(maxScore, hrefPath.length + 100);
        } else if (
          hrefPath !== "/" &&
          hrefPath !== "/dashboard" &&
          currentPath.startsWith(hrefPath + "/")
        ) {
          maxScore = Math.max(maxScore, hrefPath.length);
        }
      }
    }
  }

  if (item.children) {
    for (const child of item.children) {
      maxScore = Math.max(maxScore, getItemScore(child, currentUrl));
    }
  }

  return maxScore;
}

function CollapsibleNavItem({
  item,
  checkIsActive,
}: {
  item: NavItem;
  checkIsActive: (item: NavItem) => boolean;
}) {
  const isActive = checkIsActive(item);
  const [isOpen, setIsOpen] = useState(isActive);

  useEffect(() => {
    setIsOpen(isActive);
  }, [isActive]);

  const firstChild = item.children && item.children.length > 0 ? item.children[0] : null;
  const firstHref = firstChild?.href as string | undefined;

  const handleHeaderClick = (e: React.MouseEvent) => {
    if (isOpen) {
      e.preventDefault();
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} key={item.title}>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          className={cn(
            "relative group cursor-pointer !text-[13px] !font-medium !h-10 px-3 transition-all duration-200 border rounded-md flex items-center select-none overflow-hidden active:scale-[0.98]",
            isActive 
              ? "bg-primary/10 border-primary/20 text-primary font-semibold hover:bg-primary/15 hover:text-primary shadow-xs" 
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#18181b] hover:text-zinc-900 dark:hover:text-white border-transparent"
          )}
          tooltip={{ children: item.title }}
        >
          {firstHref ? (
            <Link href={firstHref} prefetch onClick={handleHeaderClick} className="flex items-center w-full">
              {item.icon && (
                <item.icon
                  className={cn(
                    "mr-3 h-4 w-4 transition-colors duration-200 shrink-0",
                    isActive ? "text-primary" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-300"
                  )}
                />
              )}
              <span className="flex-1 truncate">{item.title}</span>
              <ChevronRight className={cn("ml-auto h-4 w-4 transition-transform duration-200", isOpen ? "rotate-90" : "rotate-0", isActive ? "text-primary" : "opacity-50")} />
            </Link>
          ) : (
            <CollapsibleTrigger className="flex items-center w-full">
              {item.icon && (
                <item.icon
                  className={cn(
                    "mr-3 h-4 w-4 transition-colors duration-200 shrink-0",
                    isActive ? "text-primary" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-300"
                  )}
                />
              )}
              <span className="flex-1 truncate">{item.title}</span>
              <ChevronRight className={cn("ml-auto h-4 w-4 transition-transform duration-200", isOpen ? "rotate-90" : "rotate-0", isActive ? "text-primary" : "opacity-50")} />
            </CollapsibleTrigger>
          )}
        </SidebarMenuButton>
        <CollapsibleContent>
          <SidebarMenuSub className="mr-0 pr-0 border-l border-zinc-200 dark:border-zinc-800 ml-5 pl-2 mt-1 gap-1">
            {item.children?.map((child) => {
              const isChildActive = checkIsActive(child);
              return (
                <SidebarMenuSubItem key={child.title}>
                  <SidebarMenuSubButton
                    asChild
                    isActive={isChildActive}
                    className={cn(
                      "relative !text-[13px] !h-8 px-2 transition-colors duration-150 flex items-center select-none !bg-transparent hover:!bg-transparent active:!bg-transparent data-[active=true]:!bg-transparent !border-0 !shadow-none",
                      isChildActive
                        ? "!text-primary font-semibold hover:!text-primary data-[active=true]:!text-primary"
                        : "text-zinc-500 dark:text-zinc-400 font-normal hover:text-zinc-900 dark:hover:text-zinc-100"
                    )}
                  >
                    <Link href={child.href as string} prefetch className="flex items-center w-full">
                      <span className="transition-colors duration-150 truncate">{child.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function NavMain({ items = [] }: { items: NavItem[] }) {
  const page = usePage();
  const groupedItems = groupBy(items, "group");

  let bestScore = 0;
  for (const item of items) {
    const score = getItemScore(item, page.url);
    if (score > bestScore) {
      bestScore = score;
    }
  }

  const checkIsActive = (item: NavItem): boolean => {
    if (bestScore === 0) return false;
    const score = getItemScore(item, page.url);
    return score === bestScore;
  };

  return (
    <>
      {Object.entries(groupedItems).map(([groupName, groupItems]) => {
        if (!groupName || groupName === "undefined") {
          return null;
        }

        return (
          <SidebarGroup className="px-2 py-0 mt-4 mb-1" key={groupName}>
            {/* Group Header */}
            <SidebarGroupLabel className="text-xs font-bold text-zinc-600 dark:text-zinc-300 uppercase tracking-wider px-3 mb-1.5 h-auto py-1">
              {groupName}
            </SidebarGroupLabel>

            <SidebarMenu className="gap-1">
              {groupItems.map((item) => {
                const isActive = checkIsActive(item);

                if (item.children && item.children.length > 0) {
                  return (
                    <CollapsibleNavItem
                      key={item.title}
                      item={item}
                      checkIsActive={checkIsActive}
                    />
                  );
                }

                // Normal Item
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={cn(
                        "relative !text-[13px] !font-medium !h-10 px-3 transition-all duration-200 border rounded-md flex items-center select-none overflow-hidden active:scale-[0.98]",
                        isActive 
                          ? "bg-primary/10 border-primary/20 text-primary font-semibold hover:bg-primary/15 hover:text-primary shadow-xs" 
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#18181b] hover:text-zinc-900 dark:hover:text-white border-transparent"
                      )}
                      tooltip={{ children: item.title }}
                    >
                      <Link href={item.href as string} prefetch className="flex items-center w-full">
                        {item.icon && (
                          <item.icon
                            className={cn(
                              "mr-3 h-4 w-4 transition-colors duration-200 shrink-0",
                              isActive ? "text-primary" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-300"
                            )}
                          />
                        )}
                        <span className="flex-1 truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        );
      })}
    </>
  );
}
