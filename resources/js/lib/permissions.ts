export const Action = {
  Create : "create",
  Read : "read",
  Update : "update",
  Delete : "delete",
  Access : "access",
  Manage : "manage",
} as const;

export const Entity = {
  Users: "users",
  Roles: "roles",
  Products: "products",
  Dashboard: "dashboard",
  System: "system",
  Countries: "countries",
  CurrencyTax: "currency-tax",
  BusinessLocations: "business-locations",
  StorageLocations: "storage-locations",
  UnitsOfMeasure: "units-of-measure",
  Brands: "brands",
  IngredientCategories: "ingredient-categories",
  Ingredients: "ingredients",
  PaymentTerms: "payment-terms",
  Suppliers: "suppliers",
  IngredientSuppliers: "ingredient-suppliers",
  ApprovalConfigurations: "approval-configurations",
  InventoryBalances: "inventory-balances",
} as const;
