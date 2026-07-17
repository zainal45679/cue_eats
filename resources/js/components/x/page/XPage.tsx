import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { type BreadcrumbItem, XBreadcrumbs } from "./_components/XBreadcrumbs";

interface XPageProps {
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
  title?: string;
}

export function XPage({ breadcrumbs, children, title }: XPageProps) {
  return (
    <AppLayout>
      <Head title={title || breadcrumbs?.[breadcrumbs.length - 1]?.label} />
      <div className="space-y-6">
        <div className="mx-auto w-full p-5">
          <XBreadcrumbs items={breadcrumbs} />
          {children}
        </div>
      </div>
    </AppLayout>
  );
}
