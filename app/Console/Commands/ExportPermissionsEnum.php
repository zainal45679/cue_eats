<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Enums\ActionEnum;
use App\Enums\EntityEnum;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

final class ExportPermissionsEnum extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'export:permissions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Export all permissions to a TypeScript file';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $actions = array_map(fn (ActionEnum $a) => $a->value, ActionEnum::cases());
        $entities = array_map(fn (EntityEnum $e) => $e->value, EntityEnum::cases());

        $ts = "export const Action = {\n";
        foreach ($actions as $action) {
            $ts .= '  '.Str::studly($action)." : \"$action\",\n";
        }
        $ts .= "} as const;\n\n";

        $ts .= "export const Entity = {\n";
        foreach ($entities as $entity) {
            $ts .= '  '.Str::studly($entity)." : \"$entity\",\n";
        }
        $ts .= "} as const; \n";

        $path = resource_path('js/lib/permissions.ts');
        file_put_contents($path, $ts);

        $this->info("Actions & Entities exported to: $path");
    }
}
