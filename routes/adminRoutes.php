<?php

declare(strict_types=1);

use App\Http\Controllers\Dashboard\ProductController;
use App\Http\Controllers\Dashboard\RoleController;
use App\Http\Controllers\Dashboard\UserController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    // Bottles Routes
    Route::get('products/search', [ProductController::class, 'search'])->name('products.search');
    Route::resource('products', ProductController::class);

    // Roles Routes
    Route::get('roles/search', [RoleController::class, 'search'])->name('roles.search');

    Route::resource('roles', RoleController::class);

    Route::resource('users', UserController::class);
});
