import "./echo";
import "../css/app.css";

import { createInertiaApp } from "@inertiajs/react";
import { resolvePageComponent } from "laravel-vite-plugin/inertia-helpers";
import { createRoot } from "react-dom/client";
import { AppSettings } from "./config";
import { initializeTheme } from "./hooks/use-appearance";

import AppLayout from "@/layouts/app-layout";
import InventorySetupLayout from "@/layouts/inventory-setup/layout";
import SupplyChainLayout from "@/layouts/supply-chain/layout";

const appName = AppSettings.title || "Laravel";

const getInventorySetupLayout = (page: any) => (
  <AppLayout>
    <InventorySetupLayout>{page}</InventorySetupLayout>
  </AppLayout>
);

const getSupplyChainLayout = (page: any) => (
  <AppLayout>
    <SupplyChainLayout>{page}</SupplyChainLayout>
  </AppLayout>
);

const getDefaultLayout = (page: any) => <AppLayout>{page}</AppLayout>;

createInertiaApp({
  title: (title) => (title ? `${title} - ${appName}` : appName),
  resolve: async (name) => {
    const page: any = await resolvePageComponent(
      `./pages/${name}.tsx`,
      import.meta.glob("./pages/**/*.tsx")
    );

    if (name.startsWith("inventory-setup/")) {
      page.default.layout = page.default.layout || getInventorySetupLayout;
    } else if (name.startsWith("supply-chain/")) {
      page.default.layout = page.default.layout || getSupplyChainLayout;
    } else if (!name.startsWith("auth/")) {
      page.default.layout = page.default.layout || getDefaultLayout;
    }
    
    return page;
  },
  setup({ el, App, props }) {
    const root = createRoot(el);

    root.render(<App {...props} />);
  },
  progress: {
    color: "#4B5563",
  },
});

// This will set light / dark mode on load...
initializeTheme();
