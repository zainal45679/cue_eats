import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::approvalForm
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:201
* @route '/purchasing/purchase-orders/{purchase_order}/approve'
*/
export const approvalForm = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: approvalForm.url(args, options),
    method: 'get',
})

approvalForm.definition = {
    methods: ["get","head"],
    url: '/purchasing/purchase-orders/{purchase_order}/approve',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::approvalForm
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:201
* @route '/purchasing/purchase-orders/{purchase_order}/approve'
*/
approvalForm.url = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { purchase_order: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'uuid' in args) {
        args = { purchase_order: args.uuid }
    }

    if (Array.isArray(args)) {
        args = {
            purchase_order: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        purchase_order: typeof args.purchase_order === 'object'
        ? args.purchase_order.uuid
        : args.purchase_order,
    }

    return approvalForm.definition.url
            .replace('{purchase_order}', parsedArgs.purchase_order.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::approvalForm
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:201
* @route '/purchasing/purchase-orders/{purchase_order}/approve'
*/
approvalForm.get = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: approvalForm.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::approvalForm
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:201
* @route '/purchasing/purchase-orders/{purchase_order}/approve'
*/
approvalForm.head = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: approvalForm.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::approve
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:216
* @route '/purchasing/purchase-orders/{purchase_order}/approve'
*/
export const approve = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

approve.definition = {
    methods: ["post"],
    url: '/purchasing/purchase-orders/{purchase_order}/approve',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::approve
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:216
* @route '/purchasing/purchase-orders/{purchase_order}/approve'
*/
approve.url = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { purchase_order: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'uuid' in args) {
        args = { purchase_order: args.uuid }
    }

    if (Array.isArray(args)) {
        args = {
            purchase_order: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        purchase_order: typeof args.purchase_order === 'object'
        ? args.purchase_order.uuid
        : args.purchase_order,
    }

    return approve.definition.url
            .replace('{purchase_order}', parsedArgs.purchase_order.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::approve
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:216
* @route '/purchasing/purchase-orders/{purchase_order}/approve'
*/
approve.post = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: approve.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::submit
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:188
* @route '/purchasing/purchase-orders/{purchase_order}/submit'
*/
export const submit = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submit.url(args, options),
    method: 'post',
})

submit.definition = {
    methods: ["post"],
    url: '/purchasing/purchase-orders/{purchase_order}/submit',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::submit
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:188
* @route '/purchasing/purchase-orders/{purchase_order}/submit'
*/
submit.url = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { purchase_order: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'uuid' in args) {
        args = { purchase_order: args.uuid }
    }

    if (Array.isArray(args)) {
        args = {
            purchase_order: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        purchase_order: typeof args.purchase_order === 'object'
        ? args.purchase_order.uuid
        : args.purchase_order,
    }

    return submit.definition.url
            .replace('{purchase_order}', parsedArgs.purchase_order.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::submit
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:188
* @route '/purchasing/purchase-orders/{purchase_order}/submit'
*/
submit.post = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: submit.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::reject
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:291
* @route '/purchasing/purchase-orders/{purchase_order}/reject'
*/
export const reject = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

reject.definition = {
    methods: ["post"],
    url: '/purchasing/purchase-orders/{purchase_order}/reject',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::reject
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:291
* @route '/purchasing/purchase-orders/{purchase_order}/reject'
*/
reject.url = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { purchase_order: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'uuid' in args) {
        args = { purchase_order: args.uuid }
    }

    if (Array.isArray(args)) {
        args = {
            purchase_order: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        purchase_order: typeof args.purchase_order === 'object'
        ? args.purchase_order.uuid
        : args.purchase_order,
    }

    return reject.definition.url
            .replace('{purchase_order}', parsedArgs.purchase_order.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::reject
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:291
* @route '/purchasing/purchase-orders/{purchase_order}/reject'
*/
reject.post = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: reject.url(args, options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::index
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:12
* @route '/purchasing/purchase-orders'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/purchasing/purchase-orders',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::index
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:12
* @route '/purchasing/purchase-orders'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::index
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:12
* @route '/purchasing/purchase-orders'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::index
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:12
* @route '/purchasing/purchase-orders'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::create
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:40
* @route '/purchasing/purchase-orders/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/purchasing/purchase-orders/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::create
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:40
* @route '/purchasing/purchase-orders/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::create
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:40
* @route '/purchasing/purchase-orders/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::create
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:40
* @route '/purchasing/purchase-orders/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::store
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:58
* @route '/purchasing/purchase-orders'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/purchasing/purchase-orders',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::store
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:58
* @route '/purchasing/purchase-orders'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::store
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:58
* @route '/purchasing/purchase-orders'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::show
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:154
* @route '/purchasing/purchase-orders/{purchase_order}'
*/
export const show = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/purchasing/purchase-orders/{purchase_order}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::show
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:154
* @route '/purchasing/purchase-orders/{purchase_order}'
*/
show.url = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { purchase_order: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'uuid' in args) {
        args = { purchase_order: args.uuid }
    }

    if (Array.isArray(args)) {
        args = {
            purchase_order: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        purchase_order: typeof args.purchase_order === 'object'
        ? args.purchase_order.uuid
        : args.purchase_order,
    }

    return show.definition.url
            .replace('{purchase_order}', parsedArgs.purchase_order.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::show
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:154
* @route '/purchasing/purchase-orders/{purchase_order}'
*/
show.get = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::show
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:154
* @route '/purchasing/purchase-orders/{purchase_order}'
*/
show.head = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::edit
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:167
* @route '/purchasing/purchase-orders/{purchase_order}/edit'
*/
export const edit = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/purchasing/purchase-orders/{purchase_order}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::edit
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:167
* @route '/purchasing/purchase-orders/{purchase_order}/edit'
*/
edit.url = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { purchase_order: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'uuid' in args) {
        args = { purchase_order: args.uuid }
    }

    if (Array.isArray(args)) {
        args = {
            purchase_order: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        purchase_order: typeof args.purchase_order === 'object'
        ? args.purchase_order.uuid
        : args.purchase_order,
    }

    return edit.definition.url
            .replace('{purchase_order}', parsedArgs.purchase_order.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::edit
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:167
* @route '/purchasing/purchase-orders/{purchase_order}/edit'
*/
edit.get = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::edit
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:167
* @route '/purchasing/purchase-orders/{purchase_order}/edit'
*/
edit.head = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::update
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:313
* @route '/purchasing/purchase-orders/{purchase_order}'
*/
export const update = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/purchasing/purchase-orders/{purchase_order}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::update
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:313
* @route '/purchasing/purchase-orders/{purchase_order}'
*/
update.url = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { purchase_order: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'uuid' in args) {
        args = { purchase_order: args.uuid }
    }

    if (Array.isArray(args)) {
        args = {
            purchase_order: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        purchase_order: typeof args.purchase_order === 'object'
        ? args.purchase_order.uuid
        : args.purchase_order,
    }

    return update.definition.url
            .replace('{purchase_order}', parsedArgs.purchase_order.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::update
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:313
* @route '/purchasing/purchase-orders/{purchase_order}'
*/
update.put = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::update
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:313
* @route '/purchasing/purchase-orders/{purchase_order}'
*/
update.patch = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::destroy
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:363
* @route '/purchasing/purchase-orders/{purchase_order}'
*/
export const destroy = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/purchasing/purchase-orders/{purchase_order}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::destroy
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:363
* @route '/purchasing/purchase-orders/{purchase_order}'
*/
destroy.url = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { purchase_order: args }
    }

    if (typeof args === 'object' && !Array.isArray(args) && 'uuid' in args) {
        args = { purchase_order: args.uuid }
    }

    if (Array.isArray(args)) {
        args = {
            purchase_order: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        purchase_order: typeof args.purchase_order === 'object'
        ? args.purchase_order.uuid
        : args.purchase_order,
    }

    return destroy.definition.url
            .replace('{purchase_order}', parsedArgs.purchase_order.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\PurchaseOrderController::destroy
* @see app/Http/Controllers/Dashboard/PurchaseOrderController.php:363
* @route '/purchasing/purchase-orders/{purchase_order}'
*/
destroy.delete = (args: { purchase_order: string | { uuid: string } } | [purchase_order: string | { uuid: string } ] | string | { uuid: string }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const purchaseOrders = {
    approvalForm: Object.assign(approvalForm, approvalForm),
    approve: Object.assign(approve, approve),
    submit: Object.assign(submit, submit),
    reject: Object.assign(reject, reject),
    index: Object.assign(index, index),
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default purchaseOrders