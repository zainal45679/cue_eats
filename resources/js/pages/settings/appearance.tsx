import { Head } from "@inertiajs/react";

import AppearanceTabs from "@/components/dashboard/appearance-tabs";
import HeadingSmall from "@/components/dashboard/heading-small";

import { XPage } from "@/components/x/page/XPage";

export default function Appearance() {
  return (
    <XPage title="Appearance">
      <div className="space-y-6 max-w-2xl">
        <HeadingSmall
          description="Update your account's appearance settings"
          title="Appearance settings"
        />
        <AppearanceTabs />
      </div>
    </XPage>
  );
}
