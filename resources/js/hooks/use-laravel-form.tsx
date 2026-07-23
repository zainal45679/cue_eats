/** biome-ignore-all lint/suspicious/noExplicitAny: Will be addressed later */

import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "@inertiajs/react";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import type { z } from "zod";

export type UseLaravelFormOptions<T extends z.ZodType<any, any, any>> = {
  schema: T;
  action: string;
  method?: "post" | "put" | "patch" | "delete";
  transform?: (data: z.infer<T>) => object | Promise<object>;
  defaultValues?: Partial<z.infer<T>>;
  onSuccess?: () => void;
};

export function useLaravelForm<T extends z.ZodType<any, any, any>>({
  schema,
  action,
  method = "post",
  transform,
  defaultValues,
  onSuccess,
}: UseLaravelFormOptions<T>) {
  const form = useForm({
    resolver: zodResolver(schema as any),
    defaultValues: defaultValues as any,
  });

  console.log("Default Values:", defaultValues);
  const [processing, setProcessing] = useState(false);

  const onSubmit: SubmitHandler<z.infer<T>> = async (values) => {
    console.log("Form Values on Submit:", values);
    setProcessing(true);

    let data: object = values;

    if (transform) {
      data = await Promise.resolve(transform(values));
    }

    if (method === "put") {
      data = { ...data, _method: "PATCH" };
    }

    router.post(
      action,
      { ...data },
      {
        onSuccess: () => {
          onSuccess?.();
        },
        onError: (errors) => {
          for (const field of Object.keys(errors)) {
            form.setError(field as any, {
              type: "server",
              message: errors[field],
            });
          }
        },
        onFinish: () => setProcessing(false),
      }
    );
  };

  return {
    form,
    handleSubmit: form.handleSubmit(onSubmit, (errors) => {
      console.error("Frontend Validation Errors:", errors);
      alert("Validation failed:\n\n" + JSON.stringify(errors, null, 2));
    }),
    processing,
    schema,
  };
}
