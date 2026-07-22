import React from "react";
import StorageLocationFormPage from "./_components/form-page";
import type { PageProps } from "@/types";

export default function AddStorageLocation({
  businessLocations,
}: PageProps<{ businessLocations: any[] }>) {
  return (
    <StorageLocationFormPage businessLocations={businessLocations} />
  );
}
