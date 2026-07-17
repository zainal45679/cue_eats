import { Form, Head } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";
import InputError from "@/components/dashboard/input-error";
import { Button } from "@/components/shadcn/ui/button";
import { Checkbox } from "@/components/shadcn/ui/checkbox";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import AuthenticatedSessionController from "@/generated/actions/App/Http/Controllers/Auth/AuthenticatedSessionController";
import AuthLayout from "@/layouts/auth-layout";

interface LoginProps {
  status?: string;
}

export default function Login({ status }: LoginProps) {
  return (
    <AuthLayout
      description="Enter your email and password below to log in"
      title="Log in to your account"
    >
      <Head title="Log in" />

      <Form
        {...AuthenticatedSessionController.store.form()}
        className="flex flex-col gap-6"
        resetOnSuccess={["password"]}
      >
        {({ processing, errors }) => (
          <>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  autoComplete="email"
                  autoFocus
                  id="email"
                  name="email"
                  placeholder="email@example.com"
                  required
                  tabIndex={1}
                  type="email"
                />
                <InputError message={errors.email} />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  autoComplete="current-password"
                  id="password"
                  name="password"
                  placeholder="Password"
                  required
                  tabIndex={2}
                  type="password"
                />
                <InputError message={errors.password} />
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox id="remember" name="remember" tabIndex={3} />
                <Label htmlFor="remember">Remember me</Label>
              </div>

              <Button
                className="w-full"
                data-test="login-button"
                disabled={processing}
                tabIndex={4}
                type="submit"
              >
                {processing && (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                )}
                Log in
              </Button>
            </div>
          </>
        )}
      </Form>

      {status && (
        <div className="mb-4 text-center font-medium text-green-600 text-sm">
          {status}
        </div>
      )}
    </AuthLayout>
  );
}
