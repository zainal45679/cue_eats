import { Link } from "@inertiajs/react";

export type BreadcrumbItem = {
  label: string;
  href?:
    | string
    | { url: string; method: "get" | "post" | "put" | "patch" | "delete" };
};

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

export function XBreadcrumbs({ items }: BreadcrumbsProps) {
  items = items || [];
  items = [{ label: "Dashboard", href: "/dashboard" }, ...items];
  return (
    <nav className="mb-4 flex items-center text-muted-foreground text-sm print:hidden">
      {items.map((item, idx) => (
        <span className="flex items-center" key={item.label}>
          {item.href ? (
            <Link className="hover:underline" href={item.href}>
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
          {idx < items.length - 1 && <span className="mx-2">/</span>}
        </span>
      ))}
    </nav>
  );
}
