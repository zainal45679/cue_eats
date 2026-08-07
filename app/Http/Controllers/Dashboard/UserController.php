<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Helpers\TableHelper;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use App\Models\Role;

final class UserController extends Controller
{
    public function index()
    {
        $query = User::query()->with(['businessLocation', 'creator'])
            ->whereDoesntHave('roles', function ($query): void {
                $query->whereIn('name', ['admin']);
            });
            
        // Multi-tenancy is handled by TenantScope globally

        return Inertia::render('users/index', [
            'users' => TableHelper::query($query)
                ->searchColumns(['name', 'email'])
                ->transform(fn ($user): array => [
                    ...$user->toArray(),
                    'status' => $user->status ? 'Active' : 'Inactive',
                ])
                ->get(),
        ]);
    }

    public function create()
    {
        $businessLocations = \App\Models\BusinessLocation::where('status', true)->get(['id', 'location_name']);
        
        return inertia('users/add', [
            'businessLocations' => $businessLocations,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|exists:roles,name',
            'business_location_id' => 'nullable|exists:business_locations,id',
        ]);

        $locationId = $request->business_location_id;
        
        // Multi-tenancy override
        if (! auth()->user()->hasRole('admin')) {
            $locationId = auth()->user()->business_location_id;
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'business_location_id' => $locationId,
            'status' => $request->boolean('status') ? 1 : 0,
            'created_by' => auth()->id(),
        ]);

        $user->assignRole($request->role);

        return redirect()->route('users.index')->with('success', 'User created and role assigned!');
    }

    public function show($uuid)
    {
        $user = User::with(['roles', 'businessLocation'])->findByUuid($uuid);
        
        // Multi-tenancy handled by global scope

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

        // Multi-tenancy handled by global scope

        $roleName = $user->roles->first()?->name ?? null;
        
        // Only fetch roles the user is allowed to assign (could be filtered further, but keeping simple)
        $roles = Role::all();
        $businessLocations = \App\Models\BusinessLocation::where('status', true)->get(['id', 'location_name']);

        return Inertia::render('users/edit', [
            'user' => [
                ...$user->toArray(),
                'role' => $roleName,
            ],
            'roles' => $roles,
            'businessLocations' => $businessLocations,
        ]);
    }

    public function update(Request $request, $uuid)
    {
        $user = User::findByUuid($uuid);
        
        // Multi-tenancy handled by global scope

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$user->id,
            'password' => 'nullable|string|min:6',
            'role' => 'required|exists:roles,name',
            'business_location_id' => 'nullable|exists:business_locations,id',
            'status' => 'boolean',
        ]);

        $locationId = $request->business_location_id;
        
        // Multi-tenancy override
        if (! auth()->user()->hasRole('admin')) {
            $locationId = auth()->user()->business_location_id;
        }

        $user->name = $request->name;
        $user->email = $request->email;
        $user->business_location_id = $locationId;
        $user->status = $request->boolean('status') ? 1 : 0;

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
        
        // Multi-tenancy handled by global scope
        
        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted!');
    }

    public function search(Request $request)
    {
        $query = User::query()
            ->whereDoesntHave('roles', function ($query): void {
                $query->whereIn('name', ['delivery-boy', 'branch-admin']);
            });
        // Multi-tenancy handled by global scope

        if ($request->has('q') && ! empty($request->q)) {
            $query->where(function ($q) use ($request): void {
                $q->where('name', 'like', '%'.$request->q.'%')
                    ->orWhere('email', 'like', '%'.$request->q.'%');
            });
        }
        $users = $query->limit(50)->get(['id', 'name', 'email']);

        return response()->json($users);
    }
}
