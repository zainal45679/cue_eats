import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::index
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:15
 * @route '/inventory-setup/approval-configurations'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/approval-configurations',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::index
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:15
 * @route '/inventory-setup/approval-configurations'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::index
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:15
 * @route '/inventory-setup/approval-configurations'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::index
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:15
 * @route '/inventory-setup/approval-configurations'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::create
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:28
 * @route '/inventory-setup/approval-configurations/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/approval-configurations/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::create
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:28
 * @route '/inventory-setup/approval-configurations/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::create
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:28
 * @route '/inventory-setup/approval-configurations/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::create
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:28
 * @route '/inventory-setup/approval-configurations/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::store
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:34
 * @route '/inventory-setup/approval-configurations'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/inventory-setup/approval-configurations',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::store
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:34
 * @route '/inventory-setup/approval-configurations'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::store
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:34
 * @route '/inventory-setup/approval-configurations'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::show
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:0
 * @route '/inventory-setup/approval-configurations/{approval_configuration}'
 */
export const show = (args: { approval_configuration: string | number } | [approval_configuration: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/approval-configurations/{approval_configuration}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::show
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:0
 * @route '/inventory-setup/approval-configurations/{approval_configuration}'
 */
show.url = (args: { approval_configuration: string | number } | [approval_configuration: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { approval_configuration: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    approval_configuration: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        approval_configuration: args.approval_configuration,
                }

    return show.definition.url
            .replace('{approval_configuration}', parsedArgs.approval_configuration.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::show
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:0
 * @route '/inventory-setup/approval-configurations/{approval_configuration}'
 */
show.get = (args: { approval_configuration: string | number } | [approval_configuration: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::show
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:0
 * @route '/inventory-setup/approval-configurations/{approval_configuration}'
 */
show.head = (args: { approval_configuration: string | number } | [approval_configuration: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::edit
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:50
 * @route '/inventory-setup/approval-configurations/{approval_configuration}/edit'
 */
export const edit = (args: { approval_configuration: string | number } | [approval_configuration: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/approval-configurations/{approval_configuration}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::edit
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:50
 * @route '/inventory-setup/approval-configurations/{approval_configuration}/edit'
 */
edit.url = (args: { approval_configuration: string | number } | [approval_configuration: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { approval_configuration: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    approval_configuration: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        approval_configuration: args.approval_configuration,
                }

    return edit.definition.url
            .replace('{approval_configuration}', parsedArgs.approval_configuration.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::edit
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:50
 * @route '/inventory-setup/approval-configurations/{approval_configuration}/edit'
 */
edit.get = (args: { approval_configuration: string | number } | [approval_configuration: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::edit
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:50
 * @route '/inventory-setup/approval-configurations/{approval_configuration}/edit'
 */
edit.head = (args: { approval_configuration: string | number } | [approval_configuration: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::update
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:61
 * @route '/inventory-setup/approval-configurations/{approval_configuration}'
 */
export const update = (args: { approval_configuration: string | number } | [approval_configuration: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/inventory-setup/approval-configurations/{approval_configuration}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::update
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:61
 * @route '/inventory-setup/approval-configurations/{approval_configuration}'
 */
update.url = (args: { approval_configuration: string | number } | [approval_configuration: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { approval_configuration: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    approval_configuration: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        approval_configuration: args.approval_configuration,
                }

    return update.definition.url
            .replace('{approval_configuration}', parsedArgs.approval_configuration.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::update
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:61
 * @route '/inventory-setup/approval-configurations/{approval_configuration}'
 */
update.put = (args: { approval_configuration: string | number } | [approval_configuration: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})
/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::update
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:61
 * @route '/inventory-setup/approval-configurations/{approval_configuration}'
 */
update.patch = (args: { approval_configuration: string | number } | [approval_configuration: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::destroy
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:79
 * @route '/inventory-setup/approval-configurations/{approval_configuration}'
 */
export const destroy = (args: { approval_configuration: string | number } | [approval_configuration: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/inventory-setup/approval-configurations/{approval_configuration}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::destroy
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:79
 * @route '/inventory-setup/approval-configurations/{approval_configuration}'
 */
destroy.url = (args: { approval_configuration: string | number } | [approval_configuration: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { approval_configuration: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    approval_configuration: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        approval_configuration: args.approval_configuration,
                }

    return destroy.definition.url
            .replace('{approval_configuration}', parsedArgs.approval_configuration.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\ApprovalConfigurationController::destroy
 * @see app/Http/Controllers/Dashboard/ApprovalConfigurationController.php:79
 * @route '/inventory-setup/approval-configurations/{approval_configuration}'
 */
destroy.delete = (args: { approval_configuration: string | number } | [approval_configuration: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})
const ApprovalConfigurationController = { index, create, store, show, edit, update, destroy }

export default ApprovalConfigurationController