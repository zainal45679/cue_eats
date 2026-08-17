import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\CountryController::search
 * @see app/Http/Controllers/Dashboard/CountryController.php:91
 * @route '/inventory-setup/countries/search'
 */
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/countries/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\CountryController::search
 * @see app/Http/Controllers/Dashboard/CountryController.php:91
 * @route '/inventory-setup/countries/search'
 */
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\CountryController::search
 * @see app/Http/Controllers/Dashboard/CountryController.php:91
 * @route '/inventory-setup/countries/search'
 */
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\CountryController::search
 * @see app/Http/Controllers/Dashboard/CountryController.php:91
 * @route '/inventory-setup/countries/search'
 */
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\CountryController::index
 * @see app/Http/Controllers/Dashboard/CountryController.php:17
 * @route '/inventory-setup/countries'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/countries',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\CountryController::index
 * @see app/Http/Controllers/Dashboard/CountryController.php:17
 * @route '/inventory-setup/countries'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\CountryController::index
 * @see app/Http/Controllers/Dashboard/CountryController.php:17
 * @route '/inventory-setup/countries'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\CountryController::index
 * @see app/Http/Controllers/Dashboard/CountryController.php:17
 * @route '/inventory-setup/countries'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\CountryController::create
 * @see app/Http/Controllers/Dashboard/CountryController.php:30
 * @route '/inventory-setup/countries/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/countries/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\CountryController::create
 * @see app/Http/Controllers/Dashboard/CountryController.php:30
 * @route '/inventory-setup/countries/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\CountryController::create
 * @see app/Http/Controllers/Dashboard/CountryController.php:30
 * @route '/inventory-setup/countries/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\CountryController::create
 * @see app/Http/Controllers/Dashboard/CountryController.php:30
 * @route '/inventory-setup/countries/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\CountryController::store
 * @see app/Http/Controllers/Dashboard/CountryController.php:35
 * @route '/inventory-setup/countries'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/inventory-setup/countries',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\CountryController::store
 * @see app/Http/Controllers/Dashboard/CountryController.php:35
 * @route '/inventory-setup/countries'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\CountryController::store
 * @see app/Http/Controllers/Dashboard/CountryController.php:35
 * @route '/inventory-setup/countries'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\CountryController::show
 * @see app/Http/Controllers/Dashboard/CountryController.php:49
 * @route '/inventory-setup/countries/{country}'
 */
export const show = (args: { country: string | number } | [country: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/countries/{country}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\CountryController::show
 * @see app/Http/Controllers/Dashboard/CountryController.php:49
 * @route '/inventory-setup/countries/{country}'
 */
show.url = (args: { country: string | number } | [country: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { country: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    country: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        country: args.country,
                }

    return show.definition.url
            .replace('{country}', parsedArgs.country.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\CountryController::show
 * @see app/Http/Controllers/Dashboard/CountryController.php:49
 * @route '/inventory-setup/countries/{country}'
 */
show.get = (args: { country: string | number } | [country: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\CountryController::show
 * @see app/Http/Controllers/Dashboard/CountryController.php:49
 * @route '/inventory-setup/countries/{country}'
 */
show.head = (args: { country: string | number } | [country: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\CountryController::edit
 * @see app/Http/Controllers/Dashboard/CountryController.php:58
 * @route '/inventory-setup/countries/{country}/edit'
 */
export const edit = (args: { country: string | number } | [country: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/countries/{country}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\CountryController::edit
 * @see app/Http/Controllers/Dashboard/CountryController.php:58
 * @route '/inventory-setup/countries/{country}/edit'
 */
edit.url = (args: { country: string | number } | [country: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { country: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    country: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        country: args.country,
                }

    return edit.definition.url
            .replace('{country}', parsedArgs.country.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\CountryController::edit
 * @see app/Http/Controllers/Dashboard/CountryController.php:58
 * @route '/inventory-setup/countries/{country}/edit'
 */
edit.get = (args: { country: string | number } | [country: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\CountryController::edit
 * @see app/Http/Controllers/Dashboard/CountryController.php:58
 * @route '/inventory-setup/countries/{country}/edit'
 */
edit.head = (args: { country: string | number } | [country: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\CountryController::update
 * @see app/Http/Controllers/Dashboard/CountryController.php:67
 * @route '/inventory-setup/countries/{country}'
 */
export const update = (args: { country: string | number } | [country: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/inventory-setup/countries/{country}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Dashboard\CountryController::update
 * @see app/Http/Controllers/Dashboard/CountryController.php:67
 * @route '/inventory-setup/countries/{country}'
 */
update.url = (args: { country: string | number } | [country: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { country: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    country: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        country: args.country,
                }

    return update.definition.url
            .replace('{country}', parsedArgs.country.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\CountryController::update
 * @see app/Http/Controllers/Dashboard/CountryController.php:67
 * @route '/inventory-setup/countries/{country}'
 */
update.put = (args: { country: string | number } | [country: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Dashboard\CountryController::update
 * @see app/Http/Controllers/Dashboard/CountryController.php:67
 * @route '/inventory-setup/countries/{country}'
 */
update.patch = (args: { country: string | number } | [country: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Dashboard\CountryController::destroy
 * @see app/Http/Controllers/Dashboard/CountryController.php:82
 * @route '/inventory-setup/countries/{country}'
 */
export const destroy = (args: { country: string | number } | [country: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/inventory-setup/countries/{country}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Dashboard\CountryController::destroy
 * @see app/Http/Controllers/Dashboard/CountryController.php:82
 * @route '/inventory-setup/countries/{country}'
 */
destroy.url = (args: { country: string | number } | [country: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { country: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    country: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        country: args.country,
                }

    return destroy.definition.url
            .replace('{country}', parsedArgs.country.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\CountryController::destroy
 * @see app/Http/Controllers/Dashboard/CountryController.php:82
 * @route '/inventory-setup/countries/{country}'
 */
destroy.delete = (args: { country: string | number } | [country: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const countries = {
    search: Object.assign(search, search),
index: Object.assign(index, index),
create: Object.assign(create, create),
store: Object.assign(store, store),
show: Object.assign(show, show),
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default countries