import { Head } from "@inertiajs/react";
import { cn } from "@/lib/utils";

import { type BreadcrumbItem, XBreadcrumbs } from "./_components/XBreadcrumbs";

interface XPageProps {
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
  title?: string;
  fullWidth?: boolean;
}

export function XPage({ breadcrumbs, children, title, fullWidth = false }: XPageProps) {
  return (
    <>
      <Head title={title || breadcrumbs?.[breadcrumbs.length - 1]?.label} />
      <div className="space-y-6 print:space-y-0 w-full max-w-full overflow-x-hidden">
        <div className={cn("mx-auto w-full p-4 md:p-6 print:p-0", !fullWidth && "max-w-7xl")}>
          <XBreadcrumbs items={breadcrumbs} className="print:hidden" />
          {children}
        </div>
      </div>
    </>
  );
}
