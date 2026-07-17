import type React from "react";
import { useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import type z from "zod";
import { Button } from "@/components/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import { useLaravelForm } from "@/hooks/use-laravel-form";
import { cn } from "@/lib/utils";
import { ZodSchemaProvider } from "@/provider/ZodSchemaProvider";

// biome-ignore lint/suspicious/noExplicitAny: Will be addressed later
type XFormDialogProps<T extends z.ZodType<any, any, any>> = {
  className?: string;
  title?: string;
  description?: string;
  schema: T;
  action: string;
  method?: "post" | "put" | "patch" | "delete";
  transform?: (data: z.infer<T>) => object | Promise<object>;
  children: React.ReactNode;
  dialog: {
    dialogValues: Partial<z.infer<T>> | undefined;
    closeDialog: () => void;
  };
};

// biome-ignore lint/suspicious/noExplicitAny: Will be addressed later
export function XFormDialog<T extends z.ZodType<any, any, any>>({
  className,
  title,
  description,
  schema,
  action,
  method,
  transform,
  children,
  dialog: { closeDialog, dialogValues },
}: XFormDialogProps<T>) {
  const isOpen = !!dialogValues;

  console.log("Dialog Values:", dialogValues);

  const { form, handleSubmit, processing } = useLaravelForm<T>({
    schema,
    action,
    method,
    transform,
    defaultValues: dialogValues,
    onSuccess: () => closeDialog(),
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: Will be addressed later
  useEffect(() => {
    if (dialogValues) {
      form.reset(dialogValues);
    }
  }, [isOpen, dialogValues]);

  return (
    <Dialog onOpenChange={closeDialog} open={isOpen}>
      <DialogContent className="px-0 py-4 md:max-w-3xl lg:max-w-5xl">
        <ZodSchemaProvider value={schema}>
          <FormProvider {...form}>
            <form onSubmit={handleSubmit}>
              {(title || description) && (
                <DialogHeader className="border-b px-4 pt-2 pb-6">
                  {title && <DialogTitle>{title}</DialogTitle>}
                  {description && (
                    <DialogDescription>{description}</DialogDescription>
                  )}
                </DialogHeader>
              )}

              <div
                className={cn(
                  "grid grid-cols-1 gap-x-6 gap-y-6 px-4 py-4 md:grid-cols-2",
                  className
                )}
              >
                {children}
              </div>

              <DialogFooter className="border-t px-4 pt-4">
                <div className="flex flex-row flex-wrap justify-end gap-2">
                  <Button disabled={processing} type="submit">
                    {processing ? "Processing..." : "Submit"}
                  </Button>
                  <Button
                    disabled={processing}
                    onClick={() => form.reset()}
                    type="button"
                    variant="outline"
                  >
                    Reset
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </FormProvider>
        </ZodSchemaProvider>
      </DialogContent>
    </Dialog>
  );
}

export function useXFormDialog<T>() {
  const [dialogValues, setDialogValues] = useState<T | undefined>();

  const openDialog = (values?: T) => {
    setDialogValues(values);
  };
  const closeDialog = () => {
    setDialogValues(undefined);
  };

  return {
    dialog: { dialogValues, closeDialog },
    openDialog,
  };
}
