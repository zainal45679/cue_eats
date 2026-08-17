import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\GoodsReceiptNoteController::index
 * @see app/Http/Controllers/Dashboard/GoodsReceiptNoteController.php:16
 * @route '/purchasing/grns'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/purchasing/grns',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\GoodsReceiptNoteController::index
 * @see app/Http/Controllers/Dashboard/GoodsReceiptNoteController.php:16
 * @route '/purchasing/grns'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\GoodsReceiptNoteController::index
 * @see app/Http/Controllers/Dashboard/GoodsReceiptNoteController.php:16
 * @route '/purchasing/grns'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\GoodsReceiptNoteController::index
 * @see app/Http/Controllers/Dashboard/GoodsReceiptNoteController.php:16
 * @route '/purchasing/grns'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\GoodsReceiptNoteController::create
 * @see app/Http/Controllers/Dashboard/GoodsReceiptNoteController.php:43
 * @route '/purchasing/grns/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/purchasing/grns/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\GoodsReceiptNoteController::create
 * @see app/Http/Controllers/Dashboard/GoodsReceiptNoteController.php:43
 * @route '/purchasing/grns/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\GoodsReceiptNoteController::create
 * @see app/Http/Controllers/Dashboard/GoodsReceiptNoteController.php:43
 * @route '/purchasing/grns/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\GoodsReceiptNoteController::create
 * @see app/Http/Controllers/Dashboard/GoodsReceiptNoteController.php:43
 * @route '/purchasing/grns/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\GoodsReceiptNoteController::store
 * @see app/Http/Controllers/Dashboard/GoodsReceiptNoteController.php:77
 * @route '/purchasing/grns'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/purchasing/grns',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\GoodsReceiptNoteController::store
 * @see app/Http/Controllers/Dashboard/GoodsReceiptNoteController.php:77
 * @route '/purchasing/grns'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\GoodsReceiptNoteController::store
 * @see app/Http/Controllers/Dashboard/GoodsReceiptNoteController.php:77
 * @route '/purchasing/grns'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\GoodsReceiptNoteController::show
 * @see app/Http/Controllers/Dashboard/GoodsReceiptNoteController.php:339
 * @route '/purchasing/grns/{goods_receipt_note}'
 */
export const show = (args: { goods_receipt_note: string | { uuid: string } } | [goods_receipt_note: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/purchasing/grns/{goods_receipt_note}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\GoodsReceiptNoteController::show
 * @see app/Http/Controllers/Dashboard/GoodsReceiptNoteController.php:339
 * @route '/purchasing/grns/{goods_receipt_note}'
 */
show.url = (args: { goods_receipt_note: string | { uuid: string } } | [goods_receipt_note: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { goods_receipt_note: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'uuid' in args) {
            args = { goods_receipt_note: args.uuid }
        }
    
    if (Array.isArray(args)) {
        args = {
                    goods_receipt_note: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        goods_receipt_note: typeof args.goods_receipt_note === 'object'
                ? args.goods_receipt_note.uuid
                : args.goods_receipt_note,
                }

    return show.definition.url
            .replace('{goods_receipt_note}', parsedArgs.goods_receipt_note.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\GoodsReceiptNoteController::show
 * @see app/Http/Controllers/Dashboard/GoodsReceiptNoteController.php:339
 * @route '/purchasing/grns/{goods_receipt_note}'
 */
show.get = (args: { goods_receipt_note: string | { uuid: string } } | [goods_receipt_note: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\GoodsReceiptNoteController::show
 * @see app/Http/Controllers/Dashboard/GoodsReceiptNoteController.php:339
 * @route '/purchasing/grns/{goods_receipt_note}'
 */
show.head = (args: { goods_receipt_note: string | { uuid: string } } | [goods_receipt_note: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})
const GoodsReceiptNoteController = { index, create, store, show }

export default GoodsReceiptNoteController