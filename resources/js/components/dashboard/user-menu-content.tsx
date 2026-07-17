import { Link, router } from "@inertiajs/react";
import { LogOut, Settings } from "lucide-react";
import { UserInfo } from "@/components/dashboard/user-info";
import {
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/shadcn/ui/dropdown-menu";
import { logout } from "@/generated/routes";
import { edit } from "@/generated/routes/profile";
import { useMobileNavigation } from "@/hooks/use-mobile-navigation";
import type { User } from "@/types";

type UserMenuContentProps = {
  user: User;
};

export function UserMenuContent({ user }: UserMenuContentProps) {
  const cleanup = useMobileNavigation();

  const handleLogout = () => {
    cleanup();
    router.flushAll();
  };

  return (
    <>
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <UserInfo showEmail={true} user={user} />
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem asChild>
          <Link
            as="div"
            className="block w-full cursor-pointer"
            href={edit()}
            onClick={cleanup}
            prefetch
          >
            <Settings className="mr-2" />
            Settings
          </Link>
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild>
        <Link
          as="div"
          className="block w-full cursor-pointer"
          data-test="logout-button"
          href={logout()}
          onClick={handleLogout}
        >
          <LogOut className="mr-2" />
          Log out
        </Link>
      </DropdownMenuItem>
    </>
  );
}
