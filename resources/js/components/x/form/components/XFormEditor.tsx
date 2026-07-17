import { useId } from "react";
import { type Path, type PathValue, useFormContext } from "react-hook-form";
import InputError from "@/components/dashboard/input-error";
import { Label } from "@/components/shadcn/ui/label";
import { MinimalTiptap } from "@/components/shadcn/ui/shadcn-io/minimal-tiptap";
import { cn } from "@/lib/utils";
import { useZodSchema } from "@/provider/ZodSchemaProvider";
import { getFormError, getFormRealName, getFormRequired } from "../utils";

type XFormEditorProps<T> = {
  name: keyof T;
  label?: string;
  wrapperClassName?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
};

export function XFormEditor<T extends Record<string, unknown>>({
  name,
  label,
  wrapperClassName,
  className,
  placeholder,
  disabled = false,
}: XFormEditorProps<T>) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<T>();
  const value = watch(name as Path<T>) as string;
  const schema = useZodSchema();
  const id = useId();

  const errorMessage = getFormError(errors, name);
  const isRequired = getFormRequired(schema, name);

  const handleChange = (newValue: string) => {
    setValue(name as Path<T>, newValue as PathValue<T, Path<T>>);
  };

  return (
    <div className={cn("col-span-full md:col-span-full", wrapperClassName)}>
      {label && (
        <Label className="mb-2" htmlFor={id}>
          {label}
          {isRequired ? (
            <span className="text-red-500">*</span>
          ) : (
            <span className="text-muted-foreground/50">(Optional)</span>
          )}
        </Label>
      )}
      <MinimalTiptap
        className={cn(
          "mt-1",
          errorMessage && "border-red-500 focus:border-red-500",
          className
        )}
        content={value || ""}
        editable={!disabled}
        onChange={handleChange}
        placeholder={
          placeholder ??
          `Enter ${(label ?? getFormRealName(name)).toString().toLowerCase()}`
        }
      />
      <InputError className="mt-1" message={errorMessage} />
    </div>
  );
}
