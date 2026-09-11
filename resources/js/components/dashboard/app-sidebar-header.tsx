import { SidebarTrigger } from "@/components/shadcn/ui/sidebar";
import { AppHeaderRight } from "./app-header-right";
import AppHeaderSearch from "./app-header-search";
import { usePage } from "@inertiajs/react";

export function AppSidebarHeader() {
  const { url } = usePage();
  const posTitle = url.startsWith('/menu-pos/tables')
    ? 'Dine-In Floor'
    : url.startsWith('/menu-pos/terminal')
    ? 'POS Terminal'
    : url.startsWith('/menu-pos/live-orders')
    ? 'Live Orders'
    : null;

  return (
    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-2 border-b border-slate-200/80 dark:border-zinc-800 bg-slate-100/90 dark:bg-[#0c0c0e]/90 backdrop-blur-md transition-[width,height] ease-linear md:rounded-tl-xl md:rounded-tr-xl print:hidden">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2">
        <SidebarTrigger className="-ml-1" />
        <div className="mx-2 h-4 w-px bg-border" />
        {posTitle ? (
          <div className="flex-1 flex items-center gap-2 text-sm font-semibold text-foreground/80">
            <span>{posTitle}</span>
          </div>
        ) : (
          <AppHeaderSearch />
        )}
        <AppHeaderRight />
      </div>
    </header>
  );
}
