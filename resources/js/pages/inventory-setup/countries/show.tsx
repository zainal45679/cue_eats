import { FormMode } from "@/components/x/enum";
import { Head } from "@inertiajs/react";
import type { PageProps } from "@/types";
import CountryForm from "./_components/form-page";

export default function ShowCountry({ country }: PageProps<{ country: any }>) {
  return (
    <>
      <Head title={country.name} />
      <div className="space-y-6">
        <CountryForm
          mode={FormMode.VIEW}
          pageData={country}
          title={country.name}
        />
      </div>
    </>
  );
}
