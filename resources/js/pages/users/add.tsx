import { XPage } from "@/components/x/page/XPage";
import UserForm from "./_components/form-page";
import type { PageProps } from "@/types";

export default function AddUser({ businessLocations }: PageProps<{ businessLocations: any[] }>) {
  return (
    <XPage breadcrumbs={[{ label: "Users", href: "/users" }]}>
      <UserForm mode="create" title="Add User" businessLocations={businessLocations} />
    </XPage>
  );
}
