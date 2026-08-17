<?php

namespace App\Events;

use App\Models\DiningTable;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TableStatusUpdated implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $tableId;
    public $locationId;

    public function __construct($tableId, $locationId)
    {
        $this->tableId = $tableId;
        $this->locationId = $locationId;
    }

    public function broadcastOn()
    {
        return new Channel('tables.' . $this->locationId);
    }
}
