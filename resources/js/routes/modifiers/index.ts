import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\ModifierGroupController::create
* @see app/Http/Controllers/Dashboard/ModifierGroupController.php:0
* @route '/menu-pos/modifiers/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/menu-pos/modifiers/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\ModifierGroupController::create
* @see app/Http/Controllers/Dashboard/ModifierGroupController.php:0
* @route '/menu-pos/modifiers/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\ModifierGroupController::create
* @see app/Http/Controllers/Dashboard/ModifierGroupController.php:0
* @route '/menu-pos/modifiers/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\ModifierGroupController::create
* @see app/Http/Controllers/Dashboard/ModifierGroupController.php:0
* @route '/menu-pos/modifiers/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\ModifierGroupController::store
* @see app/Http/Controllers/Dashboard/ModifierGroupController.php:21
* @route '/menu-pos/modifiers'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/menu-pos/modifiers',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\ModifierGroupController::store
* @see app/Http/Controllers/Dashboard/ModifierGroupController.php:21
* @route '/menu-pos/modifiers'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\ModifierGroupController::store
* @see app/Http/Controllers/Dashboard/ModifierGroupController.php:21
* @route '/menu-pos/modifiers'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\ModifierGroupController::show
* @see app/Http/Controllers/Dashboard/ModifierGroupController.php:0
* @route '/menu-pos/modifiers/{modifier}'
*/
export const show = (args: { modifier: string | number } | [modifier: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/menu-pos/modifiers/{modifier}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\ModifierGroupController::show
* @see app/Http/Controllers/Dashboard/ModifierGroupController.php:0
* @route '/menu-pos/modifiers/{modifier}'
*/
show.url = (args: { modifier: string | number } | [modifier: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { modifier: args }
    }

    if (Array.isArray(args)) {
        args = {
            modifier: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        modifier: args.modifier,
    }

    return show.definition.url
            .replace('{modifier}', parsedArgs.modifier.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\ModifierGroupController::show
* @see app/Http/Controllers/Dashboard/ModifierGroupController.php:0
* @route '/menu-pos/modifiers/{modifier}'
*/
show.get = (args: { modifier: string | number } | [modifier: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\ModifierGroupController::show
* @see app/Http/Controllers/Dashboard/ModifierGroupController.php:0
* @route '/menu-pos/modifiers/{modifier}'
*/
show.head = (args: { modifier: string | number } | [modifier: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\ModifierGroupController::edit
* @see app/Http/Controllers/Dashboard/ModifierGroupController.php:0
* @route '/menu-pos/modifiers/{modifier}/edit'
*/
export const edit = (args: { modifier: string | number } | [modifier: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/menu-pos/modifiers/{modifier}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\ModifierGroupController::edit
* @see app/Http/Controllers/Dashboard/ModifierGroupController.php:0
* @route '/menu-pos/modifiers/{modifier}/edit'
*/
edit.url = (args: { modifier: string | number } | [modifier: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { modifier: args }
    }

    if (Array.isArray(args)) {
        args = {
            modifier: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        modifier: args.modifier,
    }

    return edit.definition.url
            .replace('{modifier}', parsedArgs.modifier.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\ModifierGroupController::edit
* @see app/Http/Controllers/Dashboard/ModifierGroupController.php:0
* @route '/menu-pos/modifiers/{modifier}/edit'
*/
edit.get = (args: { modifier: string | number } | [modifier: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\ModifierGroupController::edit
* @see app/Http/Controllers/Dashboard/ModifierGroupController.php:0
* @route '/menu-pos/modifiers/{modifier}/edit'
*/
edit.head = (args: { modifier: string | number } | [modifier: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\ModifierGroupController::update
* @see app/Http/Controllers/Dashboard/ModifierGroupController.php:42
* @route '/menu-pos/modifiers/{modifier}'
*/
export const update = (args: { modifier: number | { id: number } } | [modifier: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/menu-pos/modifiers/{modifier}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Dashboard\ModifierGroupController::update
* @see app/Http/Controllers/Dashboard/ModifierGroupController.php:42
* @route '/menu-pos/modifiers/{modifier}'
*/
update.url = (args: { modifier: number | { id: number } } | [modifier: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { modifier: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { modifier: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            modifier: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        modifier: typeof args.modifier === 'object'
        ? args.modifier.id
        : args.modifier,
    }

    return update.definition.url
            .replace('{modifier}', parsedArgs.modifier.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\ModifierGroupController::update
* @see app/Http/Controllers/Dashboard/ModifierGroupController.php:42
* @route '/menu-pos/modifiers/{modifier}'
*/
update.put = (args: { modifier: number | { id: number } } | [modifier: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Dashboard\ModifierGroupController::update
* @see app/Http/Controllers/Dashboard/ModifierGroupController.php:42
* @route '/menu-pos/modifiers/{modifier}'
*/
update.patch = (args: { modifier: number | { id: number } } | [modifier: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Dashboard\ModifierGroupController::destroy
* @see app/Http/Controllers/Dashboard/ModifierGroupController.php:80
* @route '/menu-pos/modifiers/{modifier}'
*/
export const destroy = (args: { modifier: number | { id: number } } | [modifier: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/menu-pos/modifiers/{modifier}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Dashboard\ModifierGroupController::destroy
* @see app/Http/Controllers/Dashboard/ModifierGroupController.php:80
* @route '/menu-pos/modifiers/{modifier}'
*/
destroy.url = (args: { modifier: number | { id: number } } | [modifier: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { modifier: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
        args = { modifier: args.id }
    }

    if (Array.isArray(args)) {
        args = {
            modifier: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        modifier: typeof args.modifier === 'object'
        ? args.modifier.id
        : args.modifier,
    }

    return destroy.definition.url
            .replace('{modifier}', parsedArgs.modifier.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\ModifierGroupController::destroy
* @see app/Http/Controllers/Dashboard/ModifierGroupController.php:80
* @route '/menu-pos/modifiers/{modifier}'
*/
destroy.delete = (args: { modifier: number | { id: number } } | [modifier: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const modifiers = {
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default modifiers