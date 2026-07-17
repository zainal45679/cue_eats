import { useId } from "react";
import { type Path, useFormContext } from "react-hook-form";
import InputError from "@/components/dashboard/input-error";
import { Label } from "@/components/shadcn/ui/label";
import { Textarea } from "@/components/shadcn/ui/textarea";
import { cn } from "@/lib/utils";
import { useZodSchema } from "@/provider/ZodSchemaProvider";
import { getFormError, getFormRequired } from "../utils";

type XFormTextAreaProps<T> = {
  name: keyof T;
  label?: string;
  wrapperClassName?: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  showCharCount?: boolean;
};

export function XFormTextArea<T extends Record<string, unknown>>({
  name,
  label,
  wrapperClassName,
  className,
  placeholder,
  disabled = false,
  maxLength,
  showCharCount = true,
}: XFormTextAreaProps<T>) {
  const {
    register,
    formState: { errors },
    watch,
  } = useFormContext<T>();

  const id = useId();

  const schema = useZodSchema();

  const errorMessage = getFormError(errors, name);
  const isRequired = getFormRequired(schema, name);

  const currentValue = watch(name as Path<T>) as string;
  const currentCharCount = currentValue?.length || 0;

  return (
    <div className={cn("col-span-full md:col-span-1", wrapperClassName)}>
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
      <Textarea
        className={cn(
          "mt-1 w-full md:text-sm",
          errorMessage && "border-red-500 focus:border-red-500",
          className
        )}
        disabled={disabled}
        id={id}
        maxLength={maxLength}
        placeholder={
          placeholder ?? `Enter ${(label ?? name).toString().toLowerCase()}`
        }
        {...register(name as Path<T>)}
      />
      {showCharCount && (
        <div className="mt-1 text-right text-muted-foreground text-xs">
          {currentCharCount}
          {maxLength && ` / ${maxLength}`} characters
        </div>
      )}
      <InputError className="mt-1" message={errorMessage} />
    </div>
  );
}
