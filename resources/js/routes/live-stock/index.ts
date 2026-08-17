import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\InventoryBalanceController::index
 * @see app/Http/Controllers/Dashboard/InventoryBalanceController.php:15
 * @route '/inventory/live-stock'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/inventory/live-stock',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\InventoryBalanceController::index
 * @see app/Http/Controllers/Dashboard/InventoryBalanceController.php:15
 * @route '/inventory/live-stock'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\InventoryBalanceController::index
 * @see app/Http/Controllers/Dashboard/InventoryBalanceController.php:15
 * @route '/inventory/live-stock'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\InventoryBalanceController::index
 * @see app/Http/Controllers/Dashboard/InventoryBalanceController.php:15
 * @route '/inventory/live-stock'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})
const liveStock = {
    index: Object.assign(index, index),
}

export default liveStock