<?php

declare(strict_types=1);

namespace App\Helpers;

use Closure;
use Exception;
use Illuminate\Support\Str;

final class TableHelper
{
    private $query;

    private array $select = [];

    private array $searchColumns = [];

    private array $customFilters = [];

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

    public function addCustomFilter(string $column, Closure $callback): self
    {
        $this->customFilters[$column] = $callback;

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
                $column = $f['id'];

                if (isset($this->customFilters[$column])) {
                    $this->customFilters[$column]($this->query, $value);
                    continue;
                }

                $applyCondition = function($query, $col) use ($value) {
                    if (is_array($value)) {
                        if ($value !== []) {
                            // Check if it's a date range filter (array of 2 items, string dates or timestamps)
                            $isDateRange = false;
                            $start = null;
                            $end = null;
                            
                            if (count($value) === 2) {
                                // Support YYYY-MM-DD strings
                                if ((isset($value[0]) && preg_match('/^\d{4}-\d{2}-\d{2}/', (string)$value[0])) || 
                                    (isset($value[1]) && preg_match('/^\d{4}-\d{2}-\d{2}/', (string)$value[1]))) {
                                    $isDateRange = true;
                                    $start = isset($value[0]) && $value[0] ? substr((string)$value[0], 0, 10) . ' 00:00:00' : null;
                                    $end = isset($value[1]) && $value[1] ? substr((string)$value[1], 0, 10) . ' 23:59:59' : null;
                                } 
                                // Support JS Timestamps
                                else if ((isset($value[0]) && is_numeric($value[0]) && $value[0] > 100000000000) ||
                                         (isset($value[1]) && is_numeric($value[1]) && $value[1] > 100000000000)) {
                                    $isDateRange = true;
                                    $start = isset($value[0]) && is_numeric($value[0]) ? date('Y-m-d H:i:s', intval($value[0] / 1000)) : null;
                                    $end = isset($value[1]) && is_numeric($value[1]) ? date('Y-m-d 23:59:59', intval($value[1] / 1000)) : null;
                                }
                            }

                            if ($isDateRange) {
                                if ($start && $end) {
                                    $query->whereBetween($col, [$start, $end]);
                                } elseif ($start) {
                                    $query->where($col, '>=', $start);
                                } elseif ($end) {
                                    $query->where($col, '<=', $end);
                                }
                            } else {
                                $query->whereIn($col, $value);
                            }
                        }
                    } elseif (is_numeric($value)) {
                        $query->where($col, '=', (int) $value);
                    } else {
                        $query->where($col, 'like', '%'.$value.'%');
                    }
                };

                if (str_contains($column, '.')) {
                    $parts = explode('.', $column);
                    $relationColumn = array_pop($parts);
                    $relationName = collect($parts)->map(fn($part) => Str::camel($part))->implode('.');

                    $this->query->whereHas($relationName, function ($q) use ($relationColumn, $applyCondition) {
                        $applyCondition($q, $relationColumn);
                    });
                } else {
                    $applyCondition($this->query, $column);
                }
            }
        }

        $direction = $sortDesc ? 'desc' : 'asc';
        if (!str_contains($sortBy, '.')) {
            $this->query->orderBy($sortBy, $direction);
        }

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
