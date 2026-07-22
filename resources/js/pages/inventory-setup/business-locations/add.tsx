import React from "react";
import BusinessLocationFormPage from "./_components/form-page";
import type { PageProps } from "@/types";

export default function BusinessLocationAdd({
  countries,
  parentLocations,
  taxProfiles,
}: PageProps<{ countries: any[]; parentLocations: any[]; taxProfiles: any[] }>) {
  return <BusinessLocationFormPage countries={countries} parentLocations={parentLocations} taxProfiles={taxProfiles} />;
}
