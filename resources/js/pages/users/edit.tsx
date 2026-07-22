import { XPage } from "@/components/x/page/XPage";
import UserForm from "./_components/form-page";
import type { PageProps } from "@/types";

export default function EditUser({
  user,
  businessLocations,
}: PageProps<{ user: any; businessLocations: any[] }>) {
  return (
    <XPage breadcrumbs={[{ label: "Users", href: "/users" }]}>
      <UserForm mode="edit" title="Edit User" user={user} businessLocations={businessLocations} />
    </XPage>
  );
}
