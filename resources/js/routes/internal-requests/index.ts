import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::approve
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:145
* @route '/purchasing/internal-requests/{internal_request}/approve'
*/
export const approve = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/purchasing/internal-requests/{internal_request}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::approve
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:145
* @route '/purchasing/internal-requests/{internal_request}/approve'
*/
approve.url = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { internal_request: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'uuid' in args) {
        args = { internal_request: args.uuid }
    }

    if (Array.isArray(args)) {
        args = {
            internal_request: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        internal_request: typeof args.internal_request === 'object'
        ? args.internal_request.uuid
        : args.internal_request,
    }

    return approve.definition.url
            .replace('{internal_request}', parsedArgs.internal_request.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::approve
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:145
* @route '/purchasing/internal-requests/{internal_request}/approve'
*/
approve.post = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::fulfill
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:158
* @route '/purchasing/internal-requests/{internal_request}/fulfill'
*/
export const fulfill = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: fulfill.url(args, options),
    method: 'get',
})

fulfill.definition = {
    methods: ["get","head"],
    url: '/purchasing/internal-requests/{internal_request}/fulfill',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::fulfill
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:158
* @route '/purchasing/internal-requests/{internal_request}/fulfill'
*/
fulfill.url = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { internal_request: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'uuid' in args) {
        args = { internal_request: args.uuid }
    }

    if (Array.isArray(args)) {
        args = {
            internal_request: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        internal_request: typeof args.internal_request === 'object'
        ? args.internal_request.uuid
        : args.internal_request,
    }

    return fulfill.definition.url
            .replace('{internal_request}', parsedArgs.internal_request.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::fulfill
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:158
* @route '/purchasing/internal-requests/{internal_request}/fulfill'
*/
fulfill.get = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: fulfill.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::fulfill
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:158
* @route '/purchasing/internal-requests/{internal_request}/fulfill'
*/
fulfill.head = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: fulfill.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::storeFulfill
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:188
* @route '/purchasing/internal-requests/{internal_request}/fulfill'
*/
export const storeFulfill = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeFulfill.url(args, options),
    method: 'post',
})

storeFulfill.definition = {
    methods: ["post"],
    url: '/purchasing/internal-requests/{internal_request}/fulfill',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::storeFulfill
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:188
* @route '/purchasing/internal-requests/{internal_request}/fulfill'
*/
storeFulfill.url = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { internal_request: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'uuid' in args) {
        args = { internal_request: args.uuid }
    }

    if (Array.isArray(args)) {
        args = {
            internal_request: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        internal_request: typeof args.internal_request === 'object'
        ? args.internal_request.uuid
        : args.internal_request,
    }

    return storeFulfill.definition.url
            .replace('{internal_request}', parsedArgs.internal_request.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::storeFulfill
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:188
* @route '/purchasing/internal-requests/{internal_request}/fulfill'
*/
storeFulfill.post = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: storeFulfill.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::reject
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:313
* @route '/purchasing/internal-requests/{internal_request}/reject'
*/
export const reject = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/purchasing/internal-requests/{internal_request}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::reject
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:313
* @route '/purchasing/internal-requests/{internal_request}/reject'
*/
reject.url = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { internal_request: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'uuid' in args) {
        args = { internal_request: args.uuid }
    }

    if (Array.isArray(args)) {
        args = {
            internal_request: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        internal_request: typeof args.internal_request === 'object'
        ? args.internal_request.uuid
        : args.internal_request,
    }

    return reject.definition.url
            .replace('{internal_request}', parsedArgs.internal_request.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::reject
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:313
* @route '/purchasing/internal-requests/{internal_request}/reject'
*/
reject.post = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::index
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:12
* @route '/purchasing/internal-requests'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/purchasing/internal-requests',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::index
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:12
* @route '/purchasing/internal-requests'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::index
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:12
* @route '/purchasing/internal-requests'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::index
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:12
* @route '/purchasing/internal-requests'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::create
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:35
* @route '/purchasing/internal-requests/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/purchasing/internal-requests/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::create
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:35
* @route '/purchasing/internal-requests/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::create
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:35
* @route '/purchasing/internal-requests/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::create
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:35
* @route '/purchasing/internal-requests/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::store
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:45
* @route '/purchasing/internal-requests'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/purchasing/internal-requests',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::store
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:45
* @route '/purchasing/internal-requests'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::store
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:45
* @route '/purchasing/internal-requests'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::show
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:74
* @route '/purchasing/internal-requests/{internal_request}'
*/
export const show = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/purchasing/internal-requests/{internal_request}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::show
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:74
* @route '/purchasing/internal-requests/{internal_request}'
*/
show.url = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { internal_request: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'uuid' in args) {
        args = { internal_request: args.uuid }
    }

    if (Array.isArray(args)) {
        args = {
            internal_request: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        internal_request: typeof args.internal_request === 'object'
        ? args.internal_request.uuid
        : args.internal_request,
    }

    return show.definition.url
            .replace('{internal_request}', parsedArgs.internal_request.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::show
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:74
* @route '/purchasing/internal-requests/{internal_request}'
*/
show.get = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::show
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:74
* @route '/purchasing/internal-requests/{internal_request}'
*/
show.head = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::edit
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:90
* @route '/purchasing/internal-requests/{internal_request}/edit'
*/
export const edit = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/purchasing/internal-requests/{internal_request}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::edit
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:90
* @route '/purchasing/internal-requests/{internal_request}/edit'
*/
edit.url = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { internal_request: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'uuid' in args) {
        args = { internal_request: args.uuid }
    }

    if (Array.isArray(args)) {
        args = {
            internal_request: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        internal_request: typeof args.internal_request === 'object'
        ? args.internal_request.uuid
        : args.internal_request,
    }

    return edit.definition.url
            .replace('{internal_request}', parsedArgs.internal_request.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::edit
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:90
* @route '/purchasing/internal-requests/{internal_request}/edit'
*/
edit.get = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::edit
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:90
* @route '/purchasing/internal-requests/{internal_request}/edit'
*/
edit.head = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::update
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:103
* @route '/purchasing/internal-requests/{internal_request}'
*/
export const update = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/purchasing/internal-requests/{internal_request}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::update
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:103
* @route '/purchasing/internal-requests/{internal_request}'
*/
update.url = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { internal_request: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'uuid' in args) {
        args = { internal_request: args.uuid }
    }

    if (Array.isArray(args)) {
        args = {
            internal_request: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        internal_request: typeof args.internal_request === 'object'
        ? args.internal_request.uuid
        : args.internal_request,
    }

    return update.definition.url
            .replace('{internal_request}', parsedArgs.internal_request.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::update
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:103
* @route '/purchasing/internal-requests/{internal_request}'
*/
update.put = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::update
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:103
* @route '/purchasing/internal-requests/{internal_request}'
*/
update.patch = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::destroy
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:132
* @route '/purchasing/internal-requests/{internal_request}'
*/
export const destroy = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/purchasing/internal-requests/{internal_request}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::destroy
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:132
* @route '/purchasing/internal-requests/{internal_request}'
*/
destroy.url = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { internal_request: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'uuid' in args) {
        args = { internal_request: args.uuid }
    }

    if (Array.isArray(args)) {
        args = {
            internal_request: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        internal_request: typeof args.internal_request === 'object'
        ? args.internal_request.uuid
        : args.internal_request,
    }

    return destroy.definition.url
            .replace('{internal_request}', parsedArgs.internal_request.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\InternalRequestController::destroy
* @see app/Http/Controllers/Dashboard/InternalRequestController.php:132
* @route '/purchasing/internal-requests/{internal_request}'
*/
destroy.delete = (args: { internal_request: string | { uuid: string } } | [internal_request: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const internalRequests = {
    approve: Object.assign(approve, approve),
    fulfill: Object.assign(fulfill, fulfill),
    storeFulfill: Object.assign(storeFulfill, storeFulfill),
    reject: Object.assign(reject, reject),
    index: Object.assign(index, index),
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default internalRequests