import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\BrandController::search
* @see app/Http/Controllers/Dashboard/BrandController.php:17
* @route '/supply-chain/brands/search'
*/
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/supply-chain/brands/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\BrandController::search
* @see app/Http/Controllers/Dashboard/BrandController.php:17
* @route '/supply-chain/brands/search'
*/
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\BrandController::search
* @see app/Http/Controllers/Dashboard/BrandController.php:17
* @route '/supply-chain/brands/search'
*/
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\BrandController::search
* @see app/Http/Controllers/Dashboard/BrandController.php:17
* @route '/supply-chain/brands/search'
*/
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\BrandController::index
* @see app/Http/Controllers/Dashboard/BrandController.php:26
* @route '/supply-chain/brands'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/supply-chain/brands',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\BrandController::index
* @see app/Http/Controllers/Dashboard/BrandController.php:26
* @route '/supply-chain/brands'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\BrandController::index
* @see app/Http/Controllers/Dashboard/BrandController.php:26
* @route '/supply-chain/brands'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\BrandController::index
* @see app/Http/Controllers/Dashboard/BrandController.php:26
* @route '/supply-chain/brands'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\BrandController::create
* @see app/Http/Controllers/Dashboard/BrandController.php:39
* @route '/supply-chain/brands/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/supply-chain/brands/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\BrandController::create
* @see app/Http/Controllers/Dashboard/BrandController.php:39
* @route '/supply-chain/brands/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\BrandController::create
* @see app/Http/Controllers/Dashboard/BrandController.php:39
* @route '/supply-chain/brands/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\BrandController::create
* @see app/Http/Controllers/Dashboard/BrandController.php:39
* @route '/supply-chain/brands/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\BrandController::store
* @see app/Http/Controllers/Dashboard/BrandController.php:46
* @route '/supply-chain/brands'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/supply-chain/brands',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\BrandController::store
* @see app/Http/Controllers/Dashboard/BrandController.php:46
* @route '/supply-chain/brands'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\BrandController::store
* @see app/Http/Controllers/Dashboard/BrandController.php:46
* @route '/supply-chain/brands'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\BrandController::show
* @see app/Http/Controllers/Dashboard/BrandController.php:0
* @route '/supply-chain/brands/{brand}'
*/
export const show = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/supply-chain/brands/{brand}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\BrandController::show
* @see app/Http/Controllers/Dashboard/BrandController.php:0
* @route '/supply-chain/brands/{brand}'
*/
show.url = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { brand: args }
    }

    if (Array.isArray(args)) {
        args = {
            brand: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        brand: args.brand,
    }

    return show.definition.url
            .replace('{brand}', parsedArgs.brand.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\BrandController::show
* @see app/Http/Controllers/Dashboard/BrandController.php:0
* @route '/supply-chain/brands/{brand}'
*/
show.get = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\BrandController::show
* @see app/Http/Controllers/Dashboard/BrandController.php:0
* @route '/supply-chain/brands/{brand}'
*/
show.head = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\BrandController::edit
* @see app/Http/Controllers/Dashboard/BrandController.php:62
* @route '/supply-chain/brands/{brand}/edit'
*/
export const edit = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/supply-chain/brands/{brand}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\BrandController::edit
* @see app/Http/Controllers/Dashboard/BrandController.php:62
* @route '/supply-chain/brands/{brand}/edit'
*/
edit.url = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { brand: args }
    }

    if (Array.isArray(args)) {
        args = {
            brand: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        brand: args.brand,
    }

    return edit.definition.url
            .replace('{brand}', parsedArgs.brand.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\BrandController::edit
* @see app/Http/Controllers/Dashboard/BrandController.php:62
* @route '/supply-chain/brands/{brand}/edit'
*/
edit.get = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\BrandController::edit
* @see app/Http/Controllers/Dashboard/BrandController.php:62
* @route '/supply-chain/brands/{brand}/edit'
*/
edit.head = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\BrandController::update
* @see app/Http/Controllers/Dashboard/BrandController.php:73
* @route '/supply-chain/brands/{brand}'
*/
export const update = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/supply-chain/brands/{brand}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Dashboard\BrandController::update
* @see app/Http/Controllers/Dashboard/BrandController.php:73
* @route '/supply-chain/brands/{brand}'
*/
update.url = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { brand: args }
    }

    if (Array.isArray(args)) {
        args = {
            brand: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        brand: args.brand,
    }

    return update.definition.url
            .replace('{brand}', parsedArgs.brand.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\BrandController::update
* @see app/Http/Controllers/Dashboard/BrandController.php:73
* @route '/supply-chain/brands/{brand}'
*/
update.put = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Dashboard\BrandController::update
* @see app/Http/Controllers/Dashboard/BrandController.php:73
* @route '/supply-chain/brands/{brand}'
*/
update.patch = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Dashboard\BrandController::destroy
* @see app/Http/Controllers/Dashboard/BrandController.php:91
* @route '/supply-chain/brands/{brand}'
*/
export const destroy = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/supply-chain/brands/{brand}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Dashboard\BrandController::destroy
* @see app/Http/Controllers/Dashboard/BrandController.php:91
* @route '/supply-chain/brands/{brand}'
*/
destroy.url = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { brand: args }
    }

    if (Array.isArray(args)) {
        args = {
            brand: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        brand: args.brand,
    }

    return destroy.definition.url
            .replace('{brand}', parsedArgs.brand.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\BrandController::destroy
* @see app/Http/Controllers/Dashboard/BrandController.php:91
* @route '/supply-chain/brands/{brand}'
*/
destroy.delete = (args: { brand: string | number } | [brand: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const brands = {
    search: Object.assign(search, search),
    index: Object.assign(index, index),
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default brands