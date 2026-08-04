import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::search
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:18
* @route '/supply-chain/ingredient-categories/search'
*/
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/supply-chain/ingredient-categories/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::search
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:18
* @route '/supply-chain/ingredient-categories/search'
*/
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::search
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:18
* @route '/supply-chain/ingredient-categories/search'
*/
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::search
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:18
* @route '/supply-chain/ingredient-categories/search'
*/
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::index
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:27
* @route '/supply-chain/ingredient-categories'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/supply-chain/ingredient-categories',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::index
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:27
* @route '/supply-chain/ingredient-categories'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::index
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:27
* @route '/supply-chain/ingredient-categories'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::index
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:27
* @route '/supply-chain/ingredient-categories'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::create
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:40
* @route '/supply-chain/ingredient-categories/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/supply-chain/ingredient-categories/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::create
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:40
* @route '/supply-chain/ingredient-categories/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::create
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:40
* @route '/supply-chain/ingredient-categories/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::create
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:40
* @route '/supply-chain/ingredient-categories/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::store
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:51
* @route '/supply-chain/ingredient-categories'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/supply-chain/ingredient-categories',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::store
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:51
* @route '/supply-chain/ingredient-categories'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::store
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:51
* @route '/supply-chain/ingredient-categories'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::show
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:0
* @route '/supply-chain/ingredient-categories/{ingredient_category}'
*/
export const show = (args: { ingredient_category: string | number } | [ingredient_category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/supply-chain/ingredient-categories/{ingredient_category}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::show
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:0
* @route '/supply-chain/ingredient-categories/{ingredient_category}'
*/
show.url = (args: { ingredient_category: string | number } | [ingredient_category: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { ingredient_category: args }
    }

    if (Array.isArray(args)) {
        args = {
            ingredient_category: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        ingredient_category: args.ingredient_category,
    }

    return show.definition.url
            .replace('{ingredient_category}', parsedArgs.ingredient_category.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::show
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:0
* @route '/supply-chain/ingredient-categories/{ingredient_category}'
*/
show.get = (args: { ingredient_category: string | number } | [ingredient_category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::show
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:0
* @route '/supply-chain/ingredient-categories/{ingredient_category}'
*/
show.head = (args: { ingredient_category: string | number } | [ingredient_category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::edit
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:67
* @route '/supply-chain/ingredient-categories/{ingredient_category}/edit'
*/
export const edit = (args: { ingredient_category: string | number } | [ingredient_category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/supply-chain/ingredient-categories/{ingredient_category}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::edit
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:67
* @route '/supply-chain/ingredient-categories/{ingredient_category}/edit'
*/
edit.url = (args: { ingredient_category: string | number } | [ingredient_category: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { ingredient_category: args }
    }

    if (Array.isArray(args)) {
        args = {
            ingredient_category: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        ingredient_category: args.ingredient_category,
    }

    return edit.definition.url
            .replace('{ingredient_category}', parsedArgs.ingredient_category.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::edit
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:67
* @route '/supply-chain/ingredient-categories/{ingredient_category}/edit'
*/
edit.get = (args: { ingredient_category: string | number } | [ingredient_category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::edit
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:67
* @route '/supply-chain/ingredient-categories/{ingredient_category}/edit'
*/
edit.head = (args: { ingredient_category: string | number } | [ingredient_category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::update
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:82
* @route '/supply-chain/ingredient-categories/{ingredient_category}'
*/
export const update = (args: { ingredient_category: string | number } | [ingredient_category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/supply-chain/ingredient-categories/{ingredient_category}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::update
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:82
* @route '/supply-chain/ingredient-categories/{ingredient_category}'
*/
update.url = (args: { ingredient_category: string | number } | [ingredient_category: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { ingredient_category: args }
    }

    if (Array.isArray(args)) {
        args = {
            ingredient_category: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        ingredient_category: args.ingredient_category,
    }

    return update.definition.url
            .replace('{ingredient_category}', parsedArgs.ingredient_category.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::update
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:82
* @route '/supply-chain/ingredient-categories/{ingredient_category}'
*/
update.put = (args: { ingredient_category: string | number } | [ingredient_category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::update
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:82
* @route '/supply-chain/ingredient-categories/{ingredient_category}'
*/
update.patch = (args: { ingredient_category: string | number } | [ingredient_category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::destroy
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:104
* @route '/supply-chain/ingredient-categories/{ingredient_category}'
*/
export const destroy = (args: { ingredient_category: string | number } | [ingredient_category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/supply-chain/ingredient-categories/{ingredient_category}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::destroy
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:104
* @route '/supply-chain/ingredient-categories/{ingredient_category}'
*/
destroy.url = (args: { ingredient_category: string | number } | [ingredient_category: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { ingredient_category: args }
    }

    if (Array.isArray(args)) {
        args = {
            ingredient_category: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        ingredient_category: args.ingredient_category,
    }

    return destroy.definition.url
            .replace('{ingredient_category}', parsedArgs.ingredient_category.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\IngredientCategoryController::destroy
* @see app/Http/Controllers/Dashboard/IngredientCategoryController.php:104
* @route '/supply-chain/ingredient-categories/{ingredient_category}'
*/
destroy.delete = (args: { ingredient_category: string | number } | [ingredient_category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const IngredientCategoryController = { search, index, create, store, show, edit, update, destroy }

export default IngredientCategoryController