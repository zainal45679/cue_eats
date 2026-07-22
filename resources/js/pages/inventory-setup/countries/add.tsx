import { FormMode } from "@/components/x/enum";
import { XPage } from "@/components/x/page/XPage";
import countries from "@/generated/routes/countries";
import CountryForm from "./_components/form-page";

import { Head } from "@inertiajs/react";

export default function AddCountry() {
  return (
    <>
      <Head title="Add Country" />
      <div className="space-y-6">
        <CountryForm mode={FormMode.CREATE} title="Add Country" />
      </div>
    </>
  );
}
