<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$user = \App\Models\User::where('email', 'staff@example.com')->first();
auth()->login($user);

$ir = \App\Models\InternalRequest::first();
if (!$ir) {
    echo "No IR found\n";
    exit;
}

echo "IR From: " . $ir->from_location_id . " To: " . $ir->to_location_id . " Status: " . $ir->status . "\n";
echo "User location: " . $user->business_location_id . "\n";
echo "Can Approve: " . (auth()->user()->can('approve', $ir) ? 'Yes' : 'No') . "\n";
echo "Can Reject: " . (auth()->user()->can('reject', $ir) ? 'Yes' : 'No') . "\n";
