import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\StockTransferOrderController::dispatchSto
* @see app/Http/Controllers/Dashboard/StockTransferOrderController.php:80
* @route '/purchasing/stos/{stock_transfer_order}/dispatch'
*/
export const dispatchSto = (args: { stock_transfer_order: string | { uuid: string } } | [stock_transfer_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: dispatchSto.url(args, options),
    method: 'post',
})

dispatchSto.definition = {
    methods: ["post"],
    url: '/purchasing/stos/{stock_transfer_order}/dispatch',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\StockTransferOrderController::dispatchSto
* @see app/Http/Controllers/Dashboard/StockTransferOrderController.php:80
* @route '/purchasing/stos/{stock_transfer_order}/dispatch'
*/
dispatchSto.url = (args: { stock_transfer_order: string | { uuid: string } } | [stock_transfer_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { stock_transfer_order: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'uuid' in args) {
        args = { stock_transfer_order: args.uuid }
    }

    if (Array.isArray(args)) {
        args = {
            stock_transfer_order: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        stock_transfer_order: typeof args.stock_transfer_order === 'object'
        ? args.stock_transfer_order.uuid
        : args.stock_transfer_order,
    }

    return dispatchSto.definition.url
            .replace('{stock_transfer_order}', parsedArgs.stock_transfer_order.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\StockTransferOrderController::dispatchSto
* @see app/Http/Controllers/Dashboard/StockTransferOrderController.php:80
* @route '/purchasing/stos/{stock_transfer_order}/dispatch'
*/
dispatchSto.post = (args: { stock_transfer_order: string | { uuid: string } } | [stock_transfer_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: dispatchSto.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\StockTransferOrderController::rejectSto
* @see app/Http/Controllers/Dashboard/StockTransferOrderController.php:180
* @route '/purchasing/stos/{stock_transfer_order}/reject'
*/
export const rejectSto = (args: { stock_transfer_order: string | { uuid: string } } | [stock_transfer_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rejectSto.url(args, options),
    method: 'post',
})

rejectSto.definition = {
    methods: ["post"],
    url: '/purchasing/stos/{stock_transfer_order}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\StockTransferOrderController::rejectSto
* @see app/Http/Controllers/Dashboard/StockTransferOrderController.php:180
* @route '/purchasing/stos/{stock_transfer_order}/reject'
*/
rejectSto.url = (args: { stock_transfer_order: string | { uuid: string } } | [stock_transfer_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { stock_transfer_order: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'uuid' in args) {
        args = { stock_transfer_order: args.uuid }
    }

    if (Array.isArray(args)) {
        args = {
            stock_transfer_order: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        stock_transfer_order: typeof args.stock_transfer_order === 'object'
        ? args.stock_transfer_order.uuid
        : args.stock_transfer_order,
    }

    return rejectSto.definition.url
            .replace('{stock_transfer_order}', parsedArgs.stock_transfer_order.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\StockTransferOrderController::rejectSto
* @see app/Http/Controllers/Dashboard/StockTransferOrderController.php:180
* @route '/purchasing/stos/{stock_transfer_order}/reject'
*/
rejectSto.post = (args: { stock_transfer_order: string | { uuid: string } } | [stock_transfer_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: rejectSto.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\StockTransferOrderController::index
* @see app/Http/Controllers/Dashboard/StockTransferOrderController.php:15
* @route '/purchasing/stos'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/purchasing/stos',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\StockTransferOrderController::index
* @see app/Http/Controllers/Dashboard/StockTransferOrderController.php:15
* @route '/purchasing/stos'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\StockTransferOrderController::index
* @see app/Http/Controllers/Dashboard/StockTransferOrderController.php:15
* @route '/purchasing/stos'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\StockTransferOrderController::index
* @see app/Http/Controllers/Dashboard/StockTransferOrderController.php:15
* @route '/purchasing/stos'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\StockTransferOrderController::show
* @see app/Http/Controllers/Dashboard/StockTransferOrderController.php:59
* @route '/purchasing/stos/{stock_transfer_order}'
*/
export const show = (args: { stock_transfer_order: string | { uuid: string } } | [stock_transfer_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/purchasing/stos/{stock_transfer_order}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\StockTransferOrderController::show
* @see app/Http/Controllers/Dashboard/StockTransferOrderController.php:59
* @route '/purchasing/stos/{stock_transfer_order}'
*/
show.url = (args: { stock_transfer_order: string | { uuid: string } } | [stock_transfer_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { stock_transfer_order: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'uuid' in args) {
        args = { stock_transfer_order: args.uuid }
    }

    if (Array.isArray(args)) {
        args = {
            stock_transfer_order: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        stock_transfer_order: typeof args.stock_transfer_order === 'object'
        ? args.stock_transfer_order.uuid
        : args.stock_transfer_order,
    }

    return show.definition.url
            .replace('{stock_transfer_order}', parsedArgs.stock_transfer_order.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\StockTransferOrderController::show
* @see app/Http/Controllers/Dashboard/StockTransferOrderController.php:59
* @route '/purchasing/stos/{stock_transfer_order}'
*/
show.get = (args: { stock_transfer_order: string | { uuid: string } } | [stock_transfer_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\StockTransferOrderController::show
* @see app/Http/Controllers/Dashboard/StockTransferOrderController.php:59
* @route '/purchasing/stos/{stock_transfer_order}'
*/
show.head = (args: { stock_transfer_order: string | { uuid: string } } | [stock_transfer_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

const StockTransferOrderController = { dispatchSto, rejectSto, index, show }

export default StockTransferOrderController