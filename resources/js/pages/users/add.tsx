import { FormMode } from "@/components/x/enum";
import { XPage } from "@/components/x/page/XPage";
import UserForm from "./_components/form-page";

export default function AddUsers() {
  return (
    <XPage breadcrumbs={[{ label: "Users", href: "/users" }]}>
      <UserForm mode={FormMode.CREATE} title="Add User" />
    </XPage>
  );
}
