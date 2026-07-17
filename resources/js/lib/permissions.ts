export const Action = {
  Create : "create",
  Read : "read",
  Update : "update",
  Delete : "delete",
  Access : "access",
  Manage : "manage",
} as const;

export const Entity = {
  Products : "products",
  Roles : "roles",
  Users : "users",
  Dashboard : "dashboard",
  System : "system",
} as const; 
