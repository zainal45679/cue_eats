import z from "zod";
import { XFormInput } from "@/components/x/form/components/XFormInput";
import { XFormSelect } from "@/components/x/form/components/XFormSelect";
import { XLaravelForm } from "@/components/x/form/XLaravelForm";

type UserFormProps = {
  mode: "edit" | "create";
  user?: { id: number; name: string; email?: string; role?: number };
  title?: string;
};

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.email(),
  role: z.number().optional(),
  password: z.string().min(6).max(100),
});

export default function UserForm({ mode, user, title }: UserFormProps) {
  const isEdit = mode === "edit";

  type TSchema = z.infer<typeof schema>;

  const initialValues: TSchema = {
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || 0,
    password: "",
  };

  return (
    <XLaravelForm
      action={isEdit ? `/users/${user?.id}` : "/users"}
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
              value: role.id,
              label: role.name,
            })),
        }}
        options={[]}
        placeholder="Select a role..."
      />

      <XFormInput<TSchema> label="Email" name="email" type="email" />
      <XFormInput<TSchema> label="Password" name="password" type="password" />
    </XLaravelForm>
  );
}
