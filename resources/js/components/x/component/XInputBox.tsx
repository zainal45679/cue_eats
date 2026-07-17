import type * as React from "react";
import InputError from "@/components/dashboard/input-error";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { cn } from "@/lib/utils";

interface CustomInputProps<T = string | number | null>
  extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value: T;
  onChange: (value: T) => void;
  label?: string;
  wrapperClassName?: string;
  error?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}

export function XInputBox<T = string | number | null>({
  label,
  value,
  onChange,
  wrapperClassName = "col-span-1",
  error,
  inputRef,
  type = "text",
  ...props
}: CustomInputProps<T>) {
  return (
    <div className={wrapperClassName}>
      <Label htmlFor={props.id}>{label}</Label>
      <Input
        className={cn(
          "mt-1 w-full justify-between",
          !value && "text-muted-foreground",
          error && "border-red-500 focus:border-red-500",
          "mt-1 block w-full"
        )}
        onChange={(e) => {
          let newValue: T;
          if (type === "number") {
            const parsed =
              e.target.value === "" ? null : Number(e.target.value);
            newValue = parsed as unknown as T;
          } else {
            newValue = (e.target.value === "" ? null : e.target.value) as T;
          }
          onChange?.(newValue);
        }}
        ref={inputRef}
        type={type}
        value={(value ?? "") + ""}
        {...props}
      />
      <InputError className="mt-2" message={error} />
    </div>
  );
}
