import z from "zod";
import { XFormInput } from "@/components/x/form/components/XFormInput";
import { XFormSelect } from "@/components/x/form/components/XFormSelect";
import { useXFormDialog, XFormDialog } from "@/components/x/form/XFormDialog";
import type { XBreadcrumbItem } from "@/components/x/page/XBreadcrumbs";
import { XPage } from "@/components/x/page/XPage";
import { XDataTable } from "@/components/x/table/XDataTable";
import type {
  TXDataTableData,
  XDataTableColumn,
} from "@/components/x/table/XDataTableType";

type User = {
  id: number;
  name: string;
  email: string;
  status: "0" | "1";
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

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  role: z.string(),
  password: z.string().min(6).max(100),
});

const breadcrumbs: XBreadcrumbItem[] = [{ label: "Users" }];

type TSchema = z.infer<typeof schema>;

const initialValues: TSchema = {
  name: "",
  email: "",
  role: "",
  password: "",
};

export default function Users({ users }: UsersPageProps) {
  const { dialog, openDialog } = useXFormDialog<TSchema>();

  return (
    <XPage breadcrumbs={breadcrumbs}>
      <XFormDialog
        action="/users"
        dialog={dialog}
        schema={schema}
        title="Create User"
      >
        <XFormInput<TSchema> label="Name" name="name" />
        <XFormSelect<TSchema>
          label="Role"
          name="role"
          onSearch={{
            url: "/roles/search",
            transform: (data) =>
              data.map((role: { id: number; name: string }) => ({
                value: role.name,
                label: role.name,
              })),
          }}
          options={[]}
          placeholder="Select a role..."
        />
        <XFormInput<TSchema> label="Email" name="email" type="email" />
        <XFormInput<TSchema> label="Password" name="password" type="password" />
      </XFormDialog>

      <XDataTable<User>
        actions={[
          {
            action: "view",
          },
          {
            action: "edit",
            onClick: (row) => {
              openDialog({
                name: row.name,
                email: row.email,
                role: "",
                password: "",
              });
            },
          },
          {
            action: "delete",
          },
        ]}
        columns={columns}
        data={users}
        title="Users"
        titleButtons={[
          {
            type: "create",
            label: "Create User",
            onClick: () => {
              openDialog(initialValues);
            },
          },
        ]}
      />
    </XPage>
  );
}
