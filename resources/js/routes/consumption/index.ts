import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\InventoryConsumptionController::index
 * @see app/Http/Controllers/Dashboard/InventoryConsumptionController.php:13
 * @route '/inventory/consumption'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/inventory/consumption',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\InventoryConsumptionController::index
 * @see app/Http/Controllers/Dashboard/InventoryConsumptionController.php:13
 * @route '/inventory/consumption'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\InventoryConsumptionController::index
 * @see app/Http/Controllers/Dashboard/InventoryConsumptionController.php:13
 * @route '/inventory/consumption'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\InventoryConsumptionController::index
 * @see app/Http/Controllers/Dashboard/InventoryConsumptionController.php:13
 * @route '/inventory/consumption'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})
const consumption = {
    index: Object.assign(index, index),
}

export default consumption