import { SidebarTrigger } from "@/components/shadcn/ui/sidebar";
import { AppHeaderRight } from "./app-header-right";
import AppHeaderSearch from "./app-header-search";

export function AppSidebarHeader() {
  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b bg-background/10 backdrop-blur-xs transition-[width,height] ease-linear md:rounded-tl-xl md:rounded-tr-xl print:hidden">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2">
        <SidebarTrigger className="-ml-1" />
        <div className="mx-2 h-4 w-px bg-border" />
        <AppHeaderSearch />
        <AppHeaderRight />
      </div>
    </header>
  );
}
