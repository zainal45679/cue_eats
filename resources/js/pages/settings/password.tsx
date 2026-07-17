import { Transition } from "@headlessui/react";
import { Form, Head } from "@inertiajs/react";
import { useRef } from "react";
import HeadingSmall from "@/components/dashboard/heading-small";
import InputError from "@/components/dashboard/input-error";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import PasswordController from "@/generated/actions/App/Http/Controllers/Settings/PasswordController";
import AppLayout from "@/layouts/app-layout";
import SettingsLayout from "@/layouts/settings/layout";

export default function Password() {
  const passwordInput = useRef<HTMLInputElement>(null);
  const currentPasswordInput = useRef<HTMLInputElement>(null);

  return (
    <AppLayout>
      <Head title="Password settings" />

      <SettingsLayout>
        <div className="space-y-6">
          <HeadingSmall
            description="Ensure your account is using a long, random password to stay secure"
            title="Update password"
          />

          <Form
            {...PasswordController.update.form()}
            className="space-y-6"
            onError={(errors) => {
              if (errors.password) {
                passwordInput.current?.focus();
              }

              if (errors.current_password) {
                currentPasswordInput.current?.focus();
              }
            }}
            options={{
              preserveScroll: true,
            }}
            resetOnError={[
              "password",
              "password_confirmation",
              "current_password",
            ]}
            resetOnSuccess
          >
            {({ errors, processing, recentlySuccessful }) => (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="current_password">Current password</Label>

                  <Input
                    autoComplete="current-password"
                    className="mt-1 block w-full"
                    id="current_password"
                    name="current_password"
                    placeholder="Current password"
                    ref={currentPasswordInput}
                    type="password"
                  />

                  <InputError message={errors.current_password} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password">New password</Label>

                  <Input
                    autoComplete="new-password"
                    className="mt-1 block w-full"
                    id="password"
                    name="password"
                    placeholder="New password"
                    ref={passwordInput}
                    type="password"
                  />

                  <InputError message={errors.password} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="password_confirmation">
                    Confirm password
                  </Label>

                  <Input
                    autoComplete="new-password"
                    className="mt-1 block w-full"
                    id="password_confirmation"
                    name="password_confirmation"
                    placeholder="Confirm password"
                    type="password"
                  />

                  <InputError message={errors.password_confirmation} />
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    data-test="update-password-button"
                    disabled={processing}
                  >
                    Save password
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
      </SettingsLayout>
    </AppLayout>
  );
}
