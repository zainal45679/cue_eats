import {
  LayoutGrid,
  Package,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { dashboard } from "@/generated/routes";
import products from "@/generated/routes/products";
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
      href: dashboard(),
      icon: LayoutGrid,
    },
    {
      title: "Product",
      href: products.index(),
      icon: Package,
      group: "Operations",
      permission: "products",
    },
    {
      title: "Roles and Permissions",
      href: roles.index(),
      icon: ShieldCheck,
      group: "Access Control",
      permission: "roles",
    },
    {
      title: "Users",
      href: users.index(),
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
