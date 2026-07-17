import { FormMode } from "@/components/x/enum";
import { XPage } from "@/components/x/page/XPage";
import ProductForm from "./_components/form-page";

type Product = {
  id: number;
  name: string;
  type: string;
  cost: number;
  selling_price: number;
  damage_charges: number;
  litres: number;
  quantity: number;
};

interface EditProductProps {
  product: Product;
}

export default function EditProduct({ product }: EditProductProps) {
  return (
    <XPage
      breadcrumbs={[
        { label: "Product", href: "/products" },
        { label: "Edit Product" },
      ]}
    >
      <ProductForm
        mode={FormMode.EDIT}
        pageData={product}
        title={"Edit Product"}
      />
    </XPage>
  );
}
