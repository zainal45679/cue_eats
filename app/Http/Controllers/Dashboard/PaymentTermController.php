<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Enums\EntityEnum;
use App\Helpers\GateHelper;
use App\Helpers\TableHelper;
use App\Http\Controllers\Controller;
use App\Models\PaymentTerm;
use Illuminate\Http\Request;
use Inertia\Inertia;

final class PaymentTermController extends Controller
{
    public function index()
    {
        GateHelper::read(EntityEnum::PaymentTerms);

        $data = TableHelper::query(PaymentTerm::query())
            ->searchColumns(['name'])
            ->get();

        return Inertia::render('supply-chain/payment-terms/index', [
            'paymentTerms' => $data,
        ]);
    }

    public function create()
    {
        GateHelper::create(EntityEnum::PaymentTerms);

        return Inertia::render('supply-chain/payment-terms/add');
    }

    public function store(Request $request)
    {
        GateHelper::create(EntityEnum::PaymentTerms);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'credit_days' => 'required|integer|min:0',
            'advance_percentage' => 'required|numeric|min:0|max:100',
            'status' => 'boolean',
        ]);

        PaymentTerm::create($validated);

        return redirect()->route('payment-terms.index')
            ->with('success', 'Payment term created successfully.');
    }

    public function edit(string $uuid)
    {
        GateHelper::update(EntityEnum::PaymentTerms);

        $paymentTerm = PaymentTerm::where('uuid', $uuid)->firstOrFail();

        return Inertia::render('supply-chain/payment-terms/edit', [
            'paymentTerm' => $paymentTerm,
        ]);
    }

    public function update(Request $request, string $uuid)
    {
        GateHelper::update(EntityEnum::PaymentTerms);

        $paymentTerm = PaymentTerm::where('uuid', $uuid)->firstOrFail();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'credit_days' => 'required|integer|min:0',
            'advance_percentage' => 'required|numeric|min:0|max:100',
            'status' => 'boolean',
        ]);

        $paymentTerm->update($validated);

        return redirect()->route('payment-terms.index')
            ->with('success', 'Payment term updated successfully.');
    }

    public function destroy(string $uuid)
    {
        GateHelper::delete(EntityEnum::PaymentTerms);

        $paymentTerm = PaymentTerm::where('uuid', $uuid)->firstOrFail();
        $paymentTerm->delete();

        return redirect()->route('payment-terms.index')
            ->with('success', 'Payment term deleted successfully.');
    }

    public function search(Request $request)
    {
        $query = PaymentTerm::where('status', true);

        if ($request->has('q') && ! empty($request->q)) {
            $query->where('name', 'like', '%' . $request->q . '%');
        }

        return response()->json($query->limit(50)->get(['id', 'name', 'credit_days', 'advance_percentage']));
    }
}
