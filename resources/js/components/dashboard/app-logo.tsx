import clsx from "clsx";
import { AppSettings } from "@/config";
import AppLogoIcon from "./app-logo-icon";

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
  const logoClasses = clsx(AppSettings.menu?.logo?.className, logoClassName);

  const showLogo = AppSettings.menu?.display?.logo ?? true;
  const showAppName = AppSettings.menu?.display?.appName ?? true;

  return (
    <div className={clsx("flex items-center", className)}>
      {showLogo && (
        <div className="flex aspect-square items-center justify-center rounded-md">
          <AppLogoIcon
            className={logoClasses}
            path={AppSettings.menu?.logo?.path}
          />
        </div>
      )}
      {showAppName && (
        <span className={clsx("ml-2 font-semibold text-sm", appNameClassName)}>
          {AppSettings.menu?.appName || "App"}
        </span>
      )}
    </div>
  );
}
