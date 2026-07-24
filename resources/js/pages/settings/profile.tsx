import { Transition } from "@headlessui/react";
import { Form, Head, Link, usePage } from "@inertiajs/react";
import HeadingSmall from "@/components/dashboard/heading-small";
import InputError from "@/components/dashboard/input-error";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import ProfileController from "@/generated/actions/App/Http/Controllers/Settings/ProfileController";
import { XPage } from "@/components/x/page/XPage";
import type { SharedData } from "@/types";

export default function Profile({
  mustVerifyEmail,
  status,
}: {
  mustVerifyEmail: boolean;
  status?: string;
}) {
  const { auth } = usePage<SharedData>().props;

  return (
    <XPage title="Profile">
      <div className="space-y-6 max-w-2xl">
        <HeadingSmall
          description="Update your name and email address"
          title="Profile information"
        />

        <Form
          {...ProfileController.update.form()}
          className="space-y-6"
          options={{
            preserveScroll: true,
          }}
        >
          {({ processing, recentlySuccessful, errors }) => (
            <>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>

                <Input
                  autoComplete="name"
                  className="mt-1 block w-full"
                  defaultValue={auth.user.name}
                  id="name"
                  name="name"
                  placeholder="Full name"
                  required
                />

                <InputError className="mt-2" message={errors.name} />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>

                <Input
                  autoComplete="username"
                  className="mt-1 block w-full"
                  defaultValue={auth.user.email}
                  id="email"
                  name="email"
                  placeholder="Email address"
                  required
                  type="email"
                />

                <InputError className="mt-2" message={errors.email} />
              </div>

              {mustVerifyEmail && auth.user.email_verified_at === null && (
                <div>
                  <p className="-mt-4 text-muted-foreground text-sm">
                    Your email address is unverified.{" "}
                    <Link
                      as="button"
                      className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                    >
                      Click here to resend the verification email.
                    </Link>
                  </p>

                  {status === "verification-link-sent" && (
                    <div className="mt-2 font-medium text-green-600 text-sm">
                      A new verification link has been sent to your email
                      address.
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4">
                <Button
                  data-test="update-profile-button"
                  disabled={processing}
                >
                  Save
                </Button>

                <Transition
                  enter="transition ease-in-out"
                  enterFrom="opacity-0"
                  leave="transition ease-in-out"
                  leaveTo="opacity-0"
                  show={recentlySuccessful}
                >
                  <p className="text-neutral-600 text-sm">Saved</p>
                </Transition>
              </div>
            </>
          )}
        </Form>
      </div>
    </XPage>
  );
}
