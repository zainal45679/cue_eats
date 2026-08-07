import { useEffect } from "react";
import { usePage } from "@inertiajs/react";
import { Toaster } from "@/components/shadcn/ui/sonner";
import AuthLayoutTemplate from "@/layouts/auth/auth-simple-layout";
import { applyThemeColor } from "@/lib/themeConfig";
import { AppSettings } from "@/config";

export default function AuthLayout({
  children,
  title,
  description,
  ...props
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  const { organization } = usePage().props as any;

  useEffect(() => {
    applyThemeColor(organization?.theme_color || AppSettings.themeColor);
  }, [organization?.theme_color]);

  return (
    <AuthLayoutTemplate description={description} title={title} {...props}>
      {children}
      <Toaster duration={4000} position="bottom-right" />
    </AuthLayoutTemplate>
  );
}
