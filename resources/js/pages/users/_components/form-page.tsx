import z from "zod";
import { XFormInput } from "@/components/x/form/components/XFormInput";
import { XFormSelect } from "@/components/x/form/components/XFormSelect";
import { XFormSwitch } from "@/components/x/form/components/XFormSwitch";
import { XLaravelForm } from "@/components/x/form/XLaravelForm";
import { usePage } from "@inertiajs/react";
import type { SharedData } from "@/types";

type UserFormProps = {
  mode: "edit" | "create";
  user?: { id: string | number; uuid?: string; name: string; email?: string; role?: string; business_location_id?: number; status?: boolean | number | string };
  title?: string;
  businessLocations?: { id: number; location_name: string }[];
};

export default function UserForm({ mode, user, title, businessLocations = [] }: UserFormProps) {
  const { auth } = usePage<SharedData>().props;
  const isAdmin = auth.roles?.includes("admin");

  const isEdit = mode === "edit";

  const schema = z.object({
    name: z.string().min(2).max(100),
    email: z.email(),
    role: z.string({ required_error: "Role is required" }).min(1, "Role is required"),
    password: isEdit 
      ? z.string().optional() 
      : z.string().min(6, "Password must be at least 6 characters"),
    business_location_id: z.number().nullable().optional(),
    status: z.boolean().default(true),
  }).superRefine((data, ctx) => {
    if (data.role !== "admin" && !data.business_location_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Assigned branch is required for this role.",
        path: ["business_location_id"],
      });
    }
  });

  type TSchema = z.infer<typeof schema>;

  const initialValues: TSchema = {
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "",
    password: "",
    business_location_id: user?.business_location_id || null,
    status: user?.status === undefined ? true : Boolean(user?.status),
  };

  return (
    <XLaravelForm
      action={isEdit ? `/users/${user?.uuid}` : "/users"}
      defaultValues={initialValues}
      schema={schema}
      title={title || (isEdit ? "Edit User" : "Create User")}
      transform={(data) => (isEdit ? { ...data, _method: "PATCH" } : data)}
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

      <XFormSwitch<TSchema>
        label="Account Status"
        name="status"
      />

      {isAdmin && (
        <XFormSelect<TSchema>
          label="Assigned Branch"
          name="business_location_id"
          options={[
            { label: "Global Access (No Branch)", value: null as any },
            ...businessLocations.map((b) => ({
              label: b.location_name,
              value: b.id,
            })),
          ]}
          placeholder="Select a branch..."
          description="If set, the user will only see data for this specific branch."
        />
      )}

      <XFormInput<TSchema> label="Email" name="email" type="email" />
      <XFormInput<TSchema> label="Password" name="password" type="password" />
    </XLaravelForm>
  );
}
