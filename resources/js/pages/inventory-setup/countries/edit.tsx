import { FormMode } from "@/components/x/enum";
import { Head } from "@inertiajs/react";
import type { PageProps } from "@/types";
import CountryForm from "./_components/form-page";

export default function EditCountry({ country }: PageProps<{ country: any }>) {
  return (
    <>
      <Head title={`Edit ${country.name}`} />
      <div className="space-y-6">
        <CountryForm
          mode={FormMode.EDIT}
          pageData={country}
          title={`Edit ${country.name}`}
        />
      </div>
    </>
  );
}
