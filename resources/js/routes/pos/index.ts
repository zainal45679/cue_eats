import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Dashboard\PosController::terminal
* @see app/Http/Controllers/Dashboard/PosController.php:17
* @route '/menu-pos/terminal'
*/
export const terminal = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: terminal.url(options),
    method: 'get',
})

terminal.definition = {
    methods: ["get","head"],
    url: '/menu-pos/terminal',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Dashboard\PosController::terminal
* @see app/Http/Controllers/Dashboard/PosController.php:17
* @route '/menu-pos/terminal'
*/
terminal.url = (options?: RouteQueryOptions) => {
    return terminal.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\PosController::terminal
* @see app/Http/Controllers/Dashboard/PosController.php:17
* @route '/menu-pos/terminal'
*/
terminal.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: terminal.url(options),
    method: 'get',
})

/**
* @see \App\Http\Controllers\Dashboard\PosController::terminal
* @see app/Http/Controllers/Dashboard/PosController.php:17
* @route '/menu-pos/terminal'
*/
terminal.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: terminal.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Dashboard\PosController::checkout
* @see app/Http/Controllers/Dashboard/PosController.php:26
* @route '/menu-pos/terminal/checkout'
*/
export const checkout = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkout.url(options),
    method: 'post',
})

checkout.definition = {
    methods: ["post"],
    url: '/menu-pos/terminal/checkout',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Dashboard\PosController::checkout
* @see app/Http/Controllers/Dashboard/PosController.php:26
* @route '/menu-pos/terminal/checkout'
*/
checkout.url = (options?: RouteQueryOptions) => {
    return checkout.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Dashboard\PosController::checkout
* @see app/Http/Controllers/Dashboard/PosController.php:26
* @route '/menu-pos/terminal/checkout'
*/
checkout.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: checkout.url(options),
    method: 'post',
})

const pos = {
    terminal: Object.assign(terminal, terminal),
    checkout: Object.assign(checkout, checkout),
}

export default pos