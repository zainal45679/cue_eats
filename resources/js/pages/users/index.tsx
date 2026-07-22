import { usePage } from "@inertiajs/react";
import type { XBreadcrumbItem } from "@/components/x/page/XBreadcrumbs";
import { XPage } from "@/components/x/page/XPage";
import { XDataTable } from "@/components/x/table/XDataTable";
import type {
  TXDataTableData,
  XDataTableColumn,
} from "@/components/x/table/XDataTableType";
import type { SharedData } from "@/types";

type User = {
  id: number;
  uuid: string;
  name: string;
  email: string;
  status: "0" | "1";
  business_location?: {
    location_name: string;
  };
  creator?: {
    name: string;
  };
};

type UsersPageProps = {
  users: TXDataTableData<User>;
};

const columns: XDataTableColumn<User>[] = [
  {
    id: "name",
    header: "Name",
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "email",
    header: "Email",
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "branch",
    header: "Assigned Branch",
    accessorFn: (row) => row.business_location?.location_name || "Global Admin",
    enableColumnFilter: false,
    enableSorting: false,
  },
  {
    id: "created_by",
    header: "Created By",
    accessorFn: (row) => row.creator?.name || "System Admin",
    enableColumnFilter: false,
    enableSorting: false,
  },
  {
    id: "status",
    header: "Status",
    meta: {
      label: "Status",
      variant: "multiSelect" as const,
      options: [
        { label: "Active", value: "1" },
        { label: "Inactive", value: "0" },
      ],
    },
    enableColumnFilter: true,
    enableSorting: false,
  },
];

const breadcrumbs: XBreadcrumbItem[] = [{ label: "Users" }];

export default function Users({ users }: UsersPageProps) {
  const { auth } = usePage<SharedData>().props;
  const isAdmin = auth.roles?.includes("admin");

  return (
    <XPage breadcrumbs={breadcrumbs}>
      <XDataTable<User>
        actions={[
          {
            action: "edit",
            url: (row) => `/users/${row.uuid}/edit`,
          },
          {
            action: "delete",
            url: (row) => `/users/${row.uuid}`,
          },
        ]}
        columns={columns}
        data={users}
        title="Users"
        titleButtons={[
          {
            type: "create",
            label: "Create User",
            link: "/users/create",
          },
        ]}
      />
    </XPage>
  );
}
