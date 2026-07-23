import { useId } from "react";
import { type Path, useFormContext } from "react-hook-form";
import InputError from "@/components/dashboard/input-error";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { cn } from "@/lib/utils";
import { useZodSchema } from "@/provider/ZodSchemaProvider";
import { getFormError, getFormRealName, getFormRequired } from "../utils";

type TXFormInput<T> = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  name: keyof T;
  wrapperClassName?: string;
  placeholder?: string;
  type?: "text" | "number" | "email" | "password" | "date";
  className?: string;
  disabled?: boolean;
};

export function XFormInput<T extends Record<string, unknown>>({
  label,
  name,
  wrapperClassName,
  type = "text",
  className,
  placeholder,
  disabled = false,
  ...props
}: TXFormInput<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const id = useId();

  const schema = useZodSchema();

  const errorMessage = getFormError(errors, name);
  const isRequired = getFormRequired(schema, name);

  return (
    <div className={cn("col-span-full md:col-span-1", wrapperClassName)}>
      {label && (
        <Label className="mb-2 block" htmlFor={id}>
          {label}
          {isRequired ? (
            <span className="text-red-500">*</span>
          ) : (
            <span className="text-muted-foreground/50">(Optional)</span>
          )}
        </Label>
      )}
      <Input
        className={cn(
          "mt-1 w-full justify-between",
          errorMessage && "border-red-500 focus:border-red-500",
          "mt-1 block w-full",
          className
        )}
        disabled={disabled}
        id={id}
        inputMode={type === "number" ? "decimal" : undefined}
        pattern={type === "number" ? "[0-9]*[.]?[0-9]*" : undefined}
        placeholder={
          placeholder ??
          `Enter ${(label ?? getFormRealName(name)).toLowerCase()}`
        }
        type={type}
        {...props}
        {...register(name as Path<T>, {
          setValueAs: (value) => (type === "number" ? Number(value) : value),
        })}
      />
      <InputError className="mt-1" message={errorMessage} />
    </div>
  );
}
