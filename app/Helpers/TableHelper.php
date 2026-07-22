<?php

declare(strict_types=1);

namespace App\Helpers;

use Closure;
use Exception;

final class TableHelper
{
    private $query;

    private array $select = [];

    private array $searchColumns = [];

    private ?Closure $transform = null;

    public static function query($query): self
    {
        $instance = new self();
        $instance->query = $query;

        return $instance;
    }

    public function select(array $select): self
    {
        $this->select = $select;

        return $this;
    }

    public function searchColumns(array $columns): self
    {
        $this->searchColumns = $columns;

        return $this;
    }

    public function transform(Closure $callback): self
    {
        $this->transform = $callback;

        return $this;
    }

    public function get(): array
    {
        $perPage = request()->input('perPage', 10);
        $page = request()->input('page', 1);
        $sortBy = request()->input('sortBy', 'id');
        $sortDesc = request()->boolean('sortDesc', true);
        $filtersJson = request()->input('filters');
        $search = request()->input('search');
        $filters = [];

        if ($this->select !== []) {
            $this->query->select($this->select);
        }

        if ($filtersJson) {
            try {
                $parsedFilters = json_decode((string) $filtersJson, true);
                if (is_array($parsedFilters)) {
                    $filters = $parsedFilters;
                }
            } catch (Exception) {
                $filters = [];
            }
        }

        // Apply global search if provided
        if ($search && mb_trim((string) $search) !== '' && $this->searchColumns !== []) {
            $searchTerm = mb_trim((string) $search);
            $this->query->where(function ($q) use ($searchTerm): void {
                foreach ($this->searchColumns as $column) {
                    $q->orWhere($column, 'like', '%'.$searchTerm.'%');
                }
            });
        }

        foreach ($filters as $f) {
            // format: filters => [ [id => 'name', value => 'john'], ... ]
            if (isset($f['id'], $f['value']) && $f['value'] !== null && $f['value'] !== '') {
                $value = $f['value'];

                // Handle array values (for multi-select) or string values
                if (is_array($value)) {
                    if ($value !== []) {
                        $this->query->whereIn($f['id'], $value);
                    }
                } elseif (is_numeric($value)) {
                    // Handle numeric values with exact match
                    $this->query->where($f['id'], '=', (int) $value);
                } else {
                    $this->query->where($f['id'], 'like', '%'.$value.'%');
                }
            }
        }

        $direction = $sortDesc ? 'desc' : 'asc';
        $this->query->orderBy($sortBy, $direction);

        $pageData = $this->query->paginate($perPage, ['*'], 'page', $page);

        $rows = $this->transform instanceof Closure ? $pageData->transform($this->transform) : $pageData->items();

        return [
            'rows' => $rows,
            'meta' => [
                'currentPage' => $pageData->currentPage(),
                'perPage' => $pageData->perPage(),
                'lastPage' => $pageData->lastPage(),
                'total' => $pageData->total(),
            ],
            'filters' => collect($filters)
                ->map(fn (array $f): array => [
                    'id' => $f['id'],
                    'value' => $f['value'],
                ])->all(),
            'sortBy' => $sortBy,
            'sortDesc' => $sortDesc,
            'search' => $search,
        ];
    }
}
