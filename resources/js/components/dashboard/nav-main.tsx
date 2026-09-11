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
            "group cursor-pointer !text-[13px] !font-medium !h-10 px-3 transition-colors border",
            isActive 
              ? "bg-[#f97316]/10 border-[#f97316]/30 text-[#f97316] hover:bg-[#f97316]/20 hover:text-[#f97316]" 
              : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#18181b] hover:text-zinc-900 dark:hover:text-white border-transparent"
          )}
          tooltip={{ children: item.title }}
        >
          {firstHref ? (
            <Link href={firstHref} prefetch onClick={handleHeaderClick}>
              {item.icon && (
                <item.icon
                  className={cn(
                    "mr-3 h-4 w-4 transition-colors",
                    isActive ? "text-[#f97316]" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-300"
                  )}
                />
              )}
              <span className="flex-1">{item.title}</span>
              <ChevronRight className={cn("ml-auto h-4 w-4 transition-transform duration-200", isOpen ? "rotate-90" : "rotate-0", isActive ? "text-[#f97316]" : "opacity-50")} />
            </Link>
          ) : (
            <CollapsibleTrigger className="w-full flex items-center">
              {item.icon && (
                <item.icon
                  className={cn(
                    "mr-3 h-4 w-4 transition-colors",
                    isActive ? "text-[#f97316]" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-300"
                  )}
                />
              )}
              <span className="flex-1">{item.title}</span>
              <ChevronRight className={cn("ml-auto h-4 w-4 transition-transform duration-200", isOpen ? "rotate-90" : "rotate-0", isActive ? "text-[#f97316]" : "opacity-50")} />
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
                      "!text-[13px] !h-9 px-3 transition-colors rounded-md flex items-center bg-transparent border-transparent",
                      isChildActive
                        ? "!text-[#f97316] font-semibold !bg-transparent !border-transparent"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#18181b] hover:text-zinc-900 dark:hover:text-white"
                    )}
                  >
                    <Link href={child.href as string} prefetch>
                      {child.title}
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
                        "!text-[13px] !font-medium !h-10 px-3 transition-colors",
                        isActive 
                          ? "bg-[#f97316]/10 border border-[#f97316]/30 text-[#f97316] hover:bg-[#f97316]/20 hover:text-[#f97316]" 
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-[#18181b] hover:text-zinc-900 dark:hover:text-white border border-transparent"
                      )}
                      tooltip={{ children: item.title }}
                    >
                      <Link href={item.href as string} prefetch>
                        {item.icon && (
                          <item.icon
                            className={cn(
                              "mr-3 h-4 w-4 transition-colors",
                              isActive ? "text-[#f97316]" : "text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-800 dark:group-hover:text-zinc-300"
                            )}
                          />
                        )}
                        <span>{item.title}</span>
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
