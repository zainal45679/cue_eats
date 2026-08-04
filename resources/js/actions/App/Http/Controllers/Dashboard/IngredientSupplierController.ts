import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::search
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:0
* @route '/supply-chain/ingredient-suppliers/search'
*/
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/supply-chain/ingredient-suppliers/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::search
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:0
* @route '/supply-chain/ingredient-suppliers/search'
*/
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::search
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:0
* @route '/supply-chain/ingredient-suppliers/search'
*/
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::search
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:0
* @route '/supply-chain/ingredient-suppliers/search'
*/
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::index
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:20
* @route '/supply-chain/ingredient-suppliers'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/supply-chain/ingredient-suppliers',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::index
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:20
* @route '/supply-chain/ingredient-suppliers'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::index
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:20
* @route '/supply-chain/ingredient-suppliers'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::index
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:20
* @route '/supply-chain/ingredient-suppliers'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::create
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:36
* @route '/supply-chain/ingredient-suppliers/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/supply-chain/ingredient-suppliers/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::create
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:36
* @route '/supply-chain/ingredient-suppliers/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::create
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:36
* @route '/supply-chain/ingredient-suppliers/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::create
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:36
* @route '/supply-chain/ingredient-suppliers/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::store
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:43
* @route '/supply-chain/ingredient-suppliers'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/supply-chain/ingredient-suppliers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::store
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:43
* @route '/supply-chain/ingredient-suppliers'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::store
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:43
* @route '/supply-chain/ingredient-suppliers'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::show
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:0
* @route '/supply-chain/ingredient-suppliers/{mapping}'
*/
export const show = (args: { mapping: string | number } | [mapping: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/supply-chain/ingredient-suppliers/{mapping}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::show
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:0
* @route '/supply-chain/ingredient-suppliers/{mapping}'
*/
show.url = (args: { mapping: string | number } | [mapping: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { mapping: args }
    }

    if (Array.isArray(args)) {
        args = {
            mapping: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        mapping: args.mapping,
    }

    return show.definition.url
            .replace('{mapping}', parsedArgs.mapping.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::show
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:0
* @route '/supply-chain/ingredient-suppliers/{mapping}'
*/
show.get = (args: { mapping: string | number } | [mapping: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::show
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:0
* @route '/supply-chain/ingredient-suppliers/{mapping}'
*/
show.head = (args: { mapping: string | number } | [mapping: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::edit
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:73
* @route '/supply-chain/ingredient-suppliers/{mapping}/edit'
*/
export const edit = (args: { mapping: string | number } | [mapping: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/supply-chain/ingredient-suppliers/{mapping}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::edit
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:73
* @route '/supply-chain/ingredient-suppliers/{mapping}/edit'
*/
edit.url = (args: { mapping: string | number } | [mapping: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { mapping: args }
    }

    if (Array.isArray(args)) {
        args = {
            mapping: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        mapping: args.mapping,
    }

    return edit.definition.url
            .replace('{mapping}', parsedArgs.mapping.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::edit
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:73
* @route '/supply-chain/ingredient-suppliers/{mapping}/edit'
*/
edit.get = (args: { mapping: string | number } | [mapping: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::edit
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:73
* @route '/supply-chain/ingredient-suppliers/{mapping}/edit'
*/
edit.head = (args: { mapping: string | number } | [mapping: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::update
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:85
* @route '/supply-chain/ingredient-suppliers/{mapping}'
*/
export const update = (args: { mapping: string | number } | [mapping: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/supply-chain/ingredient-suppliers/{mapping}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::update
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:85
* @route '/supply-chain/ingredient-suppliers/{mapping}'
*/
update.url = (args: { mapping: string | number } | [mapping: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { mapping: args }
    }

    if (Array.isArray(args)) {
        args = {
            mapping: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        mapping: args.mapping,
    }

    return update.definition.url
            .replace('{mapping}', parsedArgs.mapping.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::update
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:85
* @route '/supply-chain/ingredient-suppliers/{mapping}'
*/
update.put = (args: { mapping: string | number } | [mapping: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::update
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:85
* @route '/supply-chain/ingredient-suppliers/{mapping}'
*/
update.patch = (args: { mapping: string | number } | [mapping: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::destroy
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:117
* @route '/supply-chain/ingredient-suppliers/{mapping}'
*/
export const destroy = (args: { mapping: string | number } | [mapping: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/supply-chain/ingredient-suppliers/{mapping}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::destroy
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:117
* @route '/supply-chain/ingredient-suppliers/{mapping}'
*/
destroy.url = (args: { mapping: string | number } | [mapping: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { mapping: args }
    }

    if (Array.isArray(args)) {
        args = {
            mapping: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        mapping: args.mapping,
    }

    return destroy.definition.url
            .replace('{mapping}', parsedArgs.mapping.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\IngredientSupplierController::destroy
* @see app/Http/Controllers/Dashboard/IngredientSupplierController.php:117
* @route '/supply-chain/ingredient-suppliers/{mapping}'
*/
destroy.delete = (args: { mapping: string | number } | [mapping: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const IngredientSupplierController = { search, index, create, store, show, edit, update, destroy }

export default IngredientSupplierController