<?php

declare(strict_types=1);

use App\Models\User;
use App\Models\BusinessLocation;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\MenuCategory;
use Illuminate\Support\Carbon;

beforeEach(function () {
    $this->location = BusinessLocation::factory()->create();
    $this->user = User::factory()->create([
        'business_location_id' => $this->location->id
    ]);
});

test('eod reports page loads successfully', function () {
    $this->actingAs($this->user);
    $response = $this->get('/menu-pos/reports');
    $response->assertOk();
    $response->assertInertia(fn (\Inertia\Testing\AssertableInertia $page) => $page
        ->component('menu-pos/reports/index')
        ->has('metrics')
        ->has('topItems')
        ->has('wastage')
    );
});
