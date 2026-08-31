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
        Route::get('live-stock', [InventoryBalanceController::class, 'index'])->name('live-stock.index');
        Route::post('storage-transfers', [StorageLocationController::class, 'transfer'])->name('storage-locations.transfer');
        Route::get('consumption', [\App\Http\Controllers\Dashboard\InventoryConsumptionController::class, 'index'])->name('consumption.index');
    });

    // Purchasing
    Route::prefix('purchasing')->group(function () {
        Route::post('internal-requests/{internal_request}/approve', [\App\Http\Controllers\Dashboard\InternalRequestController::class, 'approve'])->name('internal-requests.approve');
        Route::get('internal-requests/{internal_request}/fulfill', [\App\Http\Controllers\Dashboard\InternalRequestController::class, 'fulfill'])->name('internal-requests.fulfill');
        Route::post('internal-requests/{internal_request}/fulfill', [\App\Http\Controllers\Dashboard\InternalRequestController::class, 'storeFulfill'])->name('internal-requests.store-fulfill');
        Route::post('internal-requests/{internal_request}/reject', [\App\Http\Controllers\Dashboard\InternalRequestController::class, 'reject'])->name('internal-requests.reject');
        Route::resource('internal-requests', \App\Http\Controllers\Dashboard\InternalRequestController::class);

        Route::post('stos/{stock_transfer_order}/dispatch', [\App\Http\Controllers\Dashboard\StockTransferOrderController::class, 'dispatchSto'])->name('stos.dispatch');
        Route::post('stos/{stock_transfer_order}/reject', [\App\Http\Controllers\Dashboard\StockTransferOrderController::class, 'rejectSto'])->name('stos.reject');
        Route::get('stos', [\App\Http\Controllers\Dashboard\StockTransferOrderController::class, 'index'])->name('stos.index');
        Route::get('stos/{stock_transfer_order}', [\App\Http\Controllers\Dashboard\StockTransferOrderController::class, 'show'])->name('stos.show');
        
        Route::get('grns', [\App\Http\Controllers\Dashboard\GoodsReceiptNoteController::class, 'index'])->name('grns.index');
        Route::get('grns/create', [\App\Http\Controllers\Dashboard\GoodsReceiptNoteController::class, 'create'])->name('grns.create');
        Route::post('grns', [\App\Http\Controllers\Dashboard\GoodsReceiptNoteController::class, 'store'])->name('grns.store');
        Route::get('grns/{goods_receipt_note}', [\App\Http\Controllers\Dashboard\GoodsReceiptNoteController::class, 'show'])->name('grns.show');
        
        Route::get('purchase-orders/{purchase_order}/approve', [\App\Http\Controllers\Dashboard\PurchaseOrderController::class, 'approvalForm'])->name('purchase-orders.approval-form');
        Route::post('purchase-orders/{purchase_order}/approve', [\App\Http\Controllers\Dashboard\PurchaseOrderController::class, 'approve'])->name('purchase-orders.approve');
        Route::post('purchase-orders/{purchase_order}/submit', [\App\Http\Controllers\Dashboard\PurchaseOrderController::class, 'submit'])->name('purchase-orders.submit');
        Route::post('purchase-orders/{purchase_order}/reject', [\App\Http\Controllers\Dashboard\PurchaseOrderController::class, 'reject'])->name('purchase-orders.reject');
        Route::resource('purchase-orders', \App\Http\Controllers\Dashboard\PurchaseOrderController::class);
    });

    // Roles Routes
    Route::get('roles/search', [RoleController::class, 'search'])->name('roles.search');

    Route::resource('roles', RoleController::class);

    // Menu Management
    Route::prefix('menu-pos')->group(function () {
        // Tables / Dine-in
        Route::get('tables', [\App\Http\Controllers\Dashboard\TableController::class, 'index'])->name('pos.tables');
        Route::post('zones', [\App\Http\Controllers\Dashboard\TableController::class, 'storeZone'])->name('zones.store');
        Route::put('zones/{zone}', [\App\Http\Controllers\Dashboard\TableController::class, 'updateZone'])->name('zones.update');
        Route::delete('zones/{zone}', [\App\Http\Controllers\Dashboard\TableController::class, 'destroyZone'])->name('zones.destroy');
        
        Route::post('tables/create', [\App\Http\Controllers\Dashboard\TableController::class, 'storeTable'])->name('tables.store');
        Route::put('tables/{table}', [\App\Http\Controllers\Dashboard\TableController::class, 'updateTable'])->name('tables.update');
        Route::delete('tables/{table}', [\App\Http\Controllers\Dashboard\TableController::class, 'destroyTable'])->name('tables.destroy');
        Route::post('tables/merge', [\App\Http\Controllers\Dashboard\TableController::class, 'merge'])->name('pos.tables.merge');
        Route::post('tables/unmerge', [\App\Http\Controllers\Dashboard\TableController::class, 'unmerge'])->name('pos.tables.unmerge');
        Route::get('/', [\App\Http\Controllers\Dashboard\MenuManagementController::class, 'index'])->name('menu-management.index');
        
        // Resource routes for form actions (except index)
        Route::resource('categories', \App\Http\Controllers\Dashboard\MenuCategoryController::class)->except('index');
        Route::resource('items', \App\Http\Controllers\Dashboard\MenuItemController::class)->except('index');
        Route::resource('modifiers', \App\Http\Controllers\Dashboard\ModifierGroupController::class)->except('index');
        
        // POS Terminal
        Route::get('terminal', [\App\Http\Controllers\Dashboard\PosController::class, 'index'])->name('pos.terminal');
        Route::post('terminal/open-table', [\App\Http\Controllers\Dashboard\PosController::class, 'openTable'])->name('pos.open-table');
        Route::post('terminal/check-stock', [\App\Http\Controllers\Dashboard\PosController::class, 'checkStock'])->name('pos.check-stock');
        Route::post('terminal/occupy-table', [\App\Http\Controllers\Dashboard\PosController::class, 'occupyTable'])->name('pos.occupy-table');
        Route::post('terminal/checkout', [\App\Http\Controllers\Dashboard\PosController::class, 'checkout'])->name('pos.checkout');

        // KDS (Kitchen Display System)
        Route::get('kds', [\App\Http\Controllers\Dashboard\KdsController::class, 'index'])->name('pos.kds');
        Route::post('kds/{order}/status', [\App\Http\Controllers\Dashboard\KdsController::class, 'updateStatus'])->name('pos.kds.update-status');
        Route::post('kds/kot/{kot}/status', [\App\Http\Controllers\Dashboard\KdsController::class, 'updateKotStatus'])->name('pos.kds.kot-update-status');

        // Live Orders (Manager)
        Route::get('live-orders', [\App\Http\Controllers\Dashboard\LiveOrdersController::class, 'index'])->name('live-orders.index');
        Route::post('live-orders/items/{item}/cancel', [\App\Http\Controllers\Dashboard\LiveOrdersController::class, 'cancelOrderItem'])->name('live-orders.cancel-item');
        Route::post('live-orders/{order}/cancel', [\App\Http\Controllers\Dashboard\LiveOrdersController::class, 'cancelOrder'])->name('live-orders.cancel');


    });

    Route::resource('users', UserController::class);
});
