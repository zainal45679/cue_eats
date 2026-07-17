<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

final class RedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                // Redirect authenticated users to dashboard
                return redirect()->intended('/dashboard');

                // Or redirect based on user role:
                // $user = Auth::user();
                // if ($user->hasRole('admin')) {
                //     return redirect('/admin/dashboard');
                // }
                // return redirect('/dashboard');
            }
        }

        return $next($request);
    }
}
