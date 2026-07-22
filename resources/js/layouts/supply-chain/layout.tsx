import { Link } from "@inertiajs/react";
import type { PropsWithChildren } from "react";
import Heading from "@/components/dashboard/heading";
import { Button } from "@/components/shadcn/ui/button";
import { Separator } from "@/components/shadcn/ui/separator";
import { index as indexBrands } from "@/generated/routes/brands";
import { index as indexIngredientCategories } from "@/generated/routes/ingredient-categories";
import { index as indexIngredients } from "@/generated/routes/ingredients";
import { index as indexPaymentTerms } from "@/generated/routes/payment-terms";
import { index as indexSuppliers } from "@/generated/routes/suppliers";
import { index as indexIngredientSuppliers } from "@/generated/routes/ingredient-suppliers";
import { Tag, FolderTree, PackageOpen, CreditCard, Users, Network, Map } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NavItem, SharedData } from "@/types";
import { usePage } from "@inertiajs/react";

const sidebarNavItems: (NavItem & { permission?: string })[] = [
  {
    title: "Brands",
    href: indexBrands().url,
    icon: <Tag className="h-4 w-4" />,
    permission: "brands",
  },
  {
    title: "Ingredient Categories",
    href: indexIngredientCategories().url,
    icon: <FolderTree className="h-4 w-4" />,
    permission: "ingredient-categories",
  },
  {
    title: "Ingredients",
    href: indexIngredients().url,
    icon: <PackageOpen className="h-4 w-4" />,
    permission: "ingredients",
  },
  {
    title: "Payment Terms",
    href: indexPaymentTerms().url,
    icon: <CreditCard className="h-4 w-4" />,
    permission: "payment-terms",
  },
  {
    title: "Suppliers",
    href: indexSuppliers().url,
    icon: <Users className="h-4 w-4" />,
    permission: "suppliers",
  },
  {
    title: "Supplier Items",
    href: indexIngredientSuppliers().url,
    icon: <Network className="h-4 w-4" />,
    permission: "ingredient-suppliers",
  },
];

export default function SupplyChainLayout({ children }: PropsWithChildren) {
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
        description="Manage your brands, ingredients, suppliers, and procurement configurations."
        title="Supply Chain"
      />

      <div className="flex flex-col lg:flex-row lg:space-x-12">
        <aside className="w-full max-w-xl lg:w-48">
          <nav className="flex flex-col space-x-0 space-y-1">
            {filteredNavItems.map((item, index) => {
              const href = item.href as string;
              const isImplemented = href !== "#";

              return (
                <Button
                  asChild
                  className={cn("w-full justify-start", {
                    "bg-muted": currentPath.startsWith(href) && isImplemented,
                  })}
                  key={`${href}-${index}`}
                  size="sm"
                  variant="ghost"
                  disabled={!isImplemented}
                >
                  {isImplemented ? (
                    <Link href={href}>
                      <span className="mr-2">{item.icon}</span>
                      {item.title}
                    </Link>
                  ) : (
                    <span>
                      <span className="mr-2">{item.icon}</span>
                      {item.title}
                    </span>
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
