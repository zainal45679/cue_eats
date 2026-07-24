import { router, usePage } from "@inertiajs/react";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { Button } from "@/components/shadcn/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/shadcn/ui/dropdown-menu";
import type { SharedData } from "@/types";

export function AppHeaderLocationSwitcher() {
  const { auth } = usePage<SharedData>().props;

  // Only show for admins
  if (!auth.roles.includes("admin")) {
    return null;
  }

  const locations = (auth as any).all_business_locations || [];
  const activeLocationId = (auth as any).active_location_id;

  const activeLocation = locations.find((l: any) => l.id === activeLocationId);
  const activeLabel = activeLocation ? activeLocation.location_name : "All Outlets";

  const handleSelect = (id: number | null) => {
    router.post(
      "/set-active-location",
      { location_id: id },
      { preserveScroll: true, preserveState: false }
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="h-8 gap-1 text-sm font-normal">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="hidden sm:inline-block max-w-[120px] truncate">
            {activeLabel}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={() => handleSelect(null)}
          className="justify-between"
        >
          All Outlets
          {!activeLocationId && <Check className="h-4 w-4" />}
        </DropdownMenuItem>
        {locations.map((loc: any) => (
          <DropdownMenuItem
            key={loc.id}
            onClick={() => handleSelect(loc.id)}
            className="justify-between"
          >
            {loc.location_name}
            {activeLocationId === loc.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
