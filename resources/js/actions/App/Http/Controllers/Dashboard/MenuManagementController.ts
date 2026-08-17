import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\MenuManagementController::index
 * @see app/Http/Controllers/Dashboard/MenuManagementController.php:14
 * @route '/menu-pos'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/menu-pos',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\MenuManagementController::index
 * @see app/Http/Controllers/Dashboard/MenuManagementController.php:14
 * @route '/menu-pos'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\MenuManagementController::index
 * @see app/Http/Controllers/Dashboard/MenuManagementController.php:14
 * @route '/menu-pos'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\MenuManagementController::index
 * @see app/Http/Controllers/Dashboard/MenuManagementController.php:14
 * @route '/menu-pos'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})
const MenuManagementController = { index }

export default MenuManagementController