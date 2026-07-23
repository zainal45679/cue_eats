import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { XPage } from "@/components/x/page/XPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/shadcn/ui/card";
import { XFormInput } from "@/components/x/form/components/XFormInput";
import { XFormSelect } from "@/components/x/form/components/XFormSelect";
import { Button } from "@/components/shadcn/ui/button";
import { Save, Plus, Trash2 } from "lucide-react";
import { FormProvider } from "react-hook-form";
import { usePage, router } from "@inertiajs/react";
import { ZodSchemaProvider } from "@/provider/ZodSchemaProvider";

const itemSchema = z.object({
    ingredient_id: z.coerce.number().min(1, "Ingredient is required"),
    quantity: z.coerce.number().min(0.01, "Quantity must be > 0"),
});

const schema = z.object({
    from_location_id: z.coerce.number().min(1, "Location is required"),
    to_location_id: z.coerce.number().min(1, "Location is required"),
    remarks: z.string().nullable().optional(),
    items: z.array(itemSchema).min(1, "At least one item is required"),
}).superRefine((data, ctx) => {
    if (data.from_location_id === data.to_location_id && data.from_location_id > 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Cannot request items from the same location",
            path: ["to_location_id"],
        });
    }
});

type FormValues = z.infer<typeof schema>;

export default function FormPage({ defaultValues }: { defaultValues?: any }) {
    const isEditing = !!defaultValues;
    const { props } = usePage<any>();
    const { locations = [], ingredients = [], categories = [] } = props;

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        mode: "onChange",
        defaultValues: {
            from_location_id: defaultValues?.from_location_id || 0,
            to_location_id: defaultValues?.to_location_id || props.auth?.user?.business_location_id || 0,
            remarks: defaultValues?.remarks || "",
            items: defaultValues?.items || [{ ingredient_id: 0, quantity: 1 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const onSubmit = (data: FormValues) => {
        if (isEditing) {
            router.put(`/purchasing/internal-requests/${defaultValues.uuid}`, data);
        } else {
            router.post("/purchasing/internal-requests", data);
        }
    };

    return (
        <XPage title={isEditing ? "Edit Indent" : "New Indent"} backUrl="/purchasing/internal-requests">
            <ZodSchemaProvider value={schema}>
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Request Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                <XFormSelect
                                    name="to_location_id"
                                    label="Requesting Location (Deliver To)"
                                    options={locations
                                        .filter((l: any) => props.auth?.roles?.includes('admin') ? true : l.id === props.auth?.user?.business_location_id)
                                        .map((l: any) => ({ label: l.location_name, value: String(l.id) }))}
                                />
                                <XFormSelect
                                    name="from_location_id"
                                    label="Fulfilling Location (Request From)"
                                    options={locations
                                        .filter((l: any) => l.id !== props.auth?.user?.business_location_id)
                                        .map((l: any) => ({ label: l.location_name, value: String(l.id) }))}
                                />
                                <div className="col-span-2">
                                    <XFormInput name="remarks" label="Remarks" />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Requested Items</CardTitle>
                                    <CardDescription>Add ingredients you want to request.</CardDescription>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ ingredient_id: 0, quantity: 1 })}>
                                    <Plus className="mr-2 size-4" /> Add Item
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-12 gap-4 px-4 text-sm font-medium text-muted-foreground">
                                        <div className="col-span-3">Category</div>
                                        <div className="col-span-5">Ingredient</div>
                                        <div className="col-span-3">Quantity</div>
                                        <div className="col-span-1 text-right">Action</div>
                                    </div>
                                    <div className="space-y-3">
                                        {fields.map((field, index) => {
                                            const currentCategoryId = form.watch(`items.${index}.category_id`);
                                            
                                            // Filter ingredients by category
                                            const availableIngredients = currentCategoryId && Number(currentCategoryId) > 0
                                                ? ingredients.filter((i: any) => String(i.ingredient_category_id) === String(currentCategoryId))
                                                : ingredients;

                                            return (
                                                <div key={field.id} className="grid grid-cols-12 gap-4 items-start bg-card border rounded-lg p-3 shadow-sm transition-all hover:shadow-md">
                                                    <div className="col-span-3">
                                                        <XFormSelect
                                                            name={`items.${index}.category_id`}
                                                            options={[{ label: "All Categories", value: "0" }, ...(categories || []).map((c: any) => ({ label: c.name, value: String(c.id) }))]}
                                                        />
                                                    </div>
                                                    <div className="col-span-5">
                                                        <XFormSelect
                                                            name={`items.${index}.ingredient_id`}
                                                            options={availableIngredients.map((i: any) => ({ label: i.name, value: String(i.id) }))}
                                                        />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <XFormInput type="number" step="0.01" name={`items.${index}.quantity`} />
                                                    </div>
                                                    <div className="col-span-1 flex justify-end pt-1">
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1} className="hover:bg-red-50 hover:text-red-500 transition-colors">
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="flex justify-end gap-2">
                            <Button type="submit">
                                <Save className="mr-2 size-4" /> Save
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </ZodSchemaProvider>
        </XPage>
    );
}
