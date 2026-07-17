import { Form } from "@inertiajs/react";
import { useRef } from "react";
import HeadingSmall from "@/components/dashboard/heading-small";
import InputError from "@/components/dashboard/input-error";
import { Button } from "@/components/shadcn/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/ui/dialog";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import ProfileController from "@/generated/actions/App/Http/Controllers/Settings/ProfileController";

export default function DeleteUser() {
  const passwordInput = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6">
      <HeadingSmall
        description="Delete your account and all of its resources"
        title="Delete account"
      />
      <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
        <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
          <p className="font-medium">Warning</p>
          <p className="text-sm">
            Please proceed with caution, this cannot be undone.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button data-test="delete-user-button" variant="destructive">
              Delete account
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>
              Are you sure you want to delete your account?
            </DialogTitle>
            <DialogDescription>
              Once your account is deleted, all of its resources and data will
              also be permanently deleted. Please enter your password to confirm
              you would like to permanently delete your account.
            </DialogDescription>

            <Form
              {...ProfileController.destroy.form()}
              className="space-y-6"
              onError={() => passwordInput.current?.focus()}
              options={{
                preserveScroll: true,
              }}
              resetOnSuccess
            >
              {({ resetAndClearErrors, processing, errors }) => (
                <>
                  <div className="grid gap-2">
                    <Label className="sr-only" htmlFor="password">
                      Password
                    </Label>

                    <Input
                      autoComplete="current-password"
                      id="password"
                      name="password"
                      placeholder="Password"
                      ref={passwordInput}
                      type="password"
                    />

                    <InputError message={errors.password} />
                  </div>

                  <DialogFooter className="gap-2">
                    <DialogClose asChild>
                      <Button
                        onClick={() => resetAndClearErrors()}
                        variant="secondary"
                      >
                        Cancel
                      </Button>
                    </DialogClose>

                    <Button asChild disabled={processing} variant="destructive">
                      <button
                        data-test="confirm-delete-user-button"
                        type="submit"
                      >
                        Delete account
                      </button>
                    </Button>
                  </DialogFooter>
                </>
              )}
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
