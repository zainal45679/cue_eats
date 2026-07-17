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

interface PageProps {
  permissions: Permission[];
  [key: string]: unknown;
}

export default function AddRole() {
  const { permissions } = usePage<PageProps>().props;

  return (
    <XPage
      breadcrumbs={[
        { label: "Roles and Permissions", href: "/roles" },
        { label: "Create Role", href: "/roles/add" },
      ]}
    >
      <RoleFormPage
        mode={FormMode.CREATE}
        permissions={permissions}
        title="Create New Role"
      />
    </XPage>
  );
}