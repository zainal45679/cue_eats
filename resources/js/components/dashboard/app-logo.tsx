import clsx from "clsx";
import { AppSettings } from "@/config";
import AppLogoIcon from "./app-logo-icon";
import { usePage } from "@inertiajs/react";

type AppLogoProps = {
  className?: string;
  logoClassName?: string;
  appNameClassName?: string;
};

export default function AppLogo({
  className,
  logoClassName,
  appNameClassName,
}: AppLogoProps) {
  const { organization } = usePage().props as any;
  const logoClasses = clsx(AppSettings.menu?.logo?.className, logoClassName);

  const showLogo = AppSettings.menu?.display?.logo ?? true;
  const showAppName = AppSettings.menu?.display?.appName ?? true;

  const appName = organization?.name || AppSettings.menu?.appName || "App";
  const logoPath = organization?.logo ? `/storage/${organization.logo}` : AppSettings.menu?.logo?.path;

  return (
    <div className={clsx("flex items-center gap-2 w-full overflow-hidden group-data-[collapsible=icon]:justify-center", className)}>
      {showLogo && (
        <div className={clsx(
          "flex items-center justify-start rounded-md shrink-0 transition-all",
          "group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:max-w-full group-data-[collapsible=icon]:w-full",
          showAppName ? "max-w-[30%]" : "max-w-full"
        )}>
          <AppLogoIcon
            className={clsx(logoClasses, "max-w-full group-data-[collapsible=icon]:w-6 group-data-[collapsible=icon]:h-6")}
            path={logoPath}
          />
        </div>
      )}
      {showAppName && (
        <span className={clsx("font-bold text-2xl truncate flex-1 tracking-tight transition-all group-data-[collapsible=icon]:hidden", appNameClassName)}>
          {appName}
        </span>
      )}
    </div>
  );
}
