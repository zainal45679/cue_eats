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
  MonitorSmartphone,
  Flame,
  FileText
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
  title: "Cue Eats",
  themeColor: "#F05340",
  isDarkForeground: false,
};

export const Configs: TConfigs = {
  mainNavItems: [
    // --- OPERATIONS ---
    {
      title: "Dashboard",
      href: dashboard().url,
      icon: LayoutGrid,
      group: "OPERATIONS",
      adminOnly: true,
    },
    {
      title: "POS Terminal",
      href: "/menu-pos/terminal",
      icon: MonitorSmartphone,
      group: "OPERATIONS",
    },
    {
      title: "Dine-In Tables",
      href: "/menu-pos/tables",
      icon: LayoutGrid,
      group: "OPERATIONS",
    },
    {
      title: "Live Orders",
      href: "/menu-pos/live-orders",
      icon: ClipboardList,
      group: "OPERATIONS",
    },
    
    // --- MANAGEMENT ---
    {
      title: "Menu Management",
      icon: Utensils,
      group: "MANAGEMENT",
      adminOnly: true,
      children: [
        { title: "Menu & Discounts", href: "/menu-pos" },
        { title: "Online Menu on/off", href: "/menu-pos?tab=availability" },
        { title: "Outlet Menu", href: "/menu-pos?tab=outlet-menu" },
      ]
    },
    {
      title: "Inventory Operations",
      icon: Archive,
      group: "MANAGEMENT",
      permission: "inventory-balances",
      children: [
        { title: "Live Stock", href: "/inventory/live-stock" },
        { title: "Inventory Ledger", href: "/inventory/ledger" },
        { title: "Daily Consumption", href: "/inventory/consumption" },
        { title: "Received Goods", href: "/purchasing/grns" },
      ]
    },
    {
      title: "Internal Transfers",
      icon: ArrowRightLeft,
      group: "MANAGEMENT",
      permission: "internal-requests",
      children: [
        { title: "Request Stock", href: "/purchasing/internal-requests" },
        { title: "Receive Stock", href: "/purchasing/stos?type=incoming" },
        { title: "Dispatch Stock", href: "/purchasing/stos?type=outgoing" },
      ]
    },
    {
      title: "External Purchasing",
      icon: Truck,
      group: "MANAGEMENT",
      permission: "purchase-orders",
      children: [
        { title: "Purchase Orders", href: "/purchasing/purchase-orders" },
        { title: "Receive Stock", href: "/purchasing/purchase-orders?type=incoming" },
      ]
    },

    // --- ADMINISTRATION ---
    {
      title: "EOD Reports",
      href: "/menu-pos/reports",
      icon: FileText,
      group: "ADMINISTRATION",
      adminOnly: true,
    },
    {
      title: "Setup & Config",
      icon: Settings2,
      group: "ADMINISTRATION",
      adminOnly: true,
      children: [
        { title: "Supply Chain Setup", href: brands.index().url },
        { title: "Inventory Setup", href: countries.index().url },
      ]
    },
    {
      title: "Settings",
      icon: Settings,
      group: "ADMINISTRATION",
      adminOnly: true,
      children: [
        { title: "Organization", href: "/settings/organization" },
        { title: "Roles and Permissions", href: roles.index().url },
        { title: "Users", href: users.index().url },
        { title: "Profile", href: "/settings/profile" },
        { title: "Password", href: "/settings/password" },
        { title: "Appearance", href: "/settings/appearance" },
      ]
    },
  ],
};
