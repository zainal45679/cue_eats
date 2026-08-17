import { queryParams, type RouteQueryOptions, type RouteDefinition } from './../../wayfinder'
/**
* @see \App\Http\Controllers\Settings\OrganizationController::edit
 * @see app/Http/Controllers/Settings/OrganizationController.php:16
 * @route '/settings/organization'
 */
export const edit = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})

edit.definition = {
    methods: ["get","head"],
    url: '/settings/organization',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Settings\OrganizationController::edit
 * @see app/Http/Controllers/Settings/OrganizationController.php:16
 * @route '/settings/organization'
 */
edit.url = (options?: RouteQueryOptions) => {
    return edit.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\OrganizationController::edit
 * @see app/Http/Controllers/Settings/OrganizationController.php:16
 * @route '/settings/organization'
 */
edit.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: edit.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Settings\OrganizationController::edit
 * @see app/Http/Controllers/Settings/OrganizationController.php:16
 * @route '/settings/organization'
 */
edit.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: edit.url(options),
    method: 'head',
})

/**
* @see \App\Http\Controllers\Settings\OrganizationController::update
 * @see app/Http/Controllers/Settings/OrganizationController.php:23
 * @route '/settings/organization'
 */
export const update = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})

update.definition = {
    methods: ["patch"],
    url: '/settings/organization',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Settings\OrganizationController::update
 * @see app/Http/Controllers/Settings/OrganizationController.php:23
 * @route '/settings/organization'
 */
update.url = (options?: RouteQueryOptions) => {
    return update.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Settings\OrganizationController::update
 * @see app/Http/Controllers/Settings/OrganizationController.php:23
 * @route '/settings/organization'
 */
update.patch = (options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: update.url(options),
    method: 'patch',
})
const organization = {
    edit: Object.assign(edit, edit),
update: Object.assign(update, update),
}

export default organization