import { usePage } from "@inertiajs/react";
import { XPage } from "@/components/x/page/XPage";
import { FormMode } from "@/components/x/enum";
import RoleFormPage from "./_components/form-page";

interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  permissions: Permission[];
  users_count: number;
  description?: string;
}

interface PageProps {
  permissions: Permission[];
  role: Role;
  [key: string]: unknown;
}

export default function EditRole({ permissions, role}:PageProps) {
console.log(permissions,role)

  return (
    <XPage
      breadcrumbs={[
        { label: "Roles and Permissions", href: "/roles" },
        { label: "Edit Role", href: `/roles/${role.id}/edit` },
      ]}
    >
      <RoleFormPage
        mode={FormMode.EDIT}
        pageData={role}
        permissions={permissions}
        title={`Edit Role: ${role.name}`}
      />
    </XPage>
  );
}