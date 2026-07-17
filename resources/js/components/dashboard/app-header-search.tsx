import { router } from "@inertiajs/react";
import { Command, Search } from "lucide-react";
import React, { useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Button } from "@/components/shadcn/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/shadcn/ui/command";
import { Configs } from "@/config";

export default function AppHeaderSearch() {
  const [open, setOpen] = useState(false);

  useHotkeys("mod+k", (e) => {
    e.preventDefault();
    setOpen((prev) => !prev);
  });

  const mainNavItems = Configs.mainNavItems;

  return (
    <div className="lg:flex-1">
      <Button
        className="relative hidden w-full max-w-sm flex-1 px-2! lg:flex"
        onClick={() => setOpen(true)}
        variant="outline"
      >
        <Search className="h-4 w-4 text-muted-foreground" />
        <p className="text-muted-foreground text-sm">Search...</p>
        <kbd className="ml-auto hidden items-center gap-0.5 rounded-sm bg-zinc-200 p-1 font-medium font-mono text-xs sm:flex dark:bg-neutral-700">
          <Command className="size-3" />
          <span>+</span>
          <span>k</span>
        </kbd>
      </Button>

      <div className="block lg:hidden">
        <Button onClick={() => setOpen(true)} size="icon" variant="ghost">
          <Search className="h-5 w-5" />
        </Button>
      </div>

      <CommandDialog onOpenChange={setOpen} open={open}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {(() => {
            const flattenedItems = mainNavItems.flatMap((item) =>
              item.children
                ? item.children.map((child) => ({
                    ...child,
                    group: item.group,
                  }))
                : [item]
            );
            const groupedItems = flattenedItems.reduce(
              (acc, item) => {
                const group = item.group || "";
                if (!acc[group]) acc[group] = [];
                acc[group].push(item);
                return acc;
              },
              {} as Record<string, typeof flattenedItems>
            );
            return Object.entries(groupedItems).flatMap(
              ([groupName, groupItems], index) => [
                ...(index > 0
                  ? [<CommandSeparator key={`sep-${index}`} />]
                  : []),
                <CommandGroup heading={groupName || undefined} key={groupName}>
                  {groupItems.map((navItem) => (
                    <CommandItem
                      key={navItem.href}
                      onSelect={() => router.visit(navItem.href)}
                    >
                      {navItem.icon ? React.createElement(navItem.icon) : null}
                      <span>{navItem.title}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>,
              ]
            );
          })()}
        </CommandList>
      </CommandDialog>
    </div>
  );
}
