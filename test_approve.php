<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$request = Illuminate\Http\Request::create('/purchasing/purchase-orders/8416a3be-e6e8-488d-b79a-4429d898dce3/approve', 'POST');
$user = App\Models\User::find(6);
$app->make('auth')->login($user);
$response = $kernel->handle($request);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Content: " . $response->getContent() . "\n";
