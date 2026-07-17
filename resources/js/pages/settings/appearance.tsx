import { Head } from "@inertiajs/react";

import AppearanceTabs from "@/components/dashboard/appearance-tabs";
import HeadingSmall from "@/components/dashboard/heading-small";

import AppLayout from "@/layouts/app-layout";
import SettingsLayout from "@/layouts/settings/layout";

export default function Appearance() {
  return (
    <AppLayout>
      <Head title="Appearance settings" />

      <SettingsLayout>
        <div className="space-y-6">
          <HeadingSmall
            description="Update your account's appearance settings"
            title="Appearance settings"
          />
          <AppearanceTabs />
        </div>
      </SettingsLayout>
    </AppLayout>
  );
}
