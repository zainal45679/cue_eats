import { Plus, X } from "lucide-react";
import React, { useId, useState } from "react";
import { type Path, useController, useFormContext } from "react-hook-form";
import InputError from "@/components/dashboard/input-error";
import { Button } from "@/components/shadcn/ui/button";
import { Card, CardContent } from "@/components/shadcn/ui/card";
import { Label } from "@/components/shadcn/ui/label";
import { Separator } from "@/components/shadcn/ui/separator";
import { cn } from "@/lib/utils";
import { useZodSchema } from "@/provider/ZodSchemaProvider";
import { getFormError, getFormMaximum, getFormMinimum } from "../utils";

type TXFormRepeater<T> = {
  name: keyof T;
  label?: string;
  wrapperClassName?: string;
  itemClassName?: string;
  addButtonText?: string;
  showRemoveButton?: boolean;
  showAddButton?: boolean;
  children: (index: number, data: any) => React.ReactNode;
};

export function XFormRepeater<T extends Record<string, unknown>>({
  name,
  label,
  wrapperClassName,
  itemClassName = "",
  addButtonText = "Add Item",
  showRemoveButton = true,
  showAddButton = true,
  children,
}: TXFormRepeater<T>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<T>();

  const { field } = useController({
    name: name as Path<T>,
    control,
  });

  const id = useId();

  const schema = useZodSchema();

  const errorMessage = getFormError(errors, name);

  const maxItems = getFormMaximum(schema, name) || 100;
  const minItems = getFormMinimum(schema, name) || 0;

  const isRequired = minItems > 0;

  const actualInitialValues =
    (control as any)._defaultValues?.[name as string] || [];

  const [itemErrors, setItemErrors] = useState<
    Record<number, Record<string, string>>
  >({});

  // Initialize with at least minItems if empty (only if minItems > 0)
  React.useEffect(() => {
    if (
      minItems > 0 &&
      (!(field.value && Array.isArray(field.value)) || field.value.length === 0)
    ) {
      const initialData = Array.from(
        { length: minItems },
        (_, index) => actualInitialValues[index] || {}
      );
      field.onChange(initialData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.value, minItems]);

  const addItem = React.useCallback(() => {
    if (field.value && field.value.length < maxItems) {
      const newItem = actualInitialValues[0] || {};
      field.onChange([...field.value, newItem]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [field.value, maxItems, actualInitialValues]);

  const removeItem = React.useCallback(
    (index: number) => {
      if (field.value && field.value.length > minItems) {
        const newValue = field.value.filter((_: any, i: number) => i !== index);
        field.onChange(newValue);

        // Clean up errors for removed item
        const newErrors = { ...itemErrors };
        delete newErrors[index];

        // Reindex remaining errors
        const reindexedErrors: Record<number, Record<string, string>> = {};
        for (const key of Object.keys(newErrors)) {
          const numKey = Number.parseInt(key, 10);
          if (numKey > index) {
            reindexedErrors[numKey - 1] = newErrors[numKey];
          } else if (numKey < index) {
            reindexedErrors[numKey] = newErrors[numKey];
          }
        }

        setItemErrors(reindexedErrors);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [field.value, field.onChange, minItems, itemErrors]
  );

  return (
    <div className={cn("col-span-full space-y-4", wrapperClassName)}>
      {label && (
        <div className="flex items-center justify-between">
          <Label htmlFor={id}>
            {label}
            {isRequired ? (
              <span className="text-red-500">*</span>
            ) : (
              <span className="text-muted-foreground/50">(Optional)</span>
            )}
          </Label>
          {showAddButton && field.value && field.value.length < maxItems && (
            <Button
              className="flex items-center gap-1"
              onClick={addItem}
              size="sm"
              type="button"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
              {addButtonText}
            </Button>
          )}
        </div>
      )}

      {(field.value?.length ?? 0) != 0 && (
        <Card className="relative gap-0 space-y-0 overflow-hidden py-0 shadow-none">
          {field.value?.map((item: any, index: number) => (
            <React.Fragment key={index}>
              <CardContent className="relative p-4" key={index}>
                <div className={cn("grid grid-cols-2 gap-4", itemClassName)}>
                  {children(index, item)}
                </div>

                {showRemoveButton &&
                  field.value &&
                  field.value.length > minItems && (
                    <Button
                      className="!px-2 absolute top-0 right-0 rounded-t-none rounded-r-none border-t-0 border-r-0 text-red-600 hover:text-red-700"
                      onClick={() => removeItem(index)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
              </CardContent>
              {index + 1 < field.value.length && <Separator className="my-0" />}
            </React.Fragment>
          ))}
        </Card>
      )}

      {!label &&
        showAddButton &&
        field.value &&
        field.value.length < maxItems && (
          <Button
            className="flex w-full items-center gap-2"
            onClick={addItem}
            type="button"
            variant="outline"
          >
            <Plus className="h-4 w-4" />
            {addButtonText}
          </Button>
        )}

      <InputError className="mt-1" message={errorMessage} />
    </div>
  );
}
