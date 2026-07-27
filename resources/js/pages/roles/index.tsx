import { router, usePage } from "@inertiajs/react";
import { Edit, Plus, Settings, Shield, Trash2, Users } from "lucide-react";
import { Badge } from "@/components/shadcn/ui/badge";
import { Button } from "@/components/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { Separator } from "@/components/shadcn/ui/separator";
import { XPage } from "@/components/x/page/XPage";
import { useAbility } from "@/hooks/use-ability";
import { Action, Entity } from "@/lib/permissions";
import { toast } from "sonner";

interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  permissions: Permission[];
  users_count: number;
  description?: string;
}

interface PageProps {
  permissions: Permission[];
  roles: Role[];
  userPermissions: string[];
  [key: string]: unknown;
}

export default function RolesPermissionsManager() {
  const { permissions, roles } = usePage<PageProps>().props;
  const ability = useAbility();

  const handleDeleteRole = (roleId: number) => {
    if (!confirm("Are you sure you want to delete this role?")) {
      return;
    }

    router.delete(`/roles/${roleId}`, {
      preserveScroll: true,
      onSuccess: () => {
        toast.success("Role deleted successfully");
      },
      onError: (errors) => {
        console.error("Failed to delete role:", errors);
        toast.error("Failed to delete role");
      },
    });
  };

  const handleCreateRole = () => {
    router.visit("/roles/create");
  };

  const handleEditRole = (roleId: number) => {
    router.visit(`/roles/${roleId}/edit`);
  };

  return (
    <XPage breadcrumbs={[{ label: "Roles and Permissions", href: "/roles" }]}>
      <div className="container mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-bold text-2xl text-foreground">
              Roles & Permissions
            </h1>
            <p className="mt-1 text-muted-foreground">
              Manage user roles and their associated permissions
            </p>
          </div>
          {ability.can(Action.Create, Entity.Roles) && (
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={handleCreateRole}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Total Roles</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">{roles.length}</div>
              <p className="text-muted-foreground text-xs">
                Active roles in system
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">
                {roles.reduce((sum, role) => sum + role.users_count, 0)}
              </div>
              <p className="text-muted-foreground text-xs">
                Users with assigned roles
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="font-medium text-sm">Permissions</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="font-bold text-2xl">{permissions.length}</div>
              <p className="text-muted-foreground text-xs">
                Available permissions
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg capitalize">
                    {role.name.replace(/[-_]/g, " ")}
                  </CardTitle>
                  <div className="flex space-x-1">
                    {ability.can(Action.Update, Entity.Roles) && (
                      <Button
                        onClick={() => handleEditRole(role.id)}
                        size="sm"
                        variant="ghost"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {ability.can(Action.Delete, Entity.Roles) && (
                      <Button
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteRole(role.id)}
                        size="sm"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Users assigned:</span>
                  <Badge variant="secondary">{role.users_count}</Badge>
                </div>
                <Separator />
                <div className="space-y-2">
                  <span className="font-medium text-sm">Permissions</span>
                  <div className="flex flex-wrap gap-1">
                    {[
                      ...new Set(
                        role.permissions.map(
                          (permission) =>
                            permission.name.split(".")[1] || permission.name
                        )
                      ),
                    ]
                      .slice(0, 3)
                      .map((label, index) => (
                        <Badge className="text-xs capitalize" key={index} variant="outline">
                          {label.replace(/[-_]/g, " ")}
                        </Badge>
                      ))}

                    {new Set(
                      role.permissions.map(
                        (permission) =>
                          permission.name.split(".")[1] || permission.name
                      )
                    ).size > 3 && (
                      <Badge className="text-xs" variant="outline">
                        +
                        {new Set(
                          role.permissions.map(
                            (permission) =>
                              permission.name.split(".")[1] || permission.name
                          )
                        ).size - 3}{" "}
                        more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </XPage>
  );
}