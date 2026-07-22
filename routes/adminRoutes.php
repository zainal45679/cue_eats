<?php

declare(strict_types=1);

use App\Http\Controllers\Dashboard\BusinessLocationController;
use App\Http\Controllers\Dashboard\CountryController;
use App\Http\Controllers\Dashboard\CurrencyTaxController;
use App\Http\Controllers\Dashboard\RoleController;
use App\Http\Controllers\Dashboard\StorageLocationController;
use App\Http\Controllers\Dashboard\UnitOfMeasureController;
use App\Http\Controllers\Dashboard\UserController;
use App\Http\Controllers\Dashboard\BrandController;
use App\Http\Controllers\Dashboard\IngredientCategoryController;
use App\Http\Controllers\Dashboard\PaymentTermController;
use App\Http\Controllers\Dashboard\IngredientController;
use App\Http\Controllers\Dashboard\SupplierController;
use App\Http\Controllers\Dashboard\IngredientSupplierController;
use App\Http\Controllers\Dashboard\ApprovalConfigurationController;
use App\Http\Controllers\Dashboard\InventoryBalanceController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    // Inventory Setup
    Route::prefix('inventory-setup')->group(function () {
        Route::get('countries/search', [CountryController::class, 'search'])->name('countries.search');
        Route::resource('countries', CountryController::class);

        Route::get('currency-tax/search', [CurrencyTaxController::class, 'search'])->name('currency-tax.search');
        Route::resource('currency-tax', CurrencyTaxController::class);

        Route::get('business-locations/search', [BusinessLocationController::class, 'search'])->name('business-locations.search');
        Route::resource('business-locations', BusinessLocationController::class);

        Route::get('storage-locations/search', [StorageLocationController::class, 'search'])->name('storage-locations.search');
        Route::resource('storage-locations', StorageLocationController::class);

        Route::get('units-of-measure/search', [UnitOfMeasureController::class, 'search'])->name('units-of-measure.search');
        Route::resource('units-of-measure', UnitOfMeasureController::class);

        Route::resource('inventory-balances', InventoryBalanceController::class)->only(['index']);
    });

    // Supply Chain
    Route::prefix('supply-chain')->group(function () {
        Route::get('brands/search', [BrandController::class, 'search'])->name('brands.search');
        Route::resource('brands', BrandController::class);

        Route::get('ingredient-categories/search', [IngredientCategoryController::class, 'search'])->name('ingredient-categories.search');
        Route::resource('ingredient-categories', IngredientCategoryController::class);

        Route::get('payment-terms/search', [PaymentTermController::class, 'search'])->name('payment-terms.search');
        Route::resource('payment-terms', PaymentTermController::class);

        Route::get('ingredients/search', [IngredientController::class, 'search'])->name('ingredients.search');
        Route::resource('ingredients', IngredientController::class);

        Route::get('suppliers/search', [SupplierController::class, 'search'])->name('suppliers.search');
        Route::resource('suppliers', SupplierController::class);

        Route::get('ingredient-suppliers/search', [IngredientSupplierController::class, 'search'])->name('ingredient-suppliers.search');
        Route::resource('ingredient-suppliers', IngredientSupplierController::class)->parameters([
            'ingredient-suppliers' => 'mapping'
        ]);

        Route::resource('approval-configurations', ApprovalConfigurationController::class);
    });

    // Roles Routes
    Route::get('roles/search', [RoleController::class, 'search'])->name('roles.search');

    Route::resource('roles', RoleController::class);

    Route::resource('users', UserController::class);
});
