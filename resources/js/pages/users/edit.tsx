import { FormMode } from "@/components/x/enum";
import { XPage } from "@/components/x/page/XPage";
import UserForm from "./_components/form-page";

type User = {
  id: number;
  name: string;
  email: string;
};

type EditUserProps = {
  user: User;
};

export default function EditUser({ user }: EditUserProps) {
  return (
    <XPage breadcrumbs={[{ label: "Users", href: "/users" }]}>
      <UserForm mode={FormMode.EDIT} title={"Edit User"} user={user} />
    </XPage>
  );
}
