import z from "zod";
import { FormMode } from "@/components/x/enum";
import { XFormCheckBox } from "@/components/x/form/components/XFormCheckBox";
import { XFormDatePicker } from "@/components/x/form/components/XFormDatePicker";
import { XFormEditor } from "@/components/x/form/components/XFormEditor";
import {
  FileType,
  XFormFileInput,
} from "@/components/x/form/components/XFormFileInput";
import { XFormInput } from "@/components/x/form/components/XFormInput";
import { XFormPhone } from "@/components/x/form/components/XFormPhone";
import { XFormRepeater } from "@/components/x/form/components/XFormRepeater";
import { XFormSelect } from "@/components/x/form/components/XFormSelect";
import { XFormSwitch } from "@/components/x/form/components/XFormSwitch";
import { XFormTextArea } from "@/components/x/form/components/XFormTextArea";
import { XLaravelForm } from "@/components/x/form/XLaravelForm";

type Bottle = {
  id: number;
  name: string;
  type: string;
  category?: string;
  phone_code?: string;
  phone: string;
  image?: string;
  productImages?: string[];
  litres: number;
  status: boolean;
  date_added: string;
  description?: string;
  longDescription?: string;
  preferences: string[];
  bottles?: { name: string }[];
};

type PageFormProps = {
  mode?: FormMode;
  pageData?: Bottle;
  title: string;
};

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  type: z.string().min(1, "Type is required"),
  category: z.string().min(1, "Category is required"),
  litres: z
    .number({ error: "Litres must be a number" })
    .min(0, "Litres must be at least 0"),
  phone_code: z.string().min(1, "Phone code is required"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be at most 15 digits"),
  image: z
    .any()
    .refine(
      (file) => {
        if (file instanceof File) {
          return file.size <= 5 * 1024 * 1024;
        }
        return true;
      },
      { message: "Image size must be less than 5MB" }
    )
    .optional()
    .nullable(),
  description: z.string().optional().nullable(),
  longDescription: z.string(),
  status: z.boolean(),
  preferences: z
    .array(z.string())
    .nonempty("At least one preference must be selected"),
  date_added: z.date().optional(),
  bottles: z
    .array(
      z.object({
        name: z.string().min(1, "Bottle name is required"),
      })
    )
    .nonempty("At least one bottle is required")
    .max(5, "Maximum 5 bottles are allowed"),
  productImages: z.array(z.any()).optional(),
});

export default function ProductForm({
  title,
  pageData,
  mode = FormMode.CREATE,
}: PageFormProps) {
  const isEdit = mode === FormMode.EDIT;

  type TSchema = z.infer<typeof schema>;
  const initialValues: TSchema = {
    name: pageData?.name || "",
    type: pageData?.type || "",
    phone_code: pageData?.phone_code || "",
    phone: pageData?.phone || "2323",
    category: pageData?.category || "",
    image:
      pageData?.image ||
      "https://static.vecteezy.com/vite/assets/photo-masthead-375-BoK_p8LG.webp",
    litres: pageData?.litres || 0,
    longDescription: "",
    description: "",
    status: pageData?.status,
    preferences: [],
    date_added: pageData?.date_added
      ? new Date(pageData.date_added)
      : undefined,
    bottles: pageData?.bottles || [],
    productImages: pageData?.productImages || [],
  };

  return (
    <XLaravelForm
      action={isEdit ? `/products/${pageData?.id}` : "/products"}
      defaultValues={initialValues}
      method={"post"}
      schema={schema}
      title={title || (isEdit ? "Edit Product" : "Create Product")}
      transform={(data) => (isEdit ? { ...data, _method: "PATCH" } : data)}
    >
      <XFormInput<TSchema> label="Name" name="name" />
      <XFormSelect<TSchema>
        label="Type"
        name="type"
        options={[
          { value: "Returnable", label: "Returnable" },
          { value: "Disposable", label: "Disposable" },
        ]}
      />
      <XFormSelect<TSchema>
        label="Category"
        name="category"
        options={[
          { value: "bottles", label: "Bottles" },
          { value: "dispensers", label: "Dispensers" },
        ]}
      />
      <XFormPhone<TSchema>
        label="Phone"
        namePhoneCode="phone_code"
        namePhoneNumber="phone"
      />
      <XFormInput<TSchema> label="Litres" name="litres" type="number" />
      <XFormTextArea<TSchema>
        label="Description"
        name="description"
        wrapperClassName="col-span-full"
      />
      <XFormEditor<TSchema> label="Long Description" name="longDescription" />

      <XFormSwitch<TSchema> label="Status" name="status" />

      <XFormCheckBox<TSchema>
        label="Preferences"
        name="preferences"
        options={[
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
          { label: "Option 3", value: "option3" },
        ]}
      />

      <XFormDatePicker<TSchema> label="Date Added" name="date_added" />

      <XFormRepeater<TSchema> label="Bottles" name="bottles">
        {(index) => (
          <>
            <XFormInput
              label="Bottle Name"
              name={`bottles.${index}.name`}
              placeholder="Enter bottle name"
            />
          </>
        )}
      </XFormRepeater>

      <XFormFileInput<TSchema>
        fileType={[FileType.IMAGE]}
        label="Image"
        maxFiles={1}
        name="image"
      />
      <XFormFileInput<TSchema>
        fileType={[FileType.IMAGE, FileType.VIDEO]}
        label="Product Images"
        multiple
        name="productImages"
      />
    </XLaravelForm>
  );
}
