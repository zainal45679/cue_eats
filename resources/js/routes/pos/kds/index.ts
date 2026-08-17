import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../wayfinder'
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
const kds = {
    updateStatus: Object.assign(updateStatus, updateStatus),
}

export default kds