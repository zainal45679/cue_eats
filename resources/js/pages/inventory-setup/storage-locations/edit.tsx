import React from "react";
import StorageLocationFormPage from "./_components/form-page";
import type { PageProps } from "@/types";

export default function EditStorageLocation({
  storageLocation,
  businessLocations,
}: PageProps<{ storageLocation: any; businessLocations: any[] }>) {
  return (
    <StorageLocationFormPage
      storageLocation={storageLocation}
      businessLocations={businessLocations}
    />
  );
}
