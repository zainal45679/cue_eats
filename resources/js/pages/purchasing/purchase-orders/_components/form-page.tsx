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
import { router } from "@inertiajs/react";
import { useState } from "react";
import { usePage } from "@inertiajs/react";
import { ZodSchemaProvider } from "@/provider/ZodSchemaProvider";
import { Tabs, TabsList, TabsTrigger } from "@/components/shadcn/ui/tabs";

const itemSchema = z.object({
    ingredient_id: z.coerce.number().min(1, "Ingredient is required"),
    supplier_id: z.coerce.number().optional(), // Used in category mode
    quantity: z.coerce.number().min(0.01, "Quantity must be > 0"),
    unit_price: z.coerce.number().min(0, "Price must be >= 0"),
});

const schema = z.object({
    supplier_id: z.coerce.number().optional(), // Required in supplier mode
    category_id: z.coerce.number().optional(), // Required in category mode
    delivery_location_id: z.coerce.number().min(1, "Delivery Location is required"),
    expected_delivery_date: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    items: z.array(itemSchema).min(1, "At least one item is required"),
    mode: z.enum(["supplier", "category"]).optional(), // Keep track of mode for backend
});

type FormValues = z.infer<typeof schema>;

export default function FormPage({ defaultValues }: { defaultValues?: any }) {
    const isEditing = !!defaultValues;
    const { props } = usePage<any>();
    const { suppliers = [], businessLocations: locations = [], ingredients = [], supplierIngredients = [], categories = [] } = props;

    const [mode, setMode] = useState<"supplier" | "category">(isEditing ? "supplier" : "supplier");

    const form = useForm<FormValues>({
        resolver: zodResolver(schema),
        mode: "onChange",
        defaultValues: {
            supplier_id: defaultValues?.supplier_id || 0,
            category_id: 0,
            delivery_location_id: defaultValues?.delivery_location_id || 0,
            expected_delivery_date: defaultValues?.expected_delivery_date || "",
            notes: defaultValues?.notes || "",
            items: defaultValues?.items || [{ ingredient_id: 0, quantity: 1, unit_price: 0, supplier_id: 0 }],
            mode: isEditing ? "supplier" : "supplier", 
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const items = form.watch("items");
    const subtotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)), 0);

    const onSubmit = (data: FormValues) => {
        data.mode = mode;
        
        // Manual validation for supplier mode
        if (mode === "supplier" && (!data.supplier_id || data.supplier_id === 0)) {
            form.setError("supplier_id", { message: "Supplier is required" });
            return;
        }

        // Manual validation for category mode 
        if (mode === "category") {
            if (!data.category_id || data.category_id === 0) {
                form.setError("category_id", { message: "Category is required" });
                return;
            }
            
            let hasError = false;
            data.items.forEach((item, index) => {
                if (!item.supplier_id || item.supplier_id === 0) {
                    form.setError(`items.${index}.supplier_id` as any, { message: "Required" });
                    hasError = true;
                }
            });
            if (hasError) return;
        }

        if (isEditing) {
            router.put(`/purchasing/purchase-orders/${defaultValues.uuid}`, data);
        } else {
            router.post("/purchasing/purchase-orders", data);
        }
    };

    return (
        <XPage 
            title={isEditing ? "Edit Purchase Order" : "New Purchase Order"} 
            backUrl="/purchasing/purchase-orders"
        >
            <ZodSchemaProvider value={schema}>
                <FormProvider {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        
                        {!isEditing && (
                            <div className="flex justify-center mb-6">
                                <Tabs value={mode} onValueChange={(v: any) => {
                                    setMode(v);
                                    form.setValue("mode", v);
                                }} className="w-[400px]">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="supplier">Order by Supplier</TabsTrigger>
                                        <TabsTrigger value="category">Order by Category</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>
                        )}

                        <Card>
                            <CardHeader>
                                <CardTitle>Order Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-2 gap-4">
                                {mode === "supplier" ? (
                                    <XFormSelect
                                        name="supplier_id"
                                        label="Supplier"
                                        options={suppliers.map((s: any) => ({ label: s.name, value: String(s.id) }))}
                                    />
                                ) : (
                                    <XFormSelect
                                        name="category_id"
                                        label="Item Category (e.g. Dairy)"
                                        options={categories.map((c: any) => ({ label: c.name, value: String(c.id) }))}
                                    />
                                )}
                                <XFormSelect
                                    name="delivery_location_id"
                                    label="Delivery Location"
                                    options={locations.map((l: any) => ({ label: l.location_name, value: String(l.id) }))}
                                />
                                <XFormInput type="date" name="expected_delivery_date" label="Expected Delivery Date" />
                                <XFormInput name="notes" label="Notes" />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Line Items</CardTitle>
                                    <CardDescription>
                                        {mode === "supplier" 
                                            ? "Add items available from the selected supplier." 
                                            : "Add items from the selected category and choose a supplier for each."}
                                    </CardDescription>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ ingredient_id: 0, quantity: 1, unit_price: 0, supplier_id: 0 })}>
                                    <Plus className="mr-2 size-4" /> Add Item
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-12 gap-4 px-4 text-sm font-medium text-muted-foreground">
                                        <div className={mode === "category" ? "col-span-4" : "col-span-5"}>Ingredient</div>
                                        {mode === "category" && <div className="col-span-3">Supplier</div>}
                                        <div className="col-span-2">Quantity</div>
                                        <div className="col-span-2">Unit Price</div>
                                        <div className={mode === "category" ? "col-span-1 text-right" : "col-span-2 text-right"}>Subtotal</div>
                                        <div className={mode === "category" ? "hidden" : "col-span-1 text-right"}>Action</div>
                                    </div>
                                    <div className="space-y-3">
                                        {fields.map((field, index) => {
                                            if (mode === "supplier") {
                                                const currentSupplierId = form.watch("supplier_id");
                                                const availableIngredients = supplierIngredients
                                                    ? supplierIngredients
                                                        .filter((si: any) => String(si.supplier_id) === String(currentSupplierId))
                                                        .map((si: any) => ({
                                                            label: si.ingredient?.name || `Unknown (${si.ingredient_id})`,
                                                            value: String(si.ingredient_id),
                                                            price: si.price
                                                        }))
                                                    : ingredients.map((i: any) => ({ label: i.name, value: String(i.id), price: 0 }));

                                                return (
                                                    <div key={field.id} className="grid grid-cols-12 gap-4 items-start bg-card border rounded-lg p-3 shadow-sm transition-all hover:shadow-md">
                                                        <div className="col-span-5">
                                                            <XFormSelect
                                                                name={`items.${index}.ingredient_id`}
                                                                options={availableIngredients}
                                                                onSelect={(opt) => form.setValue(`items.${index}.unit_price`, opt.price as number)}
                                                            />
                                                        </div>
                                                        <div className="col-span-2">
                                                            <XFormInput type="number" step="0.01" name={`items.${index}.quantity`} />
                                                        </div>
                                                        <div className="col-span-2">
                                                            <XFormInput type="number" step="0.01" name={`items.${index}.unit_price`} />
                                                        </div>
                                                        <div className="col-span-2 flex justify-end pt-2 font-medium">
                                                            ${(Number(items[index]?.quantity || 0) * Number(items[index]?.unit_price || 0)).toFixed(2)}
                                                        </div>
                                                        <div className="col-span-1 flex justify-end pt-1">
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1} className="hover:bg-red-50 hover:text-red-500 transition-colors">
                                                                <Trash2 className="size-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            } else {
                                                // Category mode
                                                const globalCategoryId = form.watch("category_id");
                                                const currentIngredientId = form.watch(`items.${index}.ingredient_id`);

                                                const availableIngredients = globalCategoryId && Number(globalCategoryId) > 0
                                                    ? ingredients.filter((i: any) => String(i.category_id) === String(globalCategoryId))
                                                    : ingredients;

                                                const availableSuppliers = currentIngredientId && Number(currentIngredientId) > 0
                                                    ? supplierIngredients
                                                        .filter((si: any) => String(si.ingredient_id) === String(currentIngredientId))
                                                        .map((si: any) => {
                                                            const supplier = suppliers.find((s: any) => String(s.id) === String(si.supplier_id));
                                                            return {
                                                                label: supplier ? supplier.name : `Supplier (${si.supplier_id})`,
                                                                value: String(si.supplier_id),
                                                                price: si.price
                                                            };
                                                        })
                                                    : [];

                                                return (
                                                    <div key={field.id} className="grid grid-cols-12 gap-2 md:gap-4 items-start bg-card border rounded-lg p-3 shadow-sm transition-all hover:shadow-md relative">
                                                        <div className="col-span-12 md:col-span-4">
                                                            <XFormSelect
                                                                name={`items.${index}.ingredient_id`}
                                                                options={availableIngredients.map((i: any) => ({ label: i.name, value: String(i.id) }))}
                                                            />
                                                        </div>
                                                        <div className="col-span-12 md:col-span-3">
                                                            <XFormSelect
                                                                name={`items.${index}.supplier_id`}
                                                                options={availableSuppliers}
                                                                onSelect={(opt) => form.setValue(`items.${index}.unit_price`, opt.price as number)}
                                                            />
                                                        </div>
                                                        <div className="col-span-6 md:col-span-2">
                                                            <XFormInput type="number" step="0.01" name={`items.${index}.quantity`} />
                                                        </div>
                                                        <div className="col-span-6 md:col-span-2">
                                                            <XFormInput type="number" step="0.01" name={`items.${index}.unit_price`} />
                                                        </div>
                                                        <div className="col-span-10 md:col-span-1 flex justify-end pt-2 font-medium">
                                                            ${(Number(items[index]?.quantity || 0) * Number(items[index]?.unit_price || 0)).toFixed(2)}
                                                        </div>
                                                        <div className="absolute -top-3 -right-3 md:relative md:top-auto md:right-auto md:col-span-1 flex justify-end pt-1">
                                                            <Button type="button" variant="destructive" size="icon" onClick={() => remove(index)} disabled={fields.length === 1} className="size-6 md:size-8 md:variant-ghost md:bg-transparent md:text-foreground md:hover:bg-red-50 md:hover:text-red-500 transition-colors rounded-full md:rounded-md">
                                                                <Trash2 className="size-3 md:size-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                </div>
                                
                                <div className="mt-6 flex justify-end text-xl font-bold bg-muted/50 p-4 rounded-lg">
                                    Total: ${subtotal.toFixed(2)}
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
