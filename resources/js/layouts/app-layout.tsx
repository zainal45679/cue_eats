import type { ReactNode } from "react";
import { Toaster } from "@/components/shadcn/ui/sonner";
import { useFlashToaster } from "@/hooks/use-toaster";
import AppLayoutTemplate from "@/layouts/app/app-sidebar-layout";

interface AppLayoutProps {
  children: ReactNode;
}

export default ({ children, ...props }: AppLayoutProps) => {
  useFlashToaster();
  return (
    <AppLayoutTemplate {...props}>
      {children}
      <Toaster duration={4000} position="bottom-right" />
    </AppLayoutTemplate>
  );
};
