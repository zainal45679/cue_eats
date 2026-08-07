import { Head } from "@inertiajs/react";

import { type BreadcrumbItem, XBreadcrumbs } from "./_components/XBreadcrumbs";

interface XPageProps {
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
  title?: string;
}

export function XPage({ breadcrumbs, children, title }: XPageProps) {
  return (
    <>
      <Head title={title || breadcrumbs?.[breadcrumbs.length - 1]?.label} />
      <div className="space-y-6 print:space-y-0 w-full max-w-full overflow-x-hidden">
        <div className="mx-auto w-full max-w-7xl p-5 print:p-0">
          <XBreadcrumbs items={breadcrumbs} className="print:hidden" />
          {children}
        </div>
      </div>
    </>
  );
}
