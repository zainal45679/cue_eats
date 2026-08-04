import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\IngredientController::search
* @see app/Http/Controllers/Dashboard/IngredientController.php:123
* @route '/supply-chain/ingredients/search'
*/
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/supply-chain/ingredients/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::search
* @see app/Http/Controllers/Dashboard/IngredientController.php:123
* @route '/supply-chain/ingredients/search'
*/
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::search
* @see app/Http/Controllers/Dashboard/IngredientController.php:123
* @route '/supply-chain/ingredients/search'
*/
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::search
* @see app/Http/Controllers/Dashboard/IngredientController.php:123
* @route '/supply-chain/ingredients/search'
*/
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::index
* @see app/Http/Controllers/Dashboard/IngredientController.php:20
* @route '/supply-chain/ingredients'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/supply-chain/ingredients',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::index
* @see app/Http/Controllers/Dashboard/IngredientController.php:20
* @route '/supply-chain/ingredients'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::index
* @see app/Http/Controllers/Dashboard/IngredientController.php:20
* @route '/supply-chain/ingredients'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::index
* @see app/Http/Controllers/Dashboard/IngredientController.php:20
* @route '/supply-chain/ingredients'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::create
* @see app/Http/Controllers/Dashboard/IngredientController.php:33
* @route '/supply-chain/ingredients/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/supply-chain/ingredients/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::create
* @see app/Http/Controllers/Dashboard/IngredientController.php:33
* @route '/supply-chain/ingredients/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::create
* @see app/Http/Controllers/Dashboard/IngredientController.php:33
* @route '/supply-chain/ingredients/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::create
* @see app/Http/Controllers/Dashboard/IngredientController.php:33
* @route '/supply-chain/ingredients/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::store
* @see app/Http/Controllers/Dashboard/IngredientController.php:44
* @route '/supply-chain/ingredients'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/supply-chain/ingredients',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::store
* @see app/Http/Controllers/Dashboard/IngredientController.php:44
* @route '/supply-chain/ingredients'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::store
* @see app/Http/Controllers/Dashboard/IngredientController.php:44
* @route '/supply-chain/ingredients'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::show
* @see app/Http/Controllers/Dashboard/IngredientController.php:0
* @route '/supply-chain/ingredients/{ingredient}'
*/
export const show = (args: { ingredient: string | number } | [ingredient: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/supply-chain/ingredients/{ingredient}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::show
* @see app/Http/Controllers/Dashboard/IngredientController.php:0
* @route '/supply-chain/ingredients/{ingredient}'
*/
show.url = (args: { ingredient: string | number } | [ingredient: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { ingredient: args }
    }

    if (Array.isArray(args)) {
        args = {
            ingredient: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        ingredient: args.ingredient,
    }

    return show.definition.url
            .replace('{ingredient}', parsedArgs.ingredient.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::show
* @see app/Http/Controllers/Dashboard/IngredientController.php:0
* @route '/supply-chain/ingredients/{ingredient}'
*/
show.get = (args: { ingredient: string | number } | [ingredient: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::show
* @see app/Http/Controllers/Dashboard/IngredientController.php:0
* @route '/supply-chain/ingredients/{ingredient}'
*/
show.head = (args: { ingredient: string | number } | [ingredient: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::edit
* @see app/Http/Controllers/Dashboard/IngredientController.php:66
* @route '/supply-chain/ingredients/{ingredient}/edit'
*/
export const edit = (args: { ingredient: string | number } | [ingredient: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/supply-chain/ingredients/{ingredient}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::edit
* @see app/Http/Controllers/Dashboard/IngredientController.php:66
* @route '/supply-chain/ingredients/{ingredient}/edit'
*/
edit.url = (args: { ingredient: string | number } | [ingredient: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { ingredient: args }
    }

    if (Array.isArray(args)) {
        args = {
            ingredient: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        ingredient: args.ingredient,
    }

    return edit.definition.url
            .replace('{ingredient}', parsedArgs.ingredient.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::edit
* @see app/Http/Controllers/Dashboard/IngredientController.php:66
* @route '/supply-chain/ingredients/{ingredient}/edit'
*/
edit.get = (args: { ingredient: string | number } | [ingredient: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::edit
* @see app/Http/Controllers/Dashboard/IngredientController.php:66
* @route '/supply-chain/ingredients/{ingredient}/edit'
*/
edit.head = (args: { ingredient: string | number } | [ingredient: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::update
* @see app/Http/Controllers/Dashboard/IngredientController.php:80
* @route '/supply-chain/ingredients/{ingredient}'
*/
export const update = (args: { ingredient: string | number } | [ingredient: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/supply-chain/ingredients/{ingredient}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::update
* @see app/Http/Controllers/Dashboard/IngredientController.php:80
* @route '/supply-chain/ingredients/{ingredient}'
*/
update.url = (args: { ingredient: string | number } | [ingredient: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { ingredient: args }
    }

    if (Array.isArray(args)) {
        args = {
            ingredient: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        ingredient: args.ingredient,
    }

    return update.definition.url
            .replace('{ingredient}', parsedArgs.ingredient.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::update
* @see app/Http/Controllers/Dashboard/IngredientController.php:80
* @route '/supply-chain/ingredients/{ingredient}'
*/
update.put = (args: { ingredient: string | number } | [ingredient: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::update
* @see app/Http/Controllers/Dashboard/IngredientController.php:80
* @route '/supply-chain/ingredients/{ingredient}'
*/
update.patch = (args: { ingredient: string | number } | [ingredient: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::destroy
* @see app/Http/Controllers/Dashboard/IngredientController.php:104
* @route '/supply-chain/ingredients/{ingredient}'
*/
export const destroy = (args: { ingredient: string | number } | [ingredient: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/supply-chain/ingredients/{ingredient}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::destroy
* @see app/Http/Controllers/Dashboard/IngredientController.php:104
* @route '/supply-chain/ingredients/{ingredient}'
*/
destroy.url = (args: { ingredient: string | number } | [ingredient: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { ingredient: args }
    }

    if (Array.isArray(args)) {
        args = {
            ingredient: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        ingredient: args.ingredient,
    }

    return destroy.definition.url
            .replace('{ingredient}', parsedArgs.ingredient.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\IngredientController::destroy
* @see app/Http/Controllers/Dashboard/IngredientController.php:104
* @route '/supply-chain/ingredients/{ingredient}'
*/
destroy.delete = (args: { ingredient: string | number } | [ingredient: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const ingredients = {
    search: Object.assign(search, search),
    index: Object.assign(index, index),
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default ingredients