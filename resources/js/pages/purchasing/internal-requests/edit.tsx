import React from "react";
import FormPage from "./_components/form-page";

export default function InternalRequestEdit({ internalRequest }: { internalRequest: any }) {
    return <FormPage defaultValues={internalRequest} />;
}
