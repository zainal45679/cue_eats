<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where('email', 'staff@example.com')->first();
echo "Roles: " . implode(', ', $user->getRoleNames()->toArray()) . "\n";
echo "Can approve IR: " . ($user->hasPermissionTo('approve.internal-requests') ? 'Yes' : 'No') . "\n";
echo "Can approve PO: " . ($user->hasPermissionTo('approve.purchase-orders') ? 'Yes' : 'No') . "\n";
