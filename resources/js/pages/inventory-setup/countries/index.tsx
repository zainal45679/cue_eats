import { DeleteIcon } from "lucide-react";
import type { XBreadcrumbItem } from "@/components/x/page/XBreadcrumbs";
import { XPage } from "@/components/x/page/XPage";
import { XDataTable } from "@/components/x/table/XDataTable";
import type {
  TXDataTableData,
  XDataTableColumn,
} from "@/components/x/table/XDataTableType";
import { Action, Entity } from "@/lib/permissions";

type Country = {
  id: number;
  name: string;
  status: "0" | "1" | boolean;
};

type CountryProps = {
  countries: TXDataTableData<Country>;
};

const columns: XDataTableColumn<Country>[] = [
  {
    id: "name",
    header: "Name",
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "status",
    header: "Status",
    meta: {
      label: "Status",
      variant: "multiSelect",
      options: [
        { label: "Active", value: "1" },
        { label: "Inactive", value: "0" },
      ],
    },
    enableColumnFilter: true,
    cell: (props) => (props.row.original.status == "1" || props.row.original.status === true ? "Active" : "Inactive"),
  },
];

import { Head } from "@inertiajs/react";

export default function Countries({ countries }: CountryProps) {
  return (
    <>
      <Head title="Countries" />
      <div className="space-y-6">
        <XDataTable<Country>
          actionBarButtons={[
            {
              label: "Delete",
              variant: "destructive",
              icon: <DeleteIcon />,
              type: "dialog",
              dialog: {
                title: "Are you sure?",
                description:
                  "This action cannot be undone. This will permanently delete the selected countries.",
                actionLabel: "Yes, Delete",
                cancelLabel: "Cancel",
                icon: <DeleteIcon />,
              },
              permission: {
                entity: Entity.Countries,
                action: Action.Delete,
              },
              onAction: (selectedRows) => {
                const ids = selectedRows.map((r) => r.id);
                console.log("Delete countries with ids:", ids);
                // Actual bulk delete is typically handled via a specific endpoint
              },
            },
          ]}
          actions={[
            { action: "view" },
            { action: "edit" },
            { action: "delete" },
          ]}
          columns={columns}
          data={countries}
          title="Countries"
          titleButtons={[{ type: "create" }]}
        />
      </div>
    </>
  );
}
