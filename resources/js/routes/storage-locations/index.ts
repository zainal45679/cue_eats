import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::search
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:123
* @route '/inventory-setup/storage-locations/search'
*/
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/storage-locations/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::search
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:123
* @route '/inventory-setup/storage-locations/search'
*/
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::search
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:123
* @route '/inventory-setup/storage-locations/search'
*/
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::search
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:123
* @route '/inventory-setup/storage-locations/search'
*/
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::index
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:19
* @route '/inventory-setup/storage-locations'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/storage-locations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::index
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:19
* @route '/inventory-setup/storage-locations'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::index
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:19
* @route '/inventory-setup/storage-locations'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::index
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:19
* @route '/inventory-setup/storage-locations'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::create
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:37
* @route '/inventory-setup/storage-locations/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/storage-locations/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::create
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:37
* @route '/inventory-setup/storage-locations/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::create
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:37
* @route '/inventory-setup/storage-locations/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::create
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:37
* @route '/inventory-setup/storage-locations/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::store
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:48
* @route '/inventory-setup/storage-locations'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/inventory-setup/storage-locations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::store
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:48
* @route '/inventory-setup/storage-locations'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::store
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:48
* @route '/inventory-setup/storage-locations'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::show
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:67
* @route '/inventory-setup/storage-locations/{storage_location}'
*/
export const show = (args: { storage_location: string | number } | [storage_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/storage-locations/{storage_location}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::show
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:67
* @route '/inventory-setup/storage-locations/{storage_location}'
*/
show.url = (args: { storage_location: string | number } | [storage_location: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { storage_location: args }
    }

    if (Array.isArray(args)) {
        args = {
            storage_location: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        storage_location: args.storage_location,
    }

    return show.definition.url
            .replace('{storage_location}', parsedArgs.storage_location.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::show
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:67
* @route '/inventory-setup/storage-locations/{storage_location}'
*/
show.get = (args: { storage_location: string | number } | [storage_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::show
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:67
* @route '/inventory-setup/storage-locations/{storage_location}'
*/
show.head = (args: { storage_location: string | number } | [storage_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::edit
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:78
* @route '/inventory-setup/storage-locations/{storage_location}/edit'
*/
export const edit = (args: { storage_location: string | number } | [storage_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/storage-locations/{storage_location}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::edit
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:78
* @route '/inventory-setup/storage-locations/{storage_location}/edit'
*/
edit.url = (args: { storage_location: string | number } | [storage_location: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { storage_location: args }
    }

    if (Array.isArray(args)) {
        args = {
            storage_location: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        storage_location: args.storage_location,
    }

    return edit.definition.url
            .replace('{storage_location}', parsedArgs.storage_location.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::edit
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:78
* @route '/inventory-setup/storage-locations/{storage_location}/edit'
*/
edit.get = (args: { storage_location: string | number } | [storage_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::edit
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:78
* @route '/inventory-setup/storage-locations/{storage_location}/edit'
*/
edit.head = (args: { storage_location: string | number } | [storage_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::update
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:91
* @route '/inventory-setup/storage-locations/{storage_location}'
*/
export const update = (args: { storage_location: string | number } | [storage_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/inventory-setup/storage-locations/{storage_location}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::update
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:91
* @route '/inventory-setup/storage-locations/{storage_location}'
*/
update.url = (args: { storage_location: string | number } | [storage_location: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { storage_location: args }
    }

    if (Array.isArray(args)) {
        args = {
            storage_location: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        storage_location: args.storage_location,
    }

    return update.definition.url
            .replace('{storage_location}', parsedArgs.storage_location.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::update
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:91
* @route '/inventory-setup/storage-locations/{storage_location}'
*/
update.put = (args: { storage_location: string | number } | [storage_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::update
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:91
* @route '/inventory-setup/storage-locations/{storage_location}'
*/
update.patch = (args: { storage_location: string | number } | [storage_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::destroy
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:112
* @route '/inventory-setup/storage-locations/{storage_location}'
*/
export const destroy = (args: { storage_location: string | number } | [storage_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/inventory-setup/storage-locations/{storage_location}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::destroy
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:112
* @route '/inventory-setup/storage-locations/{storage_location}'
*/
destroy.url = (args: { storage_location: string | number } | [storage_location: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { storage_location: args }
    }

    if (Array.isArray(args)) {
        args = {
            storage_location: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        storage_location: args.storage_location,
    }

    return destroy.definition.url
            .replace('{storage_location}', parsedArgs.storage_location.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\StorageLocationController::destroy
* @see app/Http/Controllers/Dashboard/StorageLocationController.php:112
* @route '/inventory-setup/storage-locations/{storage_location}'
*/
destroy.delete = (args: { storage_location: string | number } | [storage_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const storageLocations = {
    search: Object.assign(search, search),
    index: Object.assign(index, index),
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default storageLocations