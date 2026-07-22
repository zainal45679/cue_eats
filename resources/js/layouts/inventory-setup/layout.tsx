import { Link } from "@inertiajs/react";
import type { PropsWithChildren } from "react";
import Heading from "@/components/dashboard/heading";
import { Button } from "@/components/shadcn/ui/button";
import { Separator } from "@/components/shadcn/ui/separator";
import { index as indexCountries } from "@/generated/routes/countries";
import { index as indexCurrencyTax } from "@/generated/routes/currency-tax";
import { index as indexBusinessLocations } from "@/generated/routes/business-locations";
import { index as indexStorageLocations } from "@/generated/routes/storage-locations";
import { index as indexUnitsOfMeasure } from "@/generated/routes/units-of-measure";
import { index as indexApprovalConfigurations } from "@/generated/routes/approval-configurations";
import { index as indexInventoryBalances } from "@/generated/routes/inventory-balances";
import { Entity } from "@/lib/permissions";
import { Earth, Building2, Warehouse, FileText, Scale, Settings2, PackageSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem, SharedData } from "@/types";
import { usePage } from "@inertiajs/react";

const sidebarNavItems: (NavItem & { permission?: string })[] = [
  {
    title: "Countries",
    href: indexCountries(),
    icon: null,
    permission: "countries",
  },
  {
    title: "Currency & Tax",
    href: indexCurrencyTax(),
    icon: null,
    permission: "currency-tax",
  },
  {
    title: "Business Locations",
    href: indexBusinessLocations(),
    icon: null,
    permission: "business-locations",
  },
  {
    title: "Storage Locations",
    icon: <Warehouse className="h-4 w-4" />,
    href: indexStorageLocations(),
    permission: "storage-locations",
  },
  {
    title: "Units of Measure",
    icon: <Scale className="h-4 w-4" />,
    href: indexUnitsOfMeasure(),
    permission: "units-of-measure",
  },
  {
    title: "Approval Config",
    icon: <Settings2 className="h-4 w-4" />,
    href: indexApprovalConfigurations(),
    permission: "approval-configurations",
  },
  {
    title: "Inventory Balances",
    icon: <PackageSearch className="h-4 w-4" />,
    href: indexInventoryBalances(),
    permission: "inventory-balances",
  },
];

export default function InventorySetupLayout({ children }: PropsWithChildren) {
  const { auth } = usePage<SharedData>().props;
  
  if (typeof window === "undefined") {
    return null;
  }

  const currentPath = window.location.pathname;

  const filteredNavItems = sidebarNavItems.filter((item) => {
    if (item.permission) {
      const hasPermission = auth.permissions?.some((userPerm) =>
        userPerm.endsWith(`.${item.permission}`)
      );
      if (!hasPermission) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="px-4 py-6">
      <Heading
        description="Configure your inventory locations, units, taxes, and settings."
        title="Inventory Setup"
      />

      <div className="flex flex-col lg:flex-row lg:space-x-12">
        <aside className="w-full max-w-xl lg:w-48">
          <nav className="flex flex-col space-x-0 space-y-1">
            {filteredNavItems.map((item, index) => {
              // We need to resolve the href since it can be an object
              const href = typeof item.href === "string" ? item.href : (item.href as any).url;
              
              // Only link if href is not '#' (to prevent routing errors on unimplemented tabs)
              const isImplemented = href !== "#";

              return (
                <Button
                  asChild
                  className={cn("w-full justify-start", {
                    "bg-muted": currentPath.startsWith(href),
                  })}
                  key={`${href}-${index}`}
                  size="sm"
                  variant="ghost"
                  disabled={!isImplemented}
                >
                  {isImplemented ? (
                    <Link href={href}>
                      {item.title}
                    </Link>
                  ) : (
                    <span>{item.title} (Coming Soon)</span>
                  )}
                </Button>
              );
            })}
          </nav>
        </aside>

        <Separator className="my-6 lg:hidden" />

        <div className="flex-1 w-full max-w-full overflow-hidden">
          <section className="space-y-12">{children}</section>
        </div>
      </div>
    </div>
  );
}
