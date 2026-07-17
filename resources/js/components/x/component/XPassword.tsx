import type * as React from "react";
import InputError from "@/components/dashboard/input-error";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";

interface PasswordInputProps extends React.ComponentProps<"input"> {
  label: string;
  wrapperClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  error?: string;
  inputRef?: React.Ref<HTMLInputElement>;
}

export function XInput({
  label,
  wrapperClassName,
  inputClassName,
  errorClassName,
  error,
  inputRef,
  ...props
}: PasswordInputProps) {
  return (
    <div className={wrapperClassName}>
      <Label htmlFor={props.id}>{label}</Label>
      <Input className={inputClassName} ref={inputRef} {...props} />
      <InputError className={errorClassName} message={error} />
    </div>
  );
}
