import React from "react";
import { Head } from "@inertiajs/react";
import { store, update } from "@/generated/routes/ingredient-categories";
import { z } from "zod";
import { XLaravelForm } from "@/components/x/form/XLaravelForm";
import { XFormInput } from "@/components/x/form/components/XFormInput";
import { XFormSelect } from "@/components/x/form/components/XFormSelect";
import { XFormSwitch } from "@/components/x/form/components/XFormSwitch";
import type { PageProps } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  parent_category_id: z.string().or(z.number()).nullable().optional(),
  status: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function IngredientCategoryFormPage({
  category,
  parentCategories,
}: PageProps<{ category?: any; parentCategories: any[] }>) {
  const isEditing = !!category;

  const defaultValues: FormValues = {
    name: category?.name || "",
    parent_category_id: category?.parent_category_id?.toString() || "",
    status: category?.status ?? true,
  };

  return (
    <>
      <Head title={isEditing ? "Edit Category" : "Add Category"} />
      <div className="space-y-6">
        <XLaravelForm<typeof schema>
          action={isEditing ? update.url(category.uuid) : store.url()}
          defaultValues={defaultValues}
          method={"post"}
          schema={schema}
          title={isEditing ? "Edit Category" : "Add Category"}
          transform={(data) => (isEditing ? { ...data, _method: "PUT" } : data)}
        >
          <XFormInput<FormValues>
            label="Category Name"
            name="name"
            placeholder="e.g. Dairy"
          />
          <XFormSelect<FormValues>
            label="Parent Category"
            name="parent_category_id"
            options={[
              { label: "None", value: "" },
              ...parentCategories.map((p) => ({
                label: p.name,
                value: p.id.toString(),
              })),
            ]}
          />
          <XFormSwitch<FormValues>
            label="Status"
            name="status"
            description="Activate or deactivate this category"
          />
        </XLaravelForm>
      </div>
    </>
  );
}
