import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::search
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:18
 * @route '/inventory-setup/units-of-measure/search'
 */
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/units-of-measure/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::search
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:18
 * @route '/inventory-setup/units-of-measure/search'
 */
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::search
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:18
 * @route '/inventory-setup/units-of-measure/search'
 */
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::search
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:18
 * @route '/inventory-setup/units-of-measure/search'
 */
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::index
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:26
 * @route '/inventory-setup/units-of-measure'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/units-of-measure',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::index
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:26
 * @route '/inventory-setup/units-of-measure'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::index
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:26
 * @route '/inventory-setup/units-of-measure'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::index
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:26
 * @route '/inventory-setup/units-of-measure'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::create
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:39
 * @route '/inventory-setup/units-of-measure/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/units-of-measure/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::create
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:39
 * @route '/inventory-setup/units-of-measure/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::create
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:39
 * @route '/inventory-setup/units-of-measure/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::create
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:39
 * @route '/inventory-setup/units-of-measure/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::store
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:50
 * @route '/inventory-setup/units-of-measure'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/inventory-setup/units-of-measure',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::store
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:50
 * @route '/inventory-setup/units-of-measure'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::store
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:50
 * @route '/inventory-setup/units-of-measure'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::show
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:69
 * @route '/inventory-setup/units-of-measure/{units_of_measure}'
 */
export const show = (args: { units_of_measure: string | number } | [units_of_measure: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/units-of-measure/{units_of_measure}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::show
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:69
 * @route '/inventory-setup/units-of-measure/{units_of_measure}'
 */
show.url = (args: { units_of_measure: string | number } | [units_of_measure: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { units_of_measure: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    units_of_measure: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        units_of_measure: args.units_of_measure,
                }

    return show.definition.url
            .replace('{units_of_measure}', parsedArgs.units_of_measure.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::show
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:69
 * @route '/inventory-setup/units-of-measure/{units_of_measure}'
 */
show.get = (args: { units_of_measure: string | number } | [units_of_measure: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::show
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:69
 * @route '/inventory-setup/units-of-measure/{units_of_measure}'
 */
show.head = (args: { units_of_measure: string | number } | [units_of_measure: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::edit
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:80
 * @route '/inventory-setup/units-of-measure/{units_of_measure}/edit'
 */
export const edit = (args: { units_of_measure: string | number } | [units_of_measure: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/units-of-measure/{units_of_measure}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::edit
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:80
 * @route '/inventory-setup/units-of-measure/{units_of_measure}/edit'
 */
edit.url = (args: { units_of_measure: string | number } | [units_of_measure: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { units_of_measure: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    units_of_measure: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        units_of_measure: args.units_of_measure,
                }

    return edit.definition.url
            .replace('{units_of_measure}', parsedArgs.units_of_measure.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::edit
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:80
 * @route '/inventory-setup/units-of-measure/{units_of_measure}/edit'
 */
edit.get = (args: { units_of_measure: string | number } | [units_of_measure: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::edit
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:80
 * @route '/inventory-setup/units-of-measure/{units_of_measure}/edit'
 */
edit.head = (args: { units_of_measure: string | number } | [units_of_measure: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::update
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:97
 * @route '/inventory-setup/units-of-measure/{units_of_measure}'
 */
export const update = (args: { units_of_measure: string | number } | [units_of_measure: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/inventory-setup/units-of-measure/{units_of_measure}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::update
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:97
 * @route '/inventory-setup/units-of-measure/{units_of_measure}'
 */
update.url = (args: { units_of_measure: string | number } | [units_of_measure: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { units_of_measure: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    units_of_measure: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        units_of_measure: args.units_of_measure,
                }

    return update.definition.url
            .replace('{units_of_measure}', parsedArgs.units_of_measure.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::update
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:97
 * @route '/inventory-setup/units-of-measure/{units_of_measure}'
 */
update.put = (args: { units_of_measure: string | number } | [units_of_measure: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::update
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:97
 * @route '/inventory-setup/units-of-measure/{units_of_measure}'
 */
update.patch = (args: { units_of_measure: string | number } | [units_of_measure: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::destroy
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:118
 * @route '/inventory-setup/units-of-measure/{units_of_measure}'
 */
export const destroy = (args: { units_of_measure: string | number } | [units_of_measure: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/inventory-setup/units-of-measure/{units_of_measure}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::destroy
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:118
 * @route '/inventory-setup/units-of-measure/{units_of_measure}'
 */
destroy.url = (args: { units_of_measure: string | number } | [units_of_measure: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { units_of_measure: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    units_of_measure: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        units_of_measure: args.units_of_measure,
                }

    return destroy.definition.url
            .replace('{units_of_measure}', parsedArgs.units_of_measure.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\UnitOfMeasureController::destroy
 * @see app/Http/Controllers/Dashboard/UnitOfMeasureController.php:118
 * @route '/inventory-setup/units-of-measure/{units_of_measure}'
 */
destroy.delete = (args: { units_of_measure: string | number } | [units_of_measure: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const unitsOfMeasure = {
    search: Object.assign(search, search),
index: Object.assign(index, index),
create: Object.assign(create, create),
store: Object.assign(store, store),
show: Object.assign(show, show),
edit: Object.assign(edit, edit),
update: Object.assign(update, update),
destroy: Object.assign(destroy, destroy),
}

export default unitsOfMeasure