import type React from "react";
import { FormProvider } from "react-hook-form";
import type z from "zod";
import { Button } from "@/components/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { useLaravelForm } from "@/hooks/use-laravel-form";
import { cn } from "@/lib/utils";
import { ZodSchemaProvider } from "@/provider/ZodSchemaProvider";

// biome-ignore lint/suspicious/noExplicitAny: Will be addressed later
type XLaravelFormProps<T extends z.ZodType<any, any, any>> = {
  children: React.ReactNode;
  className?: string;
  cardClassName?: string;
  title?: string;
  description?: string;
  schema: T;
  defaultValues?: Partial<z.infer<T>>;
  action: string;
  method?: "post" | "put" | "patch" | "delete";
  transform?: (data: z.infer<T>) => object | Promise<object>;
};

// biome-ignore lint/suspicious/noExplicitAny: Will be addressed later
export function XLaravelForm<T extends z.ZodType<any, any, any>>({
  children,
  className,
  cardClassName,
  title,
  description,
  schema,
  action,
  method,
  transform,
  defaultValues,
}: XLaravelFormProps<T>) {
  const { form, handleSubmit, processing } = useLaravelForm<T>({
    schema,
    action,
    method,
    transform,
    defaultValues,
  });

  return (
    <ZodSchemaProvider value={schema}>
      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
          <Card className={cn("shadow-none", cardClassName)}>
            {!!title && (
              <CardHeader
                className={cn("border-b", {
                  "gap-0": !description,
                })}
              >
                <CardTitle>{title}</CardTitle>
                {!!description && (
                  <CardDescription> {description} </CardDescription>
                )}
              </CardHeader>
            )}
            <CardContent>
              <div
                className={cn(
                  "grid grid-cols-1 gap-x-6 gap-y-6 md:grid-cols-2",
                  className
                )}
              >
                {children}
              </div>
            </CardContent>
            <CardFooter className="border-t">
              <div className="flex flex-row flex-wrap gap-2">
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
            </CardFooter>
          </Card>
        </form>
      </FormProvider>
    </ZodSchemaProvider>
  );
}
