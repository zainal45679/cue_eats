import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\InventoryLedgerController::index
* @see app/Http/Controllers/Dashboard/InventoryLedgerController.php:12
* @route '/inventory/ledger'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/inventory/ledger',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\InventoryLedgerController::index
* @see app/Http/Controllers/Dashboard/InventoryLedgerController.php:12
* @route '/inventory/ledger'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\InventoryLedgerController::index
* @see app/Http/Controllers/Dashboard/InventoryLedgerController.php:12
* @route '/inventory/ledger'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\InventoryLedgerController::index
* @see app/Http/Controllers/Dashboard/InventoryLedgerController.php:12
* @route '/inventory/ledger'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

const InventoryLedgerController = { index }

export default InventoryLedgerController