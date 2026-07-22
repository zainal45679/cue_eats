import React from "react";
import BusinessLocationFormPage from "./_components/form-page";
import type { PageProps } from "@/types";

export default function BusinessLocationEdit({
  businessLocation,
  countries,
  parentLocations,
  taxProfiles,
}: PageProps<{ businessLocation: any; countries: any[]; parentLocations: any[]; taxProfiles: any[] }>) {
  return (
    <BusinessLocationFormPage 
      businessLocation={businessLocation} 
      countries={countries} 
      parentLocations={parentLocations} 
      taxProfiles={taxProfiles}
    />
  );
}
