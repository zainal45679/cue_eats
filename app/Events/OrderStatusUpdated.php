<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $orderId;
    public $locationId;
    public $status;
    public $kitchenStatus;
    public $tableId;

    public function __construct(Order $order)
    {
        $this->orderId = $order->id;
        $this->locationId = $order->business_location_id;
        $this->status = $order->status;
        $this->kitchenStatus = $order->kitchen_status;
        $this->tableId = $order->dining_table_id;
    }

    public function broadcastOn()
    {
        return [
            new PrivateChannel('orders.' . $this->locationId),
            new PrivateChannel('tables.' . $this->locationId),
        ];
    }
}
