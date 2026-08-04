import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\MenuCategoryController::create
* @see app/Http/Controllers/Dashboard/MenuCategoryController.php:0
* @route '/menu-pos/categories/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/menu-pos/categories/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\MenuCategoryController::create
* @see app/Http/Controllers/Dashboard/MenuCategoryController.php:0
* @route '/menu-pos/categories/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\MenuCategoryController::create
* @see app/Http/Controllers/Dashboard/MenuCategoryController.php:0
* @route '/menu-pos/categories/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\MenuCategoryController::create
* @see app/Http/Controllers/Dashboard/MenuCategoryController.php:0
* @route '/menu-pos/categories/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\MenuCategoryController::store
* @see app/Http/Controllers/Dashboard/MenuCategoryController.php:20
* @route '/menu-pos/categories'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/menu-pos/categories',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\MenuCategoryController::store
* @see app/Http/Controllers/Dashboard/MenuCategoryController.php:20
* @route '/menu-pos/categories'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\MenuCategoryController::store
* @see app/Http/Controllers/Dashboard/MenuCategoryController.php:20
* @route '/menu-pos/categories'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\MenuCategoryController::show
* @see app/Http/Controllers/Dashboard/MenuCategoryController.php:0
* @route '/menu-pos/categories/{category}'
*/
export const show = (args: { category: string | number } | [category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/menu-pos/categories/{category}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\MenuCategoryController::show
* @see app/Http/Controllers/Dashboard/MenuCategoryController.php:0
* @route '/menu-pos/categories/{category}'
*/
show.url = (args: { category: string | number } | [category: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { category: args }
    }

    if (Array.isArray(args)) {
        args = {
            category: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        category: args.category,
    }

    return show.definition.url
            .replace('{category}', parsedArgs.category.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\MenuCategoryController::show
* @see app/Http/Controllers/Dashboard/MenuCategoryController.php:0
* @route '/menu-pos/categories/{category}'
*/
show.get = (args: { category: string | number } | [category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\MenuCategoryController::show
* @see app/Http/Controllers/Dashboard/MenuCategoryController.php:0
* @route '/menu-pos/categories/{category}'
*/
show.head = (args: { category: string | number } | [category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\MenuCategoryController::edit
* @see app/Http/Controllers/Dashboard/MenuCategoryController.php:0
* @route '/menu-pos/categories/{category}/edit'
*/
export const edit = (args: { category: string | number } | [category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/menu-pos/categories/{category}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\MenuCategoryController::edit
* @see app/Http/Controllers/Dashboard/MenuCategoryController.php:0
* @route '/menu-pos/categories/{category}/edit'
*/
edit.url = (args: { category: string | number } | [category: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { category: args }
    }

    if (Array.isArray(args)) {
        args = {
            category: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        category: args.category,
    }

    return edit.definition.url
            .replace('{category}', parsedArgs.category.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\MenuCategoryController::edit
* @see app/Http/Controllers/Dashboard/MenuCategoryController.php:0
* @route '/menu-pos/categories/{category}/edit'
*/
edit.get = (args: { category: string | number } | [category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\MenuCategoryController::edit
* @see app/Http/Controllers/Dashboard/MenuCategoryController.php:0
* @route '/menu-pos/categories/{category}/edit'
*/
edit.head = (args: { category: string | number } | [category: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\MenuCategoryController::update
* @see app/Http/Controllers/Dashboard/MenuCategoryController.php:33
* @route '/menu-pos/categories/{category}'
*/
export const update = (args: { category: number | { id: number } } | [category: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/menu-pos/categories/{category}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Dashboard\MenuCategoryController::update
* @see app/Http/Controllers/Dashboard/MenuCategoryController.php:33
* @route '/menu-pos/categories/{category}'
*/
update.url = (args: { category: number | { id: number } } | [category: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { category: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { category: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            category: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        category: typeof args.category === 'object'
        ? args.category.id
        : args.category,
    }

    return update.definition.url
            .replace('{category}', parsedArgs.category.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\MenuCategoryController::update
* @see app/Http/Controllers/Dashboard/MenuCategoryController.php:33
* @route '/menu-pos/categories/{category}'
*/
update.put = (args: { category: number | { id: number } } | [category: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Dashboard\MenuCategoryController::update
* @see app/Http/Controllers/Dashboard/MenuCategoryController.php:33
* @route '/menu-pos/categories/{category}'
*/
update.patch = (args: { category: number | { id: number } } | [category: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Dashboard\MenuCategoryController::destroy
* @see app/Http/Controllers/Dashboard/MenuCategoryController.php:46
* @route '/menu-pos/categories/{category}'
*/
export const destroy = (args: { category: number | { id: number } } | [category: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/menu-pos/categories/{category}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Dashboard\MenuCategoryController::destroy
* @see app/Http/Controllers/Dashboard/MenuCategoryController.php:46
* @route '/menu-pos/categories/{category}'
*/
destroy.url = (args: { category: number | { id: number } } | [category: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { category: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { category: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            category: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        category: typeof args.category === 'object'
        ? args.category.id
        : args.category,
    }

    return destroy.definition.url
            .replace('{category}', parsedArgs.category.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\MenuCategoryController::destroy
* @see app/Http/Controllers/Dashboard/MenuCategoryController.php:46
* @route '/menu-pos/categories/{category}'
*/
destroy.delete = (args: { category: number | { id: number } } | [category: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const MenuCategoryController = { create, store, show, edit, update, destroy }

export default MenuCategoryController