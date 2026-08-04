import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\MenuItemController::create
* @see app/Http/Controllers/Dashboard/MenuItemController.php:0
* @route '/menu-pos/items/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/menu-pos/items/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\MenuItemController::create
* @see app/Http/Controllers/Dashboard/MenuItemController.php:0
* @route '/menu-pos/items/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\MenuItemController::create
* @see app/Http/Controllers/Dashboard/MenuItemController.php:0
* @route '/menu-pos/items/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\MenuItemController::create
* @see app/Http/Controllers/Dashboard/MenuItemController.php:0
* @route '/menu-pos/items/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\MenuItemController::store
* @see app/Http/Controllers/Dashboard/MenuItemController.php:27
* @route '/menu-pos/items'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/menu-pos/items',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\MenuItemController::store
* @see app/Http/Controllers/Dashboard/MenuItemController.php:27
* @route '/menu-pos/items'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\MenuItemController::store
* @see app/Http/Controllers/Dashboard/MenuItemController.php:27
* @route '/menu-pos/items'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\MenuItemController::show
* @see app/Http/Controllers/Dashboard/MenuItemController.php:0
* @route '/menu-pos/items/{item}'
*/
export const show = (args: { item: string | number } | [item: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/menu-pos/items/{item}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\MenuItemController::show
* @see app/Http/Controllers/Dashboard/MenuItemController.php:0
* @route '/menu-pos/items/{item}'
*/
show.url = (args: { item: string | number } | [item: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { item: args }
    }

    if (Array.isArray(args)) {
        args = {
            item: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        item: args.item,
    }

    return show.definition.url
            .replace('{item}', parsedArgs.item.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\MenuItemController::show
* @see app/Http/Controllers/Dashboard/MenuItemController.php:0
* @route '/menu-pos/items/{item}'
*/
show.get = (args: { item: string | number } | [item: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\MenuItemController::show
* @see app/Http/Controllers/Dashboard/MenuItemController.php:0
* @route '/menu-pos/items/{item}'
*/
show.head = (args: { item: string | number } | [item: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\MenuItemController::edit
* @see app/Http/Controllers/Dashboard/MenuItemController.php:0
* @route '/menu-pos/items/{item}/edit'
*/
export const edit = (args: { item: string | number } | [item: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/menu-pos/items/{item}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\MenuItemController::edit
* @see app/Http/Controllers/Dashboard/MenuItemController.php:0
* @route '/menu-pos/items/{item}/edit'
*/
edit.url = (args: { item: string | number } | [item: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { item: args }
    }

    if (Array.isArray(args)) {
        args = {
            item: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        item: args.item,
    }

    return edit.definition.url
            .replace('{item}', parsedArgs.item.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\MenuItemController::edit
* @see app/Http/Controllers/Dashboard/MenuItemController.php:0
* @route '/menu-pos/items/{item}/edit'
*/
edit.get = (args: { item: string | number } | [item: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\MenuItemController::edit
* @see app/Http/Controllers/Dashboard/MenuItemController.php:0
* @route '/menu-pos/items/{item}/edit'
*/
edit.head = (args: { item: string | number } | [item: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\MenuItemController::update
* @see app/Http/Controllers/Dashboard/MenuItemController.php:50
* @route '/menu-pos/items/{item}'
*/
export const update = (args: { item: number | { id: number } } | [item: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/menu-pos/items/{item}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Dashboard\MenuItemController::update
* @see app/Http/Controllers/Dashboard/MenuItemController.php:50
* @route '/menu-pos/items/{item}'
*/
update.url = (args: { item: number | { id: number } } | [item: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { item: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { item: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            item: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        item: typeof args.item === 'object'
        ? args.item.id
        : args.item,
    }

    return update.definition.url
            .replace('{item}', parsedArgs.item.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\MenuItemController::update
* @see app/Http/Controllers/Dashboard/MenuItemController.php:50
* @route '/menu-pos/items/{item}'
*/
update.put = (args: { item: number | { id: number } } | [item: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Dashboard\MenuItemController::update
* @see app/Http/Controllers/Dashboard/MenuItemController.php:50
* @route '/menu-pos/items/{item}'
*/
update.patch = (args: { item: number | { id: number } } | [item: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Dashboard\MenuItemController::destroy
* @see app/Http/Controllers/Dashboard/MenuItemController.php:75
* @route '/menu-pos/items/{item}'
*/
export const destroy = (args: { item: number | { id: number } } | [item: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/menu-pos/items/{item}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Dashboard\MenuItemController::destroy
* @see app/Http/Controllers/Dashboard/MenuItemController.php:75
* @route '/menu-pos/items/{item}'
*/
destroy.url = (args: { item: number | { id: number } } | [item: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { item: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { item: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            item: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        item: typeof args.item === 'object'
        ? args.item.id
        : args.item,
    }

    return destroy.definition.url
            .replace('{item}', parsedArgs.item.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\MenuItemController::destroy
* @see app/Http/Controllers/Dashboard/MenuItemController.php:75
* @route '/menu-pos/items/{item}'
*/
destroy.delete = (args: { item: number | { id: number } } | [item: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const items = {
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default items