import type { PropsWithChildren } from "react";
import { AppContent } from "@/components/dashboard/app-content";
import { AppShell } from "@/components/dashboard/app-shell";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { AppSidebarHeader } from "@/components/dashboard/app-sidebar-header";
import { ScrollArea } from "@/components/shadcn/ui/scroll-area";

export default function AppSidebarLayout({ children }: PropsWithChildren) {
  return (
    <AppShell variant="sidebar">
      <AppSidebar />
      <ScrollArea
        className="relative flex h-screen w-full flex-1 flex-col md:peer-data-[variant=inset]:pr-2"
        type="scroll"
      >
        <AppContent
          className="relative flex min-h-svh w-full flex-1 flex-col peer-data-[variant=inset]:min-h-[calc(100svh-(--spacing(4))-16px)] md:m-2 md:ml-0 md:min-h-[calc(100svh-16px)] md:rounded-xl md:peer-data-[state=collapsed]:ml-2"
          variant="sidebar"
        >
          <AppSidebarHeader />
          {children}
        </AppContent>
      </ScrollArea>
    </AppShell>
  );
}
