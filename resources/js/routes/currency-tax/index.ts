import { queryParams, type RouteQueryOptions, type RouteDefinition, applyUrlDefaults } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::search
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:107
* @route '/inventory-setup/currency-tax/search'
*/
export const search = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

search.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/currency-tax/search',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::search
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:107
* @route '/inventory-setup/currency-tax/search'
*/
search.url = (options?: RouteQueryOptions) => {
    return search.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::search
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:107
* @route '/inventory-setup/currency-tax/search'
*/
search.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: search.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::search
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:107
* @route '/inventory-setup/currency-tax/search'
*/
search.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: search.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::index
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:18
* @route '/inventory-setup/currency-tax'
*/
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/currency-tax',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::index
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:18
* @route '/inventory-setup/currency-tax'
*/
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::index
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:18
* @route '/inventory-setup/currency-tax'
*/
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::index
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:18
* @route '/inventory-setup/currency-tax'
*/
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::create
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:31
* @route '/inventory-setup/currency-tax/create'
*/
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/currency-tax/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::create
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:31
* @route '/inventory-setup/currency-tax/create'
*/
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::create
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:31
* @route '/inventory-setup/currency-tax/create'
*/
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::create
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:31
* @route '/inventory-setup/currency-tax/create'
*/
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::store
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:40
* @route '/inventory-setup/currency-tax'
*/
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/inventory-setup/currency-tax',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::store
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:40
* @route '/inventory-setup/currency-tax'
*/
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::store
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:40
* @route '/inventory-setup/currency-tax'
*/
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::show
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:57
* @route '/inventory-setup/currency-tax/{currency_tax}'
*/
export const show = (args: { currency_tax: string | number } | [currency_tax: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

show.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/currency-tax/{currency_tax}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::show
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:57
* @route '/inventory-setup/currency-tax/{currency_tax}'
*/
show.url = (args: { currency_tax: string | number } | [currency_tax: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { currency_tax: args }
    }

    if (Array.isArray(args)) {
        args = {
            currency_tax: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        currency_tax: args.currency_tax,
    }

    return show.definition.url
            .replace('{currency_tax}', parsedArgs.currency_tax.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::show
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:57
* @route '/inventory-setup/currency-tax/{currency_tax}'
*/
show.get = (args: { currency_tax: string | number } | [currency_tax: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: show.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::show
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:57
* @route '/inventory-setup/currency-tax/{currency_tax}'
*/
show.head = (args: { currency_tax: string | number } | [currency_tax: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: show.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::edit
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:66
* @route '/inventory-setup/currency-tax/{currency_tax}/edit'
*/
export const edit = (args: { currency_tax: string | number } | [currency_tax: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/inventory-setup/currency-tax/{currency_tax}/edit',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::edit
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:66
* @route '/inventory-setup/currency-tax/{currency_tax}/edit'
*/
edit.url = (args: { currency_tax: string | number } | [currency_tax: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { currency_tax: args }
    }

    if (Array.isArray(args)) {
        args = {
            currency_tax: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        currency_tax: args.currency_tax,
    }

    return edit.definition.url
            .replace('{currency_tax}', parsedArgs.currency_tax.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::edit
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:66
* @route '/inventory-setup/currency-tax/{currency_tax}/edit'
*/
edit.get = (args: { currency_tax: string | number } | [currency_tax: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(args, options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::edit
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:66
* @route '/inventory-setup/currency-tax/{currency_tax}/edit'
*/
edit.head = (args: { currency_tax: string | number } | [currency_tax: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(args, options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::update
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:80
* @route '/inventory-setup/currency-tax/{currency_tax}'
*/
export const update = (args: { currency_tax: string | number } | [currency_tax: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

update.definition = {
    methods: ["put","patch"],
    url: '/inventory-setup/currency-tax/{currency_tax}',
} satisfies RouteDefinition<["put","patch"]>

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::update
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:80
* @route '/inventory-setup/currency-tax/{currency_tax}'
*/
update.url = (args: { currency_tax: string | number } | [currency_tax: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { currency_tax: args }
    }

    if (Array.isArray(args)) {
        args = {
            currency_tax: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        currency_tax: args.currency_tax,
    }

    return update.definition.url
            .replace('{currency_tax}', parsedArgs.currency_tax.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::update
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:80
* @route '/inventory-setup/currency-tax/{currency_tax}'
*/
update.put = (args: { currency_tax: string | number } | [currency_tax: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'put'> => ({
    url: update.url(args, options),
    method: 'put',
})

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::update
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:80
* @route '/inventory-setup/currency-tax/{currency_tax}'
*/
update.patch = (args: { currency_tax: string | number } | [currency_tax: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(args, options),
    method: 'patch',
})

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::destroy
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:98
* @route '/inventory-setup/currency-tax/{currency_tax}'
*/
export const destroy = (args: { currency_tax: string | number } | [currency_tax: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/inventory-setup/currency-tax/{currency_tax}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::destroy
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:98
* @route '/inventory-setup/currency-tax/{currency_tax}'
*/
destroy.url = (args: { currency_tax: string | number } | [currency_tax: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { currency_tax: args }
    }

    if (Array.isArray(args)) {
        args = {
            currency_tax: args[0],
        }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
        currency_tax: args.currency_tax,
    }

    return destroy.definition.url
            .replace('{currency_tax}', parsedArgs.currency_tax.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\CurrencyTaxController::destroy
* @see app/Http/Controllers/Dashboard/CurrencyTaxController.php:98
* @route '/inventory-setup/currency-tax/{currency_tax}'
*/
destroy.delete = (args: { currency_tax: string | number } | [currency_tax: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

const currencyTax = {
    search: Object.assign(search, search),
    index: Object.assign(index, index),
    create: Object.assign(create, create),
    store: Object.assign(store, store),
    show: Object.assign(show, show),
    edit: Object.assign(edit, edit),
    update: Object.assign(update, update),
    destroy: Object.assign(destroy, destroy),
}

export default currencyTax