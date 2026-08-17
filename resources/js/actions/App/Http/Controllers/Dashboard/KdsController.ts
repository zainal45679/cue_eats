import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\KdsController::index
 * @see app/Http/Controllers/Dashboard/KdsController.php:12
 * @route '/menu-pos/kds'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/menu-pos/kds',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\KdsController::index
 * @see app/Http/Controllers/Dashboard/KdsController.php:12
 * @route '/menu-pos/kds'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\KdsController::index
 * @see app/Http/Controllers/Dashboard/KdsController.php:12
 * @route '/menu-pos/kds'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\KdsController::index
 * @see app/Http/Controllers/Dashboard/KdsController.php:12
 * @route '/menu-pos/kds'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\KdsController::updateStatus
 * @see app/Http/Controllers/Dashboard/KdsController.php:29
 * @route '/menu-pos/kds/{order}/status'
 */
export const updateStatus = (args: { order: string | { id: string } } | [order: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateStatus.url(args, options),
    method: 'post',
})

updateStatus.definition = {
    methods: ["post"],
    url: '/menu-pos/kds/{order}/status',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\KdsController::updateStatus
 * @see app/Http/Controllers/Dashboard/KdsController.php:29
 * @route '/menu-pos/kds/{order}/status'
 */
updateStatus.url = (args: { order: string | { id: string } } | [order: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { order: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { order: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    order: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        order: typeof args.order === 'object'
                ? args.order.id
                : args.order,
                }

    return updateStatus.definition.url
            .replace('{order}', parsedArgs.order.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\KdsController::updateStatus
 * @see app/Http/Controllers/Dashboard/KdsController.php:29
 * @route '/menu-pos/kds/{order}/status'
 */
updateStatus.post = (args: { order: string | { id: string } } | [order: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: updateStatus.url(args, options),
    method: 'post',
})
const KdsController = { index, updateStatus }

export default KdsController