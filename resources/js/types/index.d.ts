import type { LucideIcon } from "lucide-react";

export interface Auth {
  user: User;
  permissions: string[];
  roles: string[];
}

export interface BreadcrumbItem {
  title: string;
  href: string;
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export interface NavItem {
  title: string;
  href?: NonNullable<InertiaLinkProps["href"]>;
  icon?: LucideIcon | null;
  isActive?: boolean;
  children?: NavItem[];
  group?: string;
  permission?: string;
  adminOnly?: boolean;
}

export interface SharedData {
  name: string;
  auth: Auth;
  sidebarOpen: boolean;
  flash: {
    message?: string;
    success?: string;
    error?: string;
  };
  [key: string]: unknown;
}

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown; // This allows for additional properties...
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = T & {
  auth: Auth;
  appearance?: string;
  status?: string;
  flash: {
    success?: string;
    error?: string;
    message?: string;
  };
  [key: string]: unknown;
};
