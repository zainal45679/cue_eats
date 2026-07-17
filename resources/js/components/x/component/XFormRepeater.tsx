/* eslint-disable @typescript-eslint/no-explicit-any */

import { Plus, Trash2 } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/shadcn/ui/button";
import { Card, CardContent } from "@/components/shadcn/ui/card";

interface XFormRepeaterProps {
  name: string;
  label?: string;
  initialValues?: any[];
  minItems?: number;
  maxItems?: number;
  value: any[];
  onChange: (value: any[]) => void;
  error?: string;
  children: (
    data: any,
    setData: (key: string, value: any) => void,
    errors: Record<string, string>,
    index: number,
    remove: () => void
  ) => React.ReactNode;
  addButtonText?: string;
  showRemoveButton?: boolean;
  showAddButton?: boolean;
  wrapperClassName?: string;
  itemClassName?: string;
  allowReorder?: boolean;
}

export function XFormRepeater({
  label,
  initialValues = [{}],
  minItems = 1,
  maxItems = 10,
  value,
  onChange,
  error,
  children,
  addButtonText = "Add Item",
  showRemoveButton = true,
  showAddButton = true,
  wrapperClassName = "",
  itemClassName = "",
  allowReorder = false,
}: XFormRepeaterProps) {
  const [errors, setErrors] = useState<Record<number, Record<string, string>>>(
    {}
  );

  // Initialize with at least minItems if empty
  React.useEffect(() => {
    if (!value || value.length === 0) {
      const initialData = Array.from(
        { length: minItems },
        (_, index) => initialValues[index] || {}
      );
      onChange(initialData);
    }
  }, [value, minItems, initialValues, onChange]);

  const addItem = () => {
    if (value.length < maxItems) {
      const newItem = initialValues[0] || {};
      onChange([...value, newItem]);
    }
  };

  const removeItem = (index: number) => {
    if (value.length > minItems) {
      const newValue = value.filter((_, i) => i !== index);
      onChange(newValue);

      // Clean up errors for removed item
      const newErrors = { ...errors };
      delete newErrors[index];

      // Reindex remaining errors
      const reindexedErrors: Record<number, Record<string, string>> = {};
      Object.keys(newErrors).forEach((key) => {
        const numKey = Number.parseInt(key);
        if (numKey > index) {
          reindexedErrors[numKey - 1] = newErrors[numKey];
        } else if (numKey < index) {
          reindexedErrors[numKey] = newErrors[numKey];
        }
      });

      setErrors(reindexedErrors);
    }
  };

  const updateItem = (index: number, key: string, itemValue: any) => {
    const newValue = [...value];
    newValue[index] = { ...newValue[index], [key]: itemValue };
    onChange(newValue);
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (!allowReorder) return;

    const newValue = [...value];
    const [movedItem] = newValue.splice(fromIndex, 1);
    newValue.splice(toIndex, 0, movedItem);
    onChange(newValue);
  };

  const setItemError = (index: number, key: string, errorMessage: string) => {
    setErrors((prev) => ({
      ...prev,
      [index]: {
        ...prev[index],
        [key]: errorMessage,
      },
    }));
  };

  return (
    <div className={`col-span-2 space-y-4 ${wrapperClassName}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="font-medium text-gray-700 text-sm">{label}</label>
          {showAddButton && value.length < maxItems && (
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

      <div className="space-y-3">
        {value?.map((item, index) => (
          <Card className={`relative ${itemClassName}`} key={index}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="grid flex-1 grid-cols-2 gap-4">
                  {children(
                    item,
                    (key: string, itemValue: any) =>
                      updateItem(index, key, itemValue),
                    errors[index] || {},
                    index,
                    () => removeItem(index)
                  )}
                </div>

                {showRemoveButton && value.length > minItems && (
                  <Button
                    className="mt-7 text-red-600 hover:text-red-700"
                    onClick={() => removeItem(index)}
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {!label && showAddButton && value.length < maxItems && (
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

      {error && <p className="mt-1 text-red-600 text-sm">{error}</p>}
    </div>
  );
}
