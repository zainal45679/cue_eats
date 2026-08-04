import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::search
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:95
* @route '/supply-chain/payment-terms/search'
*/
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/supply-chain/payment-terms/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::search
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:95
* @route '/supply-chain/payment-terms/search'
*/
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::search
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:95
* @route '/supply-chain/payment-terms/search'
*/
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::search
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:95
* @route '/supply-chain/payment-terms/search'
*/
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::index
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:17
* @route '/supply-chain/payment-terms'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/supply-chain/payment-terms',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::index
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:17
* @route '/supply-chain/payment-terms'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::index
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:17
* @route '/supply-chain/payment-terms'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::index
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:17
* @route '/supply-chain/payment-terms'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::create
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:30
* @route '/supply-chain/payment-terms/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/supply-chain/payment-terms/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::create
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:30
* @route '/supply-chain/payment-terms/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::create
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:30
* @route '/supply-chain/payment-terms/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::create
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:30
* @route '/supply-chain/payment-terms/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::store
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:37
* @route '/supply-chain/payment-terms'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/supply-chain/payment-terms',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::store
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:37
* @route '/supply-chain/payment-terms'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::store
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:37
* @route '/supply-chain/payment-terms'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::show
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:0
* @route '/supply-chain/payment-terms/{payment_term}'
*/
export const show = (args: { payment_term: string | number } | [payment_term: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/supply-chain/payment-terms/{payment_term}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::show
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:0
* @route '/supply-chain/payment-terms/{payment_term}'
*/
show.url = (args: { payment_term: string | number } | [payment_term: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { payment_term: args }
    }

    if (Array.isArray(args)) {
        args = {
            payment_term: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        payment_term: args.payment_term,
    }

    return show.definition.url
            .replace('{payment_term}', parsedArgs.payment_term.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::show
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:0
* @route '/supply-chain/payment-terms/{payment_term}'
*/
show.get = (args: { payment_term: string | number } | [payment_term: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::show
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:0
* @route '/supply-chain/payment-terms/{payment_term}'
*/
show.head = (args: { payment_term: string | number } | [payment_term: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::edit
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:54
* @route '/supply-chain/payment-terms/{payment_term}/edit'
*/
export const edit = (args: { payment_term: string | number } | [payment_term: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/supply-chain/payment-terms/{payment_term}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::edit
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:54
* @route '/supply-chain/payment-terms/{payment_term}/edit'
*/
edit.url = (args: { payment_term: string | number } | [payment_term: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { payment_term: args }
    }

    if (Array.isArray(args)) {
        args = {
            payment_term: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        payment_term: args.payment_term,
    }

    return edit.definition.url
            .replace('{payment_term}', parsedArgs.payment_term.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::edit
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:54
* @route '/supply-chain/payment-terms/{payment_term}/edit'
*/
edit.get = (args: { payment_term: string | number } | [payment_term: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::edit
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:54
* @route '/supply-chain/payment-terms/{payment_term}/edit'
*/
edit.head = (args: { payment_term: string | number } | [payment_term: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::update
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:65
* @route '/supply-chain/payment-terms/{payment_term}'
*/
export const update = (args: { payment_term: string | number } | [payment_term: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/supply-chain/payment-terms/{payment_term}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::update
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:65
* @route '/supply-chain/payment-terms/{payment_term}'
*/
update.url = (args: { payment_term: string | number } | [payment_term: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { payment_term: args }
    }

    if (Array.isArray(args)) {
        args = {
            payment_term: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        payment_term: args.payment_term,
    }

    return update.definition.url
            .replace('{payment_term}', parsedArgs.payment_term.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::update
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:65
* @route '/supply-chain/payment-terms/{payment_term}'
*/
update.put = (args: { payment_term: string | number } | [payment_term: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::update
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:65
* @route '/supply-chain/payment-terms/{payment_term}'
*/
update.patch = (args: { payment_term: string | number } | [payment_term: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::destroy
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:84
* @route '/supply-chain/payment-terms/{payment_term}'
*/
export const destroy = (args: { payment_term: string | number } | [payment_term: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/supply-chain/payment-terms/{payment_term}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::destroy
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:84
* @route '/supply-chain/payment-terms/{payment_term}'
*/
destroy.url = (args: { payment_term: string | number } | [payment_term: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { payment_term: args }
    }

    if (Array.isArray(args)) {
        args = {
            payment_term: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        payment_term: args.payment_term,
    }

    return destroy.definition.url
            .replace('{payment_term}', parsedArgs.payment_term.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\PaymentTermController::destroy
* @see app/Http/Controllers/Dashboard/PaymentTermController.php:84
* @route '/supply-chain/payment-terms/{payment_term}'
*/
destroy.delete = (args: { payment_term: string | number } | [payment_term: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const PaymentTermController = { search, index, create, store, show, edit, update, destroy }

export default PaymentTermController