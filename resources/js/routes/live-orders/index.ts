import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\LiveOrdersController::index
 * @see app/Http/Controllers/Dashboard/LiveOrdersController.php:13
 * @route '/menu-pos/live-orders'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/menu-pos/live-orders',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\LiveOrdersController::index
 * @see app/Http/Controllers/Dashboard/LiveOrdersController.php:13
 * @route '/menu-pos/live-orders'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\LiveOrdersController::index
 * @see app/Http/Controllers/Dashboard/LiveOrdersController.php:13
 * @route '/menu-pos/live-orders'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\LiveOrdersController::index
 * @see app/Http/Controllers/Dashboard/LiveOrdersController.php:13
 * @route '/menu-pos/live-orders'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})
const liveOrders = {
    index: Object.assign(index, index),
}

export default liveOrders