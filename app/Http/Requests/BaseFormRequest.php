<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/**
 * @mixin \Illuminate\Http\Request
 *
 * @method User|null user(string|null $guard = null)
 * @method string ip()
 * @method Stringable string(string $key, mixed $default = null)
 * @method int|float|mixed integer(string $key, mixed $default = null)
 * @method bool boolean(string $key)
 * @method mixed input(string $key = null, mixed $default = null)
 * @method array only(array|string $keys)
 * @method bool has(string $key)
 * @method bool filled(string $key)
 * @method bool missing(string $key)
 * @method string path()
 * @method string url()
 * @method string fullUrl()
 * @method string method()
 * @method bool isMethod(string $method)
 * @method mixed query(string $key = null, mixed $default = null)
 */
abstract class BaseFormRequest extends FormRequest {}
