<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (string) $user->id === (string) $id;
});

Broadcast::channel('orders.{locationId}', function ($user, $locationId) {
    return $user->hasRole('admin') || (string) $user->business_location_id === (string) $locationId;
});

Broadcast::channel('tables.{locationId}', function ($user, $locationId) {
    return $user->hasRole('admin') || (string) $user->business_location_id === (string) $locationId;
});
