import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/shadcn/ui/avatar";
import { useInitials } from "@/hooks/use-initials";
import type { User } from "@/types";

export function UserInfo({
  user,
  showEmail = false,
}: {
  user: User;
  showEmail?: boolean;
}) {
  const getInitials = useInitials();

  return (
    <>
      <Avatar className="h-8 w-8 overflow-hidden rounded-full">
        <AvatarImage alt={user?.name} src={user?.avatar} />
        <AvatarFallback className="rounded-full bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-white font-medium text-xs">
          {getInitials(user?.name)}
        </AvatarFallback>
      </Avatar>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium text-zinc-900 dark:text-white">{user?.name}</span>
        <span className="truncate text-zinc-500 dark:text-zinc-400 text-xs">
            {showEmail ? user?.email : "Administrator"}
        </span>
      </div>
    </>
  );
}
