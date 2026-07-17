import { DeleteIcon } from "lucide-react";
import type { XBreadcrumbItem } from "@/components/x/page/XBreadcrumbs";
import { XPage } from "@/components/x/page/XPage";
import { XDataTable } from "@/components/x/table/XDataTable";
import type {
  TXDataTableData,
  XDataTableColumn,
} from "@/components/x/table/XDataTableType";
import { Action, Entity } from "@/lib/permissions";

type Product = {
  id: number;
  name: string;
  type: string;
  cost: number;
  selling_price: number;
  damage_charges: number;
  litres: number;
  quantity: number;
  status: "0" | "1";
};

type ProductProps = {
  products: TXDataTableData<Product>;
};

const columns: XDataTableColumn<Product>[] = [
  {
    id: "name",
    header: "Name",
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "type",
    header: "Type",
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "category",
    header: "Category",
    enableColumnFilter: true,
    enableSorting: true,
  },
  {
    id: "litres",
    header: "Litres",
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
    cell: (props) => (props.row.original.status == "1" ? "Active" : "Inactive"),
  },
];

const breadcrumbs: XBreadcrumbItem[] = [{ label: "Products" }];

export default function Products({ products }: ProductProps) {
  return (
    <XPage breadcrumbs={breadcrumbs}>
      <XDataTable<Product>
        actionBarButtons={[
          {
            label: "Delete",
            variant: "destructive",
            icon: <DeleteIcon />,
            type: "dialog",
            dialog: {
              title: "Are you sure?",
              description:
                "This action cannot be undone. This will permanently delete the selected products.",
              actionLabel: "Yes, Delete",
              cancelLabel: "Cancel",
              icon: <DeleteIcon />,
            },
            permission: {
              entity: Entity.Products,
              action: Action.Delete,
            },
            onAction: (selectedRows) => {
              const ids = selectedRows.map((r) => r.id);
              console.log("Delete products with ids:", ids);
            },
          },
        ]}
        actions={[
          {
            action: "view",
          },
          {
            action: "edit",
          },
          {
            action: "delete",
          },
        ]}
        columns={columns}
        data={products}
        title="Products"
        titleButtons={[
          {
            type: "create",
          },
        ]}
      />
    </XPage>
  );
}
