import { ChevronDown, ChevronRight, Shield } from "lucide-react";
import { useState } from "react";
import z from "zod";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/shadcn/ui/collapsible";
import { Label } from "@/components/shadcn/ui/label";
import { ScrollArea } from "@/components/shadcn/ui/scroll-area";
import { FormMode } from "@/components/x/enum";
import { XFormInput } from "@/components/x/form/components/XFormInput";
import { XFormTextArea } from "@/components/x/form/components/XFormTextArea";
import { XLaravelForm } from "@/components/x/form/XLaravelForm";
import { AppSettings } from "@/config";
import { Entity } from "@/lib/permissions";

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

type RoleFormPageProps = {
  mode?: FormMode;
  pageData?: Role;
  permissions: Permission[];
  title: string;
};

const schema = z.object({
  name: z.string().min(1, "Role name is required"),
  description: z.string().optional(),
  permissions: z.array(z.number()).optional().default([]),
});

export default function RoleFormPage({
  title,
  pageData,
  permissions,
  mode = FormMode.CREATE,
}: RoleFormPageProps) {
  const isEdit = mode === FormMode.EDIT;
  const [expandedCategories, setExpandedCategories] = useState<string[]>([
    "Product Management",
    "Role Management",
  ]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>(
    pageData?.permissions.map((p) => p.id) || []
  );

  type TSchema = z.infer<typeof schema>;
  const initialValues: TSchema = {
    name: pageData?.name || "",
    description: pageData?.description || "",
    permissions: pageData?.permissions.map((p) => p.id) || [],
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const permissionCategories = permissions.reduce(
    (acc, permission) => {
      let category = "Other";
      if (permission.name.includes(Entity.Products)) {
        category = "Product Management";
      } else if (permission.name.includes(Entity.Roles)) {
        category = "Role Management";
      } else if (permission.name.includes(Entity.Users)) {
        category = "User Management";
      }
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
      return acc;
    },
    {} as Record<string, Permission[]>
  );

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  return (
    <XLaravelForm
      action={isEdit ? `/roles/${pageData?.id}` : "/roles"}
      cardClassName="mb-8"
      defaultValues={initialValues}
      method={isEdit ? "put" : "post"}
      schema={schema}
      title={title || (isEdit ? "Edit Role" : "Create Role")}
      transform={(data) => ({
        ...data,
        permissions: selectedPermissions,
      })}
    >
      <XFormInput<TSchema>
        label="Role Name"
        name="name"
        placeholder="Enter role name (e.g., Manager, Editor)"
        wrapperClassName="md:col-span-2 col-span-2"
      />

      <XFormTextArea<TSchema>
        label="Description"
        name="description"
        placeholder="Describe the role's purpose and responsibilities"
        wrapperClassName="md:col-span-2 col-span-2"
      />

      {/* Permissions Section */}
      <div className="col-span-full space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <Label className="font-semibold text-base">Assign Permissions</Label>
        </div>

        <ScrollArea className="h-96 w-full rounded-md border p-4">
          <div className="space-y-4">
            {Object.entries(permissionCategories).map(
              ([categoryName, categoryPermissions]) => (
                <Collapsible
                  key={categoryName}
                  onOpenChange={() => toggleCategory(categoryName)}
                  open={expandedCategories.includes(categoryName)}
                >
                  <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md p-2 text-left hover:bg-muted">
                    <span className="font-medium">{categoryName}</span>
                    {expandedCategories.includes(categoryName) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 ml-4 space-y-2">
                    {categoryPermissions.map((permission) => (
                      <div
                        className="flex items-start space-x-2"
                        key={permission.id}
                      >
                        <input
                          checked={selectedPermissions.includes(permission.id)}
                          className="mt-0.5 h-4 w-4 rounded border-gray-300"
                          id={`permission-${permission.id}`}
                          name="permissions[]"
                          onChange={() => handlePermissionToggle(permission.id)}
                          style={{ accentColor: AppSettings.themeColor }}
                          type="checkbox"
                          value={permission.id}
                        />

                        <div className="grid gap-1.5 leading-none">
                          <label
                            className="cursor-pointer font-medium text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            htmlFor={`permission-${permission.id}`}
                          >
                            {permission.name}
                          </label>

                          <p className="text-muted-foreground text-xs">
                            Permission to{" "}
                            {permission.name.replace(/[_-]/g, " ")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="col-span-full rounded-lg bg-blue-50 p-4">
        <p className="text-blue-800 text-sm">
          <strong>Note:</strong> Users assigned to this role will inherit all
          selected permissions. Ensure you only grant necessary access levels.
        </p>
      </div>
    </XLaravelForm>
  );
}
