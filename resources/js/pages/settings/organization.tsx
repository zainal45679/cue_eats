import { useRef, useState } from "react";
import { Head, useForm } from "@inertiajs/react";
import { Form } from "@/components/shadcn/ui/form";
import { Button } from "@/components/shadcn/ui/button";
import { Input } from "@/components/shadcn/ui/input";
import { toast } from "sonner";
import HeadingSmall from "@/components/dashboard/heading-small";
import { Label } from "@/components/shadcn/ui/label";
import { Switch } from "@/components/shadcn/ui/switch";
import { XPage } from "@/components/x/page/XPage";

export default function Organization({ organization }: { organization: any }) {
  const form = useForm({
    name: organization.name || "",
    code: organization.code || "",
    logo: null as File | null,
    status: organization.status ?? true,
    _method: "patch",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imgError, setImgError] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setData("logo", file);
      setPreviewUrl(URL.createObjectURL(file));
      setImgError(false);
    }
  };

  const currentLogo = previewUrl || (organization.logo ? `/storage/${organization.logo}` : null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    form.post("/settings/organization", {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Organization updated successfully");
      },
    });
  };

  return (
    <XPage title="Organization">
      <div className="space-y-6 max-w-2xl">
        <HeadingSmall
          description="Update your organization's name, code, and logo"
          title="Organization"
        />

        <form onSubmit={submit} className="space-y-6">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                name="name"
                value={form.data.name}
                onChange={(e) => form.setData("name", e.target.value)}
                className="mt-2"
                disabled={form.processing}
              />
              {form.errors.name && <p className="text-sm text-destructive mt-1">{form.errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="code">Organization Code</Label>
              <Input
                id="code"
                name="code"
                value={form.data.code}
                onChange={(e) => form.setData("code", e.target.value)}
                className="mt-2"
                disabled={form.processing}
              />
              {form.errors.code && <p className="text-sm text-destructive mt-1">{form.errors.code}</p>}
            </div>

            <div>
              <Label htmlFor="logo">Logo</Label>
              <div className="flex items-center gap-4 mt-2">
                {currentLogo && !imgError ? (
                  <div className="h-16 w-16 overflow-hidden rounded-md border border-border bg-white p-1">
                    <img 
                      src={currentLogo} 
                      alt="Organization Logo" 
                      className="h-full w-full object-contain" 
                      onError={() => setImgError(true)}
                    />
                  </div>
                ) : (
                  <div className="h-16 w-16 overflow-hidden rounded-md border border-border flex items-center justify-center bg-muted text-xs text-muted-foreground">
                    {imgError ? "Broken" : "No Logo"}
                  </div>
                )}
                
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={form.processing}
                >
                  Change Logo
                </Button>
              </div>
              {form.errors.logo && <p className="text-sm text-destructive mt-1">{form.errors.logo}</p>}
            </div>

            <div className="flex items-center space-x-4 mt-4">
              <Label htmlFor="status">Organization Status</Label>
              <Switch
                checked={form.data.status}
                onCheckedChange={(checked) => form.setData("status", checked)}
                disabled={form.processing}
              />
              {form.errors.status && <p className="text-sm text-destructive mt-1">{form.errors.status}</p>}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button disabled={form.processing} type="submit">
              Save
            </Button>
          </div>
        </form>
      </div>
    </XPage>
  );
}
