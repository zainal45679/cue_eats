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
    <div className={clsx("flex items-center gap-2 w-full overflow-hidden", className)}>
      {showLogo && (
        <div className={clsx("flex items-center justify-start rounded-md shrink-0", showAppName ? "max-w-[30%]" : "max-w-full")}>
          <AppLogoIcon
            className={clsx(logoClasses, "max-w-full")}
            path={logoPath}
          />
        </div>
      )}
      {showAppName && (
        <span className={clsx("font-bold text-2xl truncate flex-1 tracking-tight", appNameClassName)}>
          {appName}
        </span>
      )}
    </div>
  );
}
