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
    ingredient_id: z.string().or(z.number()).refine((v) => !!v && String(v) !== "0" && String(v) !== "", "Ingredient is required"),
    supplier_id: z.string().or(z.number()).optional(), // Used in category mode
    quantity: z.coerce.number().min(0.01, "Quantity must be > 0"),
    unit_price: z.coerce.number().min(0, "Price must be >= 0"),
});

const schema = z.object({
    supplier_id: z.string().or(z.number()).optional(), // Required in supplier mode
    category_id: z.string().or(z.number()).optional(), // Required in category mode
    delivery_location_id: z.string().or(z.number()).refine((v) => !!v && String(v) !== "0" && String(v) !== "", "Delivery Location is required"),
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
            supplier_id: defaultValues?.supplier_id || "",
            category_id: "",
            delivery_location_id: defaultValues?.delivery_location_id || "",
            expected_delivery_date: defaultValues?.expected_delivery_date || "",
            notes: defaultValues?.notes || "",
            items: defaultValues?.items || [{ ingredient_id: "", quantity: 1, unit_price: 0, supplier_id: "" }],
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
        if (mode === "supplier" && (!data.supplier_id || String(data.supplier_id) === "0" || String(data.supplier_id) === "")) {
            form.setError("supplier_id", { message: "Supplier is required" });
            return;
        }

        // Manual validation for category mode 
        if (mode === "category") {
            if (!data.category_id || String(data.category_id) === "0" || String(data.category_id) === "") {
                form.setError("category_id", { message: "Category is required" });
                return;
            }
            
            let hasError = false;
            data.items.forEach((item, index) => {
                if (!item.supplier_id || String(item.supplier_id) === "0" || String(item.supplier_id) === "") {
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
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                        <div className="mt-8">
                            <div className="flex flex-row items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold tracking-tight">Line Items</h3>
                                    <p className="text-sm text-muted-foreground">
                                        {mode === "supplier" 
                                            ? "Add items available from the selected supplier." 
                                            : "Add items from the selected category and choose a supplier for each."}
                                    </p>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ ingredient_id: 0, quantity: 1, unit_price: 0, supplier_id: 0 })}>
                                    <Plus className="mr-2 size-4" /> Add Item
                                </Button>
                            </div>
                            <div>
                                <div className="space-y-4">
                                    <div className="hidden sm:grid grid-cols-12 gap-4 items-center border border-transparent p-3 text-sm font-medium text-muted-foreground">
                                        <div className={mode === "category" ? "col-span-3" : "col-span-5"}>Ingredient</div>
                                        {mode === "category" && <div className="col-span-3">Supplier</div>}
                                        <div className="col-span-2">Quantity</div>
                                        <div className="col-span-2">Unit Price</div>
                                        <div className={mode === "category" ? "col-span-1 text-right" : "col-span-2 text-right"}>Subtotal</div>
                                        <div className="col-span-1 text-right">Action</div>
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

                                                const currentIngredientId = form.watch(`items.${index}.ingredient_id`);
                                                const selectedIngredient = ingredients.find((i: any) => String(i.id) === String(currentIngredientId));
                                                
                                                const si = supplierIngredients.find((si: any) => String(si.supplier_id) === String(currentSupplierId) && String(si.ingredient_id) === String(currentIngredientId));
                                                const uomSuffix = si?.purchase_uom?.name || selectedIngredient?.base_uom?.name || "";

                                                return (
                                                    <div key={field.id} className="flex flex-col sm:grid sm:grid-cols-12 gap-4 items-start sm:items-center bg-card border rounded-lg p-4 sm:p-3 shadow-sm transition-all hover:shadow-md relative pt-10 sm:pt-3">
                                                        <div className="w-full sm:col-span-5">
                                                            <div className="sm:hidden text-xs font-semibold text-muted-foreground mb-1">Ingredient</div>
                                                            <XFormSelect
                                                                name={`items.${index}.ingredient_id`}
                                                                options={availableIngredients}
                                                                onSelect={(opt) => form.setValue(`items.${index}.unit_price`, opt.price as number)}
                                                            />
                                                        </div>
                                                        <div className="w-full sm:col-span-2">
                                                            <div className="sm:hidden text-xs font-semibold text-muted-foreground mb-1">Quantity</div>
                                                            <XFormInput type="number" step="0.01" name={`items.${index}.quantity`} suffix={uomSuffix} />
                                                        </div>
                                                        <div className="w-full sm:col-span-2">
                                                            <div className="sm:hidden text-xs font-semibold text-muted-foreground mb-1">Unit Price</div>
                                                            <XFormInput type="number" step="0.01" name={`items.${index}.unit_price`} />
                                                        </div>
                                                        <div className="w-full sm:col-span-2 flex justify-between sm:justify-end items-center font-medium bg-muted/50 sm:bg-transparent p-2 sm:p-0 rounded">
                                                            <span className="sm:hidden text-xs font-semibold text-muted-foreground">Subtotal:</span>
                                                            <span>${(Number(items[index]?.quantity || 0) * Number(items[index]?.unit_price || 0)).toFixed(2)}</span>
                                                        </div>
                                                        <div className="absolute top-2 right-2 sm:static sm:col-span-1 flex justify-end">
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

                                                const availableIngredients = globalCategoryId && String(globalCategoryId) !== "0" && String(globalCategoryId) !== ""
                                                    ? ingredients.filter((i: any) => String(i.ingredient_category_id) === String(globalCategoryId))
                                                    : ingredients;

                                                const availableSuppliers = currentIngredientId && String(currentIngredientId) !== "0" && String(currentIngredientId) !== ""
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

                                                const selectedIngredient = ingredients.find((i: any) => String(i.id) === String(currentIngredientId));
                                                const si = supplierIngredients.find((si: any) => String(si.supplier_id) === String(currentSupplierId) && String(si.ingredient_id) === String(currentIngredientId));
                                                const uomSuffix = si?.purchase_uom?.name || selectedIngredient?.base_uom?.name || "";

                                                return (
                                                    <div key={field.id} className="flex flex-col sm:grid sm:grid-cols-12 gap-4 items-start sm:items-center bg-card border rounded-lg p-4 sm:p-3 shadow-sm transition-all hover:shadow-md relative pt-10 sm:pt-3">
                                                        <div className="w-full sm:col-span-3">
                                                            <div className="sm:hidden text-xs font-semibold text-muted-foreground mb-1">Ingredient</div>
                                                            <XFormSelect
                                                                name={`items.${index}.ingredient_id`}
                                                                options={availableIngredients.map((i: any) => ({ label: i.name, value: String(i.id) }))}
                                                            />
                                                        </div>
                                                        <div className="w-full sm:col-span-3">
                                                            <div className="sm:hidden text-xs font-semibold text-muted-foreground mb-1">Supplier</div>
                                                            <XFormSelect
                                                                name={`items.${index}.supplier_id`}
                                                                options={availableSuppliers}
                                                                onSelect={(opt) => form.setValue(`items.${index}.unit_price`, opt.price as number)}
                                                            />
                                                        </div>
                                                        <div className="w-full sm:col-span-2">
                                                            <div className="sm:hidden text-xs font-semibold text-muted-foreground mb-1">Quantity</div>
                                                            <XFormInput type="number" step="0.01" name={`items.${index}.quantity`} suffix={uomSuffix} />
                                                        </div>
                                                        <div className="w-full sm:col-span-2">
                                                            <div className="sm:hidden text-xs font-semibold text-muted-foreground mb-1">Unit Price</div>
                                                            <XFormInput type="number" step="0.01" name={`items.${index}.unit_price`} />
                                                        </div>
                                                        <div className="w-full sm:col-span-1 flex justify-between sm:justify-end items-center font-medium bg-muted/50 sm:bg-transparent p-2 sm:p-0 rounded">
                                                            <span className="sm:hidden text-xs font-semibold text-muted-foreground">Subtotal:</span>
                                                            <span>${(Number(items[index]?.quantity || 0) * Number(items[index]?.unit_price || 0)).toFixed(2)}</span>
                                                        </div>
                                                        <div className="absolute top-2 right-2 sm:static sm:col-span-1 flex justify-end">
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length === 1} className="hover:bg-red-50 hover:text-red-500 transition-colors">
                                                                <Trash2 className="size-4" />
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
                            </div>
                        </div>

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
