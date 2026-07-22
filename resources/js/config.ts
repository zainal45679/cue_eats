import {
  LayoutGrid,
  Package,
  Settings,
  ShieldCheck,
  Users,
  Boxes,
} from "lucide-react";
import { dashboard } from "@/generated/routes";
import brands from "@/generated/routes/brands";
import countries from "@/generated/routes/countries";
import currencyTax from "@/generated/routes/currency-tax";
import roles from "@/generated/routes/roles";
import users from "@/generated/routes/users";
import type { NavItem } from "@/types";

type TConfigs = {
  mainNavItems: NavItem[];
};

export type AppConfig = {
  menu?: {
    appName?: string;
    display?: {
      logo?: boolean;
      appName?: boolean;
    };
    logo?: {
      path?: string;
      className?: string;
    };
  };
  login?: {
    logo?: {
      path?: string;
      className?: string;
    };
  };
  title: string;
  defaultLogo?: {
    path?: string;
    className?: string;
  };
  themeColor: string;
  isDarkForeground?: boolean;
};

export const AppSettings: AppConfig = {
  menu: {
    appName: "Laravel Starter Kit",
    display: {
      logo: true,
      appName: false,
    },
    logo: {
      className: "size-20 fill-current text-white",
    },
  },
  login: {
    logo: {
      className: "size-10 fill-current text-white",
    },
  },
  defaultLogo: {
    path: "/logo.svg",
    className: "size-10 fill-current text-white",
  },
  title: "Laravel StarterKit",
  themeColor: "#F05340",
  isDarkForeground: false,
};

export const Configs: TConfigs = {
  mainNavItems: [
    {
      title: "Dashboard",
      href: dashboard().url,
      icon: LayoutGrid,
    },
    {
      title: "Supply Chain",
      href: brands.index().url,
      icon: Boxes,
      group: "Procurement & Inventory",
      permission: "brands",
    },
    {
      title: "Inventory Setup",
      href: countries.index().url,
      icon: Settings,
      group: "Procurement & Inventory",
      permission: "countries",
    },
    {
      title: "Roles and Permissions",
      href: roles.index().url,
      icon: ShieldCheck,
      group: "Access Control",
      permission: "roles",
      adminOnly: true,
    },
    {
      title: "Users",
      href: users.index().url,
      icon: Users,
      group: "Access Control",
      permission: "users",
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/settings/profile",
      group: "Access Control",
    },
  ],
};
