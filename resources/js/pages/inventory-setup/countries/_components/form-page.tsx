import z from "zod";
import { FormMode } from "@/components/x/enum";
import { XFormInput } from "@/components/x/form/components/XFormInput";
import { XFormSwitch } from "@/components/x/form/components/XFormSwitch";
import { XLaravelForm } from "@/components/x/form/XLaravelForm";

type Country = {
  id?: number;
  name: string;
  status: boolean;
};

type PageFormProps = {
  mode?: FormMode;
  pageData?: Country;
  title: string;
};

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.boolean(),
});

import { store, update } from "@/generated/routes/countries";

export default function CountryForm({
  title,
  pageData,
  mode = FormMode.CREATE,
}: PageFormProps) {
  const isEdit = mode === FormMode.EDIT;

  type TSchema = z.infer<typeof schema>;
  
  const initialValues: TSchema = {
    name: pageData?.name || "",
    status: pageData?.status ?? true,
  };

  return (
    <XLaravelForm
      action={isEdit ? update.url(pageData!.id!) : store.url()}
      defaultValues={initialValues}
      method={"post"}
      schema={schema}
      title={title || (isEdit ? "Edit Country" : "Create Country")}
      transform={(data) => (isEdit ? { ...data, _method: "PUT" } : data)}
    >
      <XFormInput<TSchema> label="Name" name="name" />
      <XFormSwitch<TSchema> label="Status" name="status" />
    </XLaravelForm>
  );
}
