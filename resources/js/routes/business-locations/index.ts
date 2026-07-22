import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::search
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:19
* @route '/inventory-setup/business-locations/search'
*/
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/business-locations/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::search
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:19
* @route '/inventory-setup/business-locations/search'
*/
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::search
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:19
* @route '/inventory-setup/business-locations/search'
*/
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::search
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:19
* @route '/inventory-setup/business-locations/search'
*/
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::index
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:28
* @route '/inventory-setup/business-locations'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/business-locations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::index
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:28
* @route '/inventory-setup/business-locations'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::index
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:28
* @route '/inventory-setup/business-locations'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::index
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:28
* @route '/inventory-setup/business-locations'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::create
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:41
* @route '/inventory-setup/business-locations/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/business-locations/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::create
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:41
* @route '/inventory-setup/business-locations/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::create
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:41
* @route '/inventory-setup/business-locations/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::create
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:41
* @route '/inventory-setup/business-locations/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::store
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:54
* @route '/inventory-setup/business-locations'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/inventory-setup/business-locations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::store
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:54
* @route '/inventory-setup/business-locations'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::store
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:54
* @route '/inventory-setup/business-locations'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::show
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:77
* @route '/inventory-setup/business-locations/{business_location}'
*/
export const show = (args: { business_location: string | number } | [business_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/business-locations/{business_location}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::show
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:77
* @route '/inventory-setup/business-locations/{business_location}'
*/
show.url = (args: { business_location: string | number } | [business_location: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { business_location: args }
    }

    if (Array.isArray(args)) {
        args = {
            business_location: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        business_location: args.business_location,
    }

    return show.definition.url
            .replace('{business_location}', parsedArgs.business_location.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::show
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:77
* @route '/inventory-setup/business-locations/{business_location}'
*/
show.get = (args: { business_location: string | number } | [business_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::show
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:77
* @route '/inventory-setup/business-locations/{business_location}'
*/
show.head = (args: { business_location: string | number } | [business_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::edit
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:88
* @route '/inventory-setup/business-locations/{business_location}/edit'
*/
export const edit = (args: { business_location: string | number } | [business_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/business-locations/{business_location}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::edit
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:88
* @route '/inventory-setup/business-locations/{business_location}/edit'
*/
edit.url = (args: { business_location: string | number } | [business_location: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { business_location: args }
    }

    if (Array.isArray(args)) {
        args = {
            business_location: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        business_location: args.business_location,
    }

    return edit.definition.url
            .replace('{business_location}', parsedArgs.business_location.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::edit
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:88
* @route '/inventory-setup/business-locations/{business_location}/edit'
*/
edit.get = (args: { business_location: string | number } | [business_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::edit
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:88
* @route '/inventory-setup/business-locations/{business_location}/edit'
*/
edit.head = (args: { business_location: string | number } | [business_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::update
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:107
* @route '/inventory-setup/business-locations/{business_location}'
*/
export const update = (args: { business_location: string | number } | [business_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/inventory-setup/business-locations/{business_location}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::update
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:107
* @route '/inventory-setup/business-locations/{business_location}'
*/
update.url = (args: { business_location: string | number } | [business_location: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { business_location: args }
    }

    if (Array.isArray(args)) {
        args = {
            business_location: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        business_location: args.business_location,
    }

    return update.definition.url
            .replace('{business_location}', parsedArgs.business_location.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::update
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:107
* @route '/inventory-setup/business-locations/{business_location}'
*/
update.put = (args: { business_location: string | number } | [business_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::update
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:107
* @route '/inventory-setup/business-locations/{business_location}'
*/
update.patch = (args: { business_location: string | number } | [business_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::destroy
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:136
* @route '/inventory-setup/business-locations/{business_location}'
*/
export const destroy = (args: { business_location: string | number } | [business_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/inventory-setup/business-locations/{business_location}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::destroy
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:136
* @route '/inventory-setup/business-locations/{business_location}'
*/
destroy.url = (args: { business_location: string | number } | [business_location: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { business_location: args }
    }

    if (Array.isArray(args)) {
        args = {
            business_location: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        business_location: args.business_location,
    }

    return destroy.definition.url
            .replace('{business_location}', parsedArgs.business_location.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\BusinessLocationController::destroy
* @see app/Http/Controllers/Dashboard/BusinessLocationController.php:136
* @route '/inventory-setup/business-locations/{business_location}'
*/
destroy.delete = (args: { business_location: string | number } | [business_location: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const businessLocations = {
    search: Object.assign(search, search),
    index: Object.assign(index, index),
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default businessLocations