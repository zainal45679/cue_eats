<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Helpers\TableHelper;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

final class UserController extends Controller
{
    public function index()
    {
        return Inertia::render('users/index', [
            'users' => TableHelper::query(User::query()
                ->whereDoesntHave('roles', function ($query) {
                    $query->whereIn('name', ['admin']);
                }))
                ->searchColumns(['name', 'email'])
                ->transform(function ($user) {
                    return [
                        ...$user->toArray(),
                        'status' => $user->status ? 'Active' : 'Inactive',
                    ];
                })
                ->get(),
        ]);
    }

    public function create()
    {
        return inertia('users/add', []);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|exists:roles,name',

        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),

        ]);

        $user->assignRole($request->role);

        return redirect()->route('users.index')->with('success', 'User created and role assigned!');
    }

    public function show($uuid)
    {
        $user = User::with('roles')->findByUuid($uuid);
        $roleName = $user->roles->first()?->name ?? null;

        return inertia('users/edit', [
            'user' => [
                ...$user->toArray(),
                'role' => $roleName,
            ],
        ]);
    }

    public function edit($uuid)
    {
        $user = User::with('roles')->where('uuid', $uuid)->firstOrFail();

        $roleName = $user->roles->first()?->name ?? null;
        $roles = Role::all();

        return Inertia::render('users/edit', [
            'user' => [
                ...$user->toArray(),
                'role' => $roleName,
            ],
            'roles' => $roles,
        ]);
    }

    public function update(Request $request, $uuid)
    {

        $user = User::findByUuid($uuid);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$user->id,
            'password' => 'nullable|string|min:6',
            'role' => 'required|exists:roles,name',

        ]);

        $user->name = $request->name;
        $user->email = $request->email;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }
        $user->save();

        $user->syncRoles([$request->role]);

        return redirect()->route('users.index')->with('success', 'User updated!');
    }

    public function destroy($uuid)
    {
        $user = User::findByUuid($uuid);
        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted!');
    }

    public function search(Request $request)
    {
        $query = User::query()
            ->whereDoesntHave('roles', function ($query) {
                $query->whereIn('name', ['delivery-boy', 'branch-admin']);
            });

        if ($request->has('q') && ! empty($request->q)) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->q.'%')
                    ->orWhere('email', 'like', '%'.$request->q.'%');
            });
        }
        $users = $query->limit(50)->get(['id', 'name', 'email']);

        return response()->json($users);
    }
}
