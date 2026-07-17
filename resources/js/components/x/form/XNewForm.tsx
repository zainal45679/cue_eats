import type React from "react";
import {
  type FieldValues,
  FormProvider,
  type UseFormReturn,
} from "react-hook-form";
import { cn } from "@/lib/utils";
import { ZodSchemaProvider } from "@/provider/ZodSchemaProvider";

type XNewFormProps<T extends FieldValues> = {
  form: {
    form: UseFormReturn<T>;
    onSubmit: (values: T) => void;
    processing?: boolean;
    // biome-ignore lint/suspicious/noExplicitAny: Will be addressed later
    schema: any;
  };

  children: React.ReactNode;
  className?: string;
};

export function XNewForm<T extends FieldValues>({
  form: { form, onSubmit, schema },
  children,
  className,
}: XNewFormProps<T>) {
  return (
    <ZodSchemaProvider value={schema}>
      <FormProvider {...form}>
        <form
          className={cn("space-y-4", className)}
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {children}
        </form>
      </FormProvider>
    </ZodSchemaProvider>
  );
}
