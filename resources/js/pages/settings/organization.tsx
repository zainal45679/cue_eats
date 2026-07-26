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
    theme_color: organization.theme_color || "",
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
          description="Update your organization's name, code, logo, and brand color."
          title="Organization"
        />

        <form onSubmit={submit} className="space-y-6">
          <div className="grid gap-6">
            <div className="grid sm:grid-cols-2 gap-4">
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
            </div>

            <div className="flex items-center gap-6 rounded-lg border border-border p-4 w-fit">
              <div className="space-y-0.5">
                <Label htmlFor="status">Active Status</Label>
                <div className="text-sm text-muted-foreground">
                  Determine if the organization is active
                </div>
              </div>
              <Switch
                id="status"
                checked={form.data.status}
                onCheckedChange={(checked) => form.setData("status", checked)}
                disabled={form.processing}
              />
            </div>
            {form.errors.status && <p className="text-sm text-destructive mt-1">{form.errors.status}</p>}

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="logo">Logo</Label>
                <div className="flex items-center gap-4 mt-2">
                  {currentLogo && !imgError ? (
                    <div className="h-14 w-14 overflow-hidden rounded-md border border-border bg-white p-1 shrink-0">
                      <img 
                        src={currentLogo} 
                        alt="Organization Logo" 
                        className="h-full w-full object-contain" 
                        onError={() => setImgError(true)}
                      />
                    </div>
                  ) : (
                    <div className="h-14 w-14 overflow-hidden rounded-md border border-border flex items-center justify-center bg-muted text-xs text-muted-foreground shrink-0">
                      {imgError ? "Broken" : "No Logo"}
                    </div>
                  )}
                  
                  <input
                    type="file"
                    id="logo"
                    name="logo"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={form.processing}
                  />
                  
                  <div className="flex flex-col gap-1 w-full">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 w-fit"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={form.processing}
                    >
                      Change Logo
                    </Button>
                    <span className="text-xs text-muted-foreground">Upload image file</span>
                  </div>
                </div>
                {form.errors.logo && <p className="text-sm text-destructive mt-1">{form.errors.logo}</p>}
              </div>

              <div>
                <Label htmlFor="theme_color">Brand Color</Label>
                <div className="flex items-center gap-4 mt-2">
                  <input
                    type="color"
                    id="theme_color"
                    name="theme_color"
                    value={form.data.theme_color || "#F05340"}
                    onChange={(e) => form.setData("theme_color", e.target.value)}
                    disabled={form.processing}
                    className="h-14 w-14 cursor-pointer rounded border border-border p-1 bg-background shrink-0"
                  />
                  <div className="text-sm text-muted-foreground flex flex-col gap-1 w-full">
                    <Input 
                      value={form.data.theme_color || "#F05340"} 
                      onChange={(e) => {
                        let val = e.target.value;
                        if (val && !val.startsWith('#')) val = '#' + val;
                        form.setData("theme_color", val);
                      }}
                      className="uppercase font-mono h-8"
                      placeholder="#HEX"
                      disabled={form.processing}
                    />
                    <span className="text-xs">Hex Color Code</span>
                  </div>
                </div>
                {form.errors.theme_color && <p className="text-sm text-destructive mt-1">{form.errors.theme_color}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button disabled={form.processing} type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </XPage>
  );
}
