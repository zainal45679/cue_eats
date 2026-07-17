import { FormMode } from "@/components/x/enum";
import { XPage } from "@/components/x/page/XPage";
import products from "@/generated/routes/products";
import ProductForm from "./_components/form-page";

export default function AddProducts() {
  return (
    <XPage
      breadcrumbs={[
        { label: "Products", href: products.index() },
        { label: "Add Product" },
      ]}
    >
      <ProductForm mode={FormMode.CREATE} title="Add Product" />
    </XPage>
  );
}
