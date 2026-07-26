import { useEffect } from "react";
import { usePage } from "@inertiajs/react";
import type { ReactNode } from "react";
import { Toaster } from "@/components/shadcn/ui/sonner";
import { useFlashToaster } from "@/hooks/use-toaster";
import AppLayoutTemplate from "@/layouts/app/app-sidebar-layout";
import { applyThemeColor } from "@/lib/themeConfig";
import { AppSettings } from "@/config";

interface AppLayoutProps {
  children: ReactNode;
}

export default ({ children, ...props }: AppLayoutProps) => {
  useFlashToaster();
  const { organization } = usePage().props as any;

  useEffect(() => {
    applyThemeColor(organization?.theme_color || AppSettings.themeColor);
  }, [organization?.theme_color]);

  return (
    <AppLayoutTemplate {...props}>
      {children}
      <Toaster duration={4000} position="bottom-right" />
    </AppLayoutTemplate>
  );
};
