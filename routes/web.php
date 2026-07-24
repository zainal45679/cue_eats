<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('auth/login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard/index');
    })->name('dashboard');

    Route::post('set-active-location', function (\Illuminate\Http\Request $request) {
        $request->validate(['location_id' => 'nullable|exists:business_locations,id']);
        if ($request->location_id) {
            session(['active_location_id' => $request->location_id]);
        } else {
            session()->forget('active_location_id');
        }
        return redirect()->back();
    })->name('set-active-location');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
// Admin routes
require __DIR__.'/adminRoutes.php';
