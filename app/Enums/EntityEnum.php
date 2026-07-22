<?php

declare(strict_types=1);

namespace App\Enums;

enum EntityEnum: string
{
    case Ingredients = 'ingredients';
    case PaymentTerms = 'payment-terms';
    case Roles = 'roles';
    case Users = 'users';
    case Dashboard = 'dashboard';
    case System = 'system';
    case Countries = 'countries';
    case CurrencyTax = 'currency-tax';
    case BusinessLocations = 'business-locations';
    case StorageLocations = 'storage-locations';
    case UnitsOfMeasure = 'units-of-measure';
    case Brands = 'brands';
    case IngredientCategories = 'ingredient-categories';
    case Suppliers = 'suppliers';
    case IngredientSuppliers = 'ingredient-suppliers';
    case ApprovalConfigurations = 'approval-configurations';
    case InventoryBalances = 'inventory-balances';

    public function actions(): array
    {
        return match ($this) {
            self::Dashboard => [ActionEnum::Access],
            self::System => [ActionEnum::Manage],
            default => ActionEnum::common(),
        };
    }

    public function key(ActionEnum $action): string
    {
        return "{$action->value}.{$this->value}";
    }
}
