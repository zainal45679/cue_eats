import {
  LayoutGrid,
  Settings,
  ShieldCheck,
  Users,
  Boxes,
  History,
  ArrowRightLeft,
  ClipboardList,
  Truck,
  PackageCheck,
  ShoppingCart,
  Network,
  Settings2,
  Archive,
  User,
  Lock,
  Palette,
  Building2,
  Utensils,
  MonitorSmartphone
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
      appName: true,
    },
    logo: {
      className: "h-8 w-auto fill-current text-white",
    },
  },
  login: {
    logo: {
      className: "h-10 w-auto fill-current text-white",
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
      title: "Live Stock",
      href: "/inventory/live-stock",
      icon: Archive,
      group: "Inventory Operations",
    },
    {
      title: "Inventory Ledger",
      href: "/inventory/ledger",
      icon: History,
      group: "Inventory Operations",
    },
    {
      title: "Received Goods",
      href: "/purchasing/grns",
      icon: PackageCheck,
      group: "Inventory Operations",
    },
    {
      title: "Request Stock",
      href: "/purchasing/internal-requests",
      icon: ArrowRightLeft,
      group: "Internal Transfers",
      permission: "internal-requests",
    },
    {
      title: "Receive Stock",
      href: "/purchasing/stos?type=incoming",
      icon: PackageCheck,
      group: "Internal Transfers",
    },
    {
      title: "Dispatch Stock",
      href: "/purchasing/stos?type=outgoing",
      icon: Boxes,
      group: "Internal Transfers",
    },
    {
      title: "Purchase Orders",
      href: "/purchasing/purchase-orders",
      icon: Truck,
      group: "External Purchasing",
      permission: "purchase-orders",
    },
    {
      title: "Receive Stock",
      href: "/purchasing/purchase-orders?type=incoming",
      icon: PackageCheck,
      group: "External Purchasing",
      permission: "purchase-orders",
    },
    {
      title: "Supply Chain Setup",
      href: brands.index().url,
      icon: Network,
      group: "Setup & Config",
      permission: "brands",
    },
    {
      title: "POS Terminal",
      href: "/menu-pos/terminal",
      icon: MonitorSmartphone,
    },
    {
      title: "Menu Management",
      href: "/menu-pos",
      icon: Utensils,
    },
    {
      title: "Inventory Setup",
      href: countries.index().url,
      icon: Settings2,
      group: "Setup & Config",
      permission: "countries",
    },
    {
      title: "Organization",
      href: "/settings/organization",
      icon: Building2,
      group: "Settings",
      adminOnly: true,
    },
    {
      title: "Roles and Permissions",
      href: roles.index().url,
      icon: ShieldCheck,
      group: "Settings",
      permission: "roles",
      adminOnly: true,
    },
    {
      title: "Users",
      href: users.index().url,
      icon: Users,
      group: "Settings",
      permission: "users",
    },
    {
      title: "Profile",
      href: "/settings/profile",
      icon: User,
      group: "Settings",
    },
    {
      title: "Password",
      href: "/settings/password",
      icon: Lock,
      group: "Settings",
    },
    {
      title: "Appearance",
      href: "/settings/appearance",
      icon: Palette,
      group: "Settings",
    },
  ],
};
