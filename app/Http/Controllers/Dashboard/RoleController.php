<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

final class RoleController extends Controller
{
    public function index()
    {
        return Inertia::render('roles/index', [
            'permissions' => Permission::all(),
            'roles' => Role::with('permissions')
                ->withCount('users')
                ->where('name', '!=', 'admin')
                ->where('name', '!=', 'delivery-boy')
                ->where('name', '!=', 'branch-admin')
                ->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('roles/add', [
            'permissions' => Permission::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles,name',
            'description' => 'nullable|string|max:500',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            // Create the role
            $role = Role::create([
                'name' => $request->name,
                'guard_name' => 'web',
            ]);

            if ($request->has('permissions') && is_array($request->permissions)) {
                $permissions = Permission::whereIn('id', $request->permissions)->get();
                $role->syncPermissions($permissions);
            }

            return redirect()->route('roles.index')->with('success', 'Role created successfully!');
        } catch (Exception $e) {
            return back()->withErrors(['error' => 'Failed to create role: '.$e->getMessage()])->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Role $role)
    {
        return inertia('roles/index', [
            'role' => $role->load('permissions', 'users'),
            'permissions' => Permission::all(),
        ]);
    }

    public function edit(Role $role)
    {

        return Inertia::render('roles/edit', [
            'role' => $role->load('permissions'),
            'permissions' => Permission::all(),
        ]);
    }

    public function update(Request $request, Role $role)
    {
        Log::info('Store Request Data:', $request->all());
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255|unique:roles,name,'.$role->id,
            'description' => 'nullable|string|max:500',
            'permissions' => 'nullable|array',
            'permissions.*' => 'exists:permissions,id',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            $role->update([
                'name' => $request->name,
            ]);

            if ($request->has('permissions') && is_array($request->permissions)) {
                $permissions = Permission::whereIn('id', $request->permissions)->get();
                $role->syncPermissions($permissions);
            } else {
                $role->syncPermissions([]);
            }

            return redirect()->route('roles.index')->with('success', 'Role updated successfully!');
        } catch (Exception $e) {
            return back()->withErrors(['error' => 'Failed to update role: '.$e->getMessage()])->withInput();
        }
    }

    public function search(Request $request)
    {
        $query = $request->get('q', '');

        $roles = Role::when($query, function ($q) use ($query) {
            return $q->where('name', 'like', '%'.$query.'%');
        })
            ->where('name', '!=', 'admin')
            ->where('name', '!=', 'delivery-boy')
            ->select('id', 'name')
            ->limit(10)
            ->get();

        return response()->json($roles);
    }

    public function destroy(Role $role)
    {
        try {
            if ($role->users()->count() > 0) {
                return back()->withErrors(['error' => 'Cannot delete role that is assigned to users.']);
            }

            $role->syncPermissions([]);

            $role->delete();

            return redirect()->route('roles.index')->with('success', 'Role deleted successfully!');
        } catch (Exception $e) {
            return back()->withErrors(['error' => 'Failed to delete role: '.$e->getMessage()]);
        }
    }
}
