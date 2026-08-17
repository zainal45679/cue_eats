import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\RoleController::search
 * @see app/Http/Controllers/Dashboard/RoleController.php:132
 * @route '/roles/search'
 */
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/roles/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\RoleController::search
 * @see app/Http/Controllers/Dashboard/RoleController.php:132
 * @route '/roles/search'
 */
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\RoleController::search
 * @see app/Http/Controllers/Dashboard/RoleController.php:132
 * @route '/roles/search'
 */
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\RoleController::search
 * @see app/Http/Controllers/Dashboard/RoleController.php:132
 * @route '/roles/search'
 */
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\RoleController::index
 * @see app/Http/Controllers/Dashboard/RoleController.php:18
 * @route '/roles'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/roles',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\RoleController::index
 * @see app/Http/Controllers/Dashboard/RoleController.php:18
 * @route '/roles'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\RoleController::index
 * @see app/Http/Controllers/Dashboard/RoleController.php:18
 * @route '/roles'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\RoleController::index
 * @see app/Http/Controllers/Dashboard/RoleController.php:18
 * @route '/roles'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\RoleController::create
 * @see app/Http/Controllers/Dashboard/RoleController.php:33
 * @route '/roles/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/roles/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\RoleController::create
 * @see app/Http/Controllers/Dashboard/RoleController.php:33
 * @route '/roles/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\RoleController::create
 * @see app/Http/Controllers/Dashboard/RoleController.php:33
 * @route '/roles/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\RoleController::create
 * @see app/Http/Controllers/Dashboard/RoleController.php:33
 * @route '/roles/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\RoleController::store
 * @see app/Http/Controllers/Dashboard/RoleController.php:42
 * @route '/roles'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/roles',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\RoleController::store
 * @see app/Http/Controllers/Dashboard/RoleController.php:42
 * @route '/roles'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\RoleController::store
 * @see app/Http/Controllers/Dashboard/RoleController.php:42
 * @route '/roles'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\RoleController::show
 * @see app/Http/Controllers/Dashboard/RoleController.php:78
 * @route '/roles/{role}'
 */
export const show = (args: { role: string | { id: string } } | [role: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/roles/{role}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\RoleController::show
 * @see app/Http/Controllers/Dashboard/RoleController.php:78
 * @route '/roles/{role}'
 */
show.url = (args: { role: string | { id: string } } | [role: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { role: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { role: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    role: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        role: typeof args.role === 'object'
                ? args.role.id
                : args.role,
                }

    return show.definition.url
            .replace('{role}', parsedArgs.role.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\RoleController::show
 * @see app/Http/Controllers/Dashboard/RoleController.php:78
 * @route '/roles/{role}'
 */
show.get = (args: { role: string | { id: string } } | [role: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\RoleController::show
 * @see app/Http/Controllers/Dashboard/RoleController.php:78
 * @route '/roles/{role}'
 */
show.head = (args: { role: string | { id: string } } | [role: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\RoleController::edit
 * @see app/Http/Controllers/Dashboard/RoleController.php:88
 * @route '/roles/{role}/edit'
 */
export const edit = (args: { role: string | { id: string } } | [role: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/roles/{role}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\RoleController::edit
 * @see app/Http/Controllers/Dashboard/RoleController.php:88
 * @route '/roles/{role}/edit'
 */
edit.url = (args: { role: string | { id: string } } | [role: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { role: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { role: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    role: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        role: typeof args.role === 'object'
                ? args.role.id
                : args.role,
                }

    return edit.definition.url
            .replace('{role}', parsedArgs.role.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\RoleController::edit
 * @see app/Http/Controllers/Dashboard/RoleController.php:88
 * @route '/roles/{role}/edit'
 */
edit.get = (args: { role: string | { id: string } } | [role: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\RoleController::edit
 * @see app/Http/Controllers/Dashboard/RoleController.php:88
 * @route '/roles/{role}/edit'
 */
edit.head = (args: { role: string | { id: string } } | [role: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\RoleController::update
 * @see app/Http/Controllers/Dashboard/RoleController.php:98
 * @route '/roles/{role}'
 */
export const update = (args: { role: string | { id: string } } | [role: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/roles/{role}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Dashboard\RoleController::update
 * @see app/Http/Controllers/Dashboard/RoleController.php:98
 * @route '/roles/{role}'
 */
update.url = (args: { role: string | { id: string } } | [role: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { role: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { role: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    role: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        role: typeof args.role === 'object'
                ? args.role.id
                : args.role,
                }

    return update.definition.url
            .replace('{role}', parsedArgs.role.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\RoleController::update
 * @see app/Http/Controllers/Dashboard/RoleController.php:98
 * @route '/roles/{role}'
 */
update.put = (args: { role: string | { id: string } } | [role: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Dashboard\RoleController::update
 * @see app/Http/Controllers/Dashboard/RoleController.php:98
 * @route '/roles/{role}'
 */
update.patch = (args: { role: string | { id: string } } | [role: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Dashboard\RoleController::destroy
 * @see app/Http/Controllers/Dashboard/RoleController.php:147
 * @route '/roles/{role}'
 */
export const destroy = (args: { role: string | { id: string } } | [role: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/roles/{role}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Dashboard\RoleController::destroy
 * @see app/Http/Controllers/Dashboard/RoleController.php:147
 * @route '/roles/{role}'
 */
destroy.url = (args: { role: string | { id: string } } | [role: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { role: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { role: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    role: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        role: typeof args.role === 'object'
                ? args.role.id
                : args.role,
                }

    return destroy.definition.url
            .replace('{role}', parsedArgs.role.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\RoleController::destroy
 * @see app/Http/Controllers/Dashboard/RoleController.php:147
 * @route '/roles/{role}'
 */
destroy.delete = (args: { role: string | { id: string } } | [role: string | { id: string } ] | string | { id: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const RoleController = { search, index, create, store, show, edit, update, destroy }

export default RoleController