import type * as React from "react";
import InputError from "@/components/dashboard/input-error";
import { Label } from "@/components/shadcn/ui/label";
import { Textarea } from "@/components/shadcn/ui/textarea";

interface CustomizedTextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  wrapperClassName?: string;
  textareaClassName?: string;
  errorClassName?: string;
  error?: string;
  required?: boolean;
}

export function XTextArea({
  label,
  wrapperClassName = "space-y-2",
  textareaClassName = "mt-1 block w-full",
  errorClassName = "mt-2",
  error,
  required,
  ...props
}: CustomizedTextAreaProps) {
  return (
    <div className={wrapperClassName}>
      {label && (
        <Label htmlFor={props.id}>
          {label}
          {required && <span className="text-destructive"> *</span>}
        </Label>
      )}
      <Textarea className={textareaClassName} {...props} />
      <InputError className={errorClassName} message={error} />
    </div>
  );
}
