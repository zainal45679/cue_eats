import { useId } from "react";
import { type Path, useController, useFormContext } from "react-hook-form";
import InputError from "@/components/dashboard/input-error";
import { Label } from "@/components/shadcn/ui/label";
import { Switch } from "@/components/shadcn/ui/switch";
import { cn } from "@/lib/utils";
import { useZodSchema } from "@/provider/ZodSchemaProvider";
import { getFormError, getFormRequired } from "../utils";

type TXFormSwitch<T> = {
  label?: string;
  name: keyof T;
  wrapperClassName?: string;
  className?: string;
  disabled?: boolean;
};

export function XFormSwitch<T extends Record<string, unknown>>({
  label,
  name,
  wrapperClassName,
  className,
  disabled = false,
}: TXFormSwitch<T>) {
  const {
    formState: { errors },
  } = useFormContext<T>();

  const { field } = useController({
    name: name as Path<T>,
  });

  const id = useId();

  const schema = useZodSchema();

  const errorMessage = getFormError(errors, name);
  const isRequired = getFormRequired(schema, name);

  return (
    <div className={cn("col-span-full md:col-span-1", wrapperClassName)}>
      <div className="flex flex-row items-center gap-6">
        {label && (
          <Label htmlFor={id}>
            {label}
            {isRequired ? (
              <span className="text-red-500">*</span>
            ) : (
              <span className="text-muted-foreground/50">(Optional)</span>
            )}
          </Label>
        )}
        <Switch
          checked={field.value}
          className={cn("scale-110", className)}
          disabled={disabled}
          id={id}
          name={field.name}
          onBlur={field.onBlur}
          onCheckedChange={(checked) => field.onChange(checked)}
          ref={field.ref}
        />
      </div>
      <InputError className="mt-2" message={errorMessage} />
    </div>
  );
}
