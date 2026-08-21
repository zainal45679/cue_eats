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

    private string $defaultSortColumn = 'id';

    private bool $defaultSortDesc = true;

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

    public function defaultSort(string $column, bool $desc = true): self
    {
        $this->defaultSortColumn = $column;
        $this->defaultSortDesc = $desc;

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
        $sortBy = request()->input('sortBy', $this->defaultSortColumn);
        $sortDesc = request()->has('sortDesc') ? request()->boolean('sortDesc') : $this->defaultSortDesc;
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
                foreach ($this->searchColumns as $index => $column) {
                    if (str_contains($column, '.')) {
                        $parts = explode('.', $column);
                        $relationColumn = array_pop($parts);
                        $relationName = collect($parts)->map(fn($part) => Str::camel($part))->implode('.');

                        if ($index === 0) {
                            $q->whereHas($relationName, function ($rq) use ($relationColumn, $searchTerm) {
                                $rq->where($relationColumn, 'like', '%'.$searchTerm.'%');
                            });
                        } else {
                            $q->orWhereHas($relationName, function ($rq) use ($relationColumn, $searchTerm) {
                                $rq->where($relationColumn, 'like', '%'.$searchTerm.'%');
                            });
                        }
                    } else {
                        if ($index === 0) {
                            $q->where($column, 'like', '%'.$searchTerm.'%');
                        } else {
                            $q->orWhere($column, 'like', '%'.$searchTerm.'%');
                        }
                    }
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
                    // Check if scalar string is a single date YYYY-MM-DD
                    if (is_string($value) && preg_match('/^\d{4}-\d{2}-\d{2}$/', trim($value))) {
                        $dateStr = trim($value);
                        $start = $dateStr . ' 00:00:00';
                        $nextDay = date('Y-m-d 00:00:00', strtotime($dateStr . ' +1 day'));
                        $query->where($col, '>=', $start)->where($col, '<', $nextDay);
                        return;
                    }

                    if (is_array($value)) {
                        if ($value !== []) {
                            // Check if it's a date filter or date range
                            $isDateFilter = false;
                            $start = null;
                            $nextDayEnd = null;

                            if (count($value) === 1 && isset($value[0]) && preg_match('/^\d{4}-\d{2}-\d{2}/', (string)$value[0])) {
                                $isDateFilter = true;
                                $dateStr = substr((string)$value[0], 0, 10);
                                $start = $dateStr . ' 00:00:00';
                                $nextDayEnd = date('Y-m-d 00:00:00', strtotime($dateStr . ' +1 day'));
                            } elseif (count($value) === 2) {
                                $d1 = isset($value[0]) ? substr((string)$value[0], 0, 10) : null;
                                $d2 = isset($value[1]) ? substr((string)$value[1], 0, 10) : null;

                                if (($d1 && preg_match('/^\d{4}-\d{2}-\d{2}$/', $d1)) || ($d2 && preg_match('/^\d{4}-\d{2}-\d{2}$/', $d2))) {
                                    $isDateFilter = true;
                                    $startDate = $d1 ?: $d2;
                                    $endDate = $d2 ?: $d1;

                                    $start = $startDate . ' 00:00:00';
                                    $nextDayEnd = date('Y-m-d 00:00:00', strtotime($endDate . ' +1 day'));
                                }
                            }

                            if ($isDateFilter) {
                                if ($start && $nextDayEnd) {
                                    $query->where($col, '>=', $start)->where($col, '<', $nextDayEnd);
                                } elseif ($start) {
                                    $query->where($col, '>=', $start);
                                } elseif ($nextDayEnd) {
                                    $query->where($col, '<', $nextDayEnd);
                                }
                            } else {
                                $query->whereIn($col, $value);
                            }
                        }
                    } else {
                        // Keep string values as strings (including numeric-looking strings like "1002" or UUIDs)
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
