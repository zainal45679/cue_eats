import { useId } from "react";
import { type Path, useController, useFormContext } from "react-hook-form";
import InputError from "@/components/dashboard/input-error";
import { Checkbox } from "@/components/shadcn/ui/checkbox";
import { Label } from "@/components/shadcn/ui/label";
import { cn } from "@/lib/utils";
import { useZodSchema } from "@/provider/ZodSchemaProvider";
import { getFormError, getFormRequired } from "../utils";

type TXFormCheckBox<T> = {
  label?: string;
  name: keyof T;
  wrapperClassName?: string;
  className?: string;
  disabled?: boolean;
  options?: { label: string; value: string | number | boolean }[];
};

export function XFormCheckBox<T extends Record<string, unknown>>({
  label,
  name,
  wrapperClassName,
  className,
  disabled = false,
  options,
}: TXFormCheckBox<T>) {
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

  if (options && options.length > 0) {
    const currentValues: (string | number | boolean)[] = Array.isArray(
      field.value
    )
      ? field.value
      : [];

    return (
      <div className={cn("col-span-full md:col-span-1", wrapperClassName)}>
        {label && (
          <Label className="mb-2">
            {label}
            {isRequired ? (
              <span className="text-red-500">*</span>
            ) : (
              <span className="text-muted-foreground/50">(Optional)</span>
            )}
          </Label>
        )}
        <div className="space-y-2">
          {options.map((option, index) => {
            const optionId = `${id}-${index}`;
            const isChecked = currentValues.includes(option.value);

            return (
              <div
                className="flex flex-row items-center gap-2"
                key={String(option.value)}
              >
                <Checkbox
                  checked={isChecked}
                  className={className}
                  disabled={disabled}
                  id={optionId}
                  onBlur={field.onBlur}
                  onCheckedChange={(checked) => {
                    const newValues = checked
                      ? [...currentValues, option.value]
                      : currentValues.filter((v) => v !== option.value);
                    field.onChange(newValues);
                  }}
                />
                <Label
                  className="cursor-pointer font-normal text-sm"
                  htmlFor={optionId}
                >
                  {option.label}
                </Label>
              </div>
            );
          })}
        </div>
        <InputError className="mt-2" message={errorMessage} />
      </div>
    );
  }

  // Single checkbox
  return (
    <div className={cn("col-span-full md:col-span-1", wrapperClassName)}>
      <div className="flex flex-row items-center gap-6">
        <Label htmlFor={id}>
          {label}
          {isRequired ? (
            <span className="text-red-500">*</span>
          ) : (
            <span className="text-muted-foreground/50">(Optional)</span>
          )}
        </Label>
        <Checkbox
          checked={field.value}
          className={className}
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
