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

        Route::resource('inventory-balances', InventoryBalanceController::class);
        Route::resource('approval-configurations', ApprovalConfigurationController::class);
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

    });

    // Inventory Module
    Route::prefix('inventory')->group(function () {
        Route::get('ledger', [\App\Http\Controllers\Dashboard\InventoryLedgerController::class, 'index'])->name('ledger.index');
    });

    // Purchasing
    Route::prefix('purchasing')->group(function () {
        Route::post('internal-requests/{internal_request}/approve', [\App\Http\Controllers\Dashboard\InternalRequestController::class, 'approve'])->name('internal-requests.approve');
        Route::post('internal-requests/{internal_request}/reject', [\App\Http\Controllers\Dashboard\InternalRequestController::class, 'reject'])->name('internal-requests.reject');
        Route::resource('internal-requests', \App\Http\Controllers\Dashboard\InternalRequestController::class);

        Route::post('stos/{stock_transfer_order}/dispatch', [\App\Http\Controllers\Dashboard\StockTransferOrderController::class, 'dispatchSto'])->name('stos.dispatch');
        Route::get('stos', [\App\Http\Controllers\Dashboard\StockTransferOrderController::class, 'index'])->name('stos.index');
        Route::get('stos/{stock_transfer_order}', [\App\Http\Controllers\Dashboard\StockTransferOrderController::class, 'show'])->name('stos.show');
        
        Route::get('grns', [\App\Http\Controllers\Dashboard\GoodsReceiptNoteController::class, 'index'])->name('grns.index');
        Route::get('grns/create', [\App\Http\Controllers\Dashboard\GoodsReceiptNoteController::class, 'create'])->name('grns.create');
        Route::post('grns', [\App\Http\Controllers\Dashboard\GoodsReceiptNoteController::class, 'store'])->name('grns.store');
        Route::get('grns/{goods_receipt_note}', [\App\Http\Controllers\Dashboard\GoodsReceiptNoteController::class, 'show'])->name('grns.show');
        
        Route::post('purchase-orders/{purchase_order}/approve', [\App\Http\Controllers\Dashboard\PurchaseOrderController::class, 'approve'])->name('purchase-orders.approve');
        Route::post('purchase-orders/{purchase_order}/reject', [\App\Http\Controllers\Dashboard\PurchaseOrderController::class, 'reject'])->name('purchase-orders.reject');
        Route::resource('purchase-orders', \App\Http\Controllers\Dashboard\PurchaseOrderController::class);
    });

    // Roles Routes
    Route::get('roles/search', [RoleController::class, 'search'])->name('roles.search');

    Route::resource('roles', RoleController::class);

    Route::resource('users', UserController::class);
});
