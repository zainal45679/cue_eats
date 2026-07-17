import { Link, usePage } from "@inertiajs/react";
import { Moon, Settings, Sun } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn/ui/avatar";
import { Button } from "@/components/shadcn/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/shadcn/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/ui/tooltip";
import { useAppearance } from "@/hooks/use-appearance";
import { useInitials } from "@/hooks/use-initials";
import type { SharedData } from "@/types";
import { UserMenuContent } from "./user-menu-content";

export function AppHeaderRight() {
  const { appearance, updateAppearance } = useAppearance();

  const { auth } = usePage<SharedData>().props;

  const getInitials = useInitials();

  const user = auth.user;

  const toggleTheme = () => {
    if (appearance === "light") {
      updateAppearance("dark");
    } else {
      updateAppearance("light");
    }
  };

  const isDark =
    appearance === "dark" ||
    (appearance === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);

  return (
    <TooltipProvider>
      <div className="ml-auto flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button onClick={toggleTheme} size="icon" variant="ghost">
              {isDark ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle theme</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/settings/profile">
              <Button size="icon" variant="ghost">
                <Settings className="h-5 w-5 animate-tada" />
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>

        <div className="mx-2 h-4 w-px bg-border" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-8 w-8 cursor-pointer overflow-hidden rounded-full">
              <AvatarImage alt={user.name} src={user.avatar} />
              <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side="bottom"
          >
            <UserMenuContent user={auth.user} />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </TooltipProvider>
  );
}
