import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\SupplierController::search
* @see app/Http/Controllers/Dashboard/SupplierController.php:101
* @route '/supply-chain/suppliers/search'
*/
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/supply-chain/suppliers/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::search
* @see app/Http/Controllers/Dashboard/SupplierController.php:101
* @route '/supply-chain/suppliers/search'
*/
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::search
* @see app/Http/Controllers/Dashboard/SupplierController.php:101
* @route '/supply-chain/suppliers/search'
*/
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::search
* @see app/Http/Controllers/Dashboard/SupplierController.php:101
* @route '/supply-chain/suppliers/search'
*/
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::index
* @see app/Http/Controllers/Dashboard/SupplierController.php:17
* @route '/supply-chain/suppliers'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/supply-chain/suppliers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::index
* @see app/Http/Controllers/Dashboard/SupplierController.php:17
* @route '/supply-chain/suppliers'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::index
* @see app/Http/Controllers/Dashboard/SupplierController.php:17
* @route '/supply-chain/suppliers'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::index
* @see app/Http/Controllers/Dashboard/SupplierController.php:17
* @route '/supply-chain/suppliers'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::create
* @see app/Http/Controllers/Dashboard/SupplierController.php:30
* @route '/supply-chain/suppliers/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/supply-chain/suppliers/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::create
* @see app/Http/Controllers/Dashboard/SupplierController.php:30
* @route '/supply-chain/suppliers/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::create
* @see app/Http/Controllers/Dashboard/SupplierController.php:30
* @route '/supply-chain/suppliers/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::create
* @see app/Http/Controllers/Dashboard/SupplierController.php:30
* @route '/supply-chain/suppliers/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::store
* @see app/Http/Controllers/Dashboard/SupplierController.php:37
* @route '/supply-chain/suppliers'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/supply-chain/suppliers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::store
* @see app/Http/Controllers/Dashboard/SupplierController.php:37
* @route '/supply-chain/suppliers'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::store
* @see app/Http/Controllers/Dashboard/SupplierController.php:37
* @route '/supply-chain/suppliers'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::show
* @see app/Http/Controllers/Dashboard/SupplierController.php:0
* @route '/supply-chain/suppliers/{supplier}'
*/
export const show = (args: { supplier: string | number } | [supplier: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/supply-chain/suppliers/{supplier}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::show
* @see app/Http/Controllers/Dashboard/SupplierController.php:0
* @route '/supply-chain/suppliers/{supplier}'
*/
show.url = (args: { supplier: string | number } | [supplier: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { supplier: args }
    }

    if (Array.isArray(args)) {
        args = {
            supplier: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        supplier: args.supplier,
    }

    return show.definition.url
            .replace('{supplier}', parsedArgs.supplier.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::show
* @see app/Http/Controllers/Dashboard/SupplierController.php:0
* @route '/supply-chain/suppliers/{supplier}'
*/
show.get = (args: { supplier: string | number } | [supplier: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::show
* @see app/Http/Controllers/Dashboard/SupplierController.php:0
* @route '/supply-chain/suppliers/{supplier}'
*/
show.head = (args: { supplier: string | number } | [supplier: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::edit
* @see app/Http/Controllers/Dashboard/SupplierController.php:57
* @route '/supply-chain/suppliers/{supplier}/edit'
*/
export const edit = (args: { supplier: string | number } | [supplier: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/supply-chain/suppliers/{supplier}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::edit
* @see app/Http/Controllers/Dashboard/SupplierController.php:57
* @route '/supply-chain/suppliers/{supplier}/edit'
*/
edit.url = (args: { supplier: string | number } | [supplier: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { supplier: args }
    }

    if (Array.isArray(args)) {
        args = {
            supplier: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        supplier: args.supplier,
    }

    return edit.definition.url
            .replace('{supplier}', parsedArgs.supplier.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::edit
* @see app/Http/Controllers/Dashboard/SupplierController.php:57
* @route '/supply-chain/suppliers/{supplier}/edit'
*/
edit.get = (args: { supplier: string | number } | [supplier: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::edit
* @see app/Http/Controllers/Dashboard/SupplierController.php:57
* @route '/supply-chain/suppliers/{supplier}/edit'
*/
edit.head = (args: { supplier: string | number } | [supplier: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::update
* @see app/Http/Controllers/Dashboard/SupplierController.php:68
* @route '/supply-chain/suppliers/{supplier}'
*/
export const update = (args: { supplier: string | number } | [supplier: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/supply-chain/suppliers/{supplier}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::update
* @see app/Http/Controllers/Dashboard/SupplierController.php:68
* @route '/supply-chain/suppliers/{supplier}'
*/
update.url = (args: { supplier: string | number } | [supplier: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { supplier: args }
    }

    if (Array.isArray(args)) {
        args = {
            supplier: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        supplier: args.supplier,
    }

    return update.definition.url
            .replace('{supplier}', parsedArgs.supplier.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::update
* @see app/Http/Controllers/Dashboard/SupplierController.php:68
* @route '/supply-chain/suppliers/{supplier}'
*/
update.put = (args: { supplier: string | number } | [supplier: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::update
* @see app/Http/Controllers/Dashboard/SupplierController.php:68
* @route '/supply-chain/suppliers/{supplier}'
*/
update.patch = (args: { supplier: string | number } | [supplier: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::destroy
* @see app/Http/Controllers/Dashboard/SupplierController.php:90
* @route '/supply-chain/suppliers/{supplier}'
*/
export const destroy = (args: { supplier: string | number } | [supplier: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/supply-chain/suppliers/{supplier}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::destroy
* @see app/Http/Controllers/Dashboard/SupplierController.php:90
* @route '/supply-chain/suppliers/{supplier}'
*/
destroy.url = (args: { supplier: string | number } | [supplier: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { supplier: args }
    }

    if (Array.isArray(args)) {
        args = {
            supplier: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        supplier: args.supplier,
    }

    return destroy.definition.url
            .replace('{supplier}', parsedArgs.supplier.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\SupplierController::destroy
* @see app/Http/Controllers/Dashboard/SupplierController.php:90
* @route '/supply-chain/suppliers/{supplier}'
*/
destroy.delete = (args: { supplier: string | number } | [supplier: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const SupplierController = { search, index, create, store, show, edit, update, destroy }

export default SupplierController