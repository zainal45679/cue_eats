import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { useDebounce } from "use-debounce";

import InputError from "@/components/dashboard/input-error";
import { Button } from "@/components/shadcn/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/shadcn/ui/command";
import { Label } from "@/components/shadcn/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/ui/popover";
import { cn } from "@/lib/utils";

export interface DropdownOption<T = string | number> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface SearchableDropdownProps<T = string | number> {
  label?: string;
  value: T;
  onChange: (value: T) => void;
  onSearch?: (query: string) => Promise<DropdownOption<T>[]>;
  options?: DropdownOption<T>[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  wrapperClassName?: string;
  errorClassName?: string;
}

export function XSearchableDropdown<T = string | number>({
  label,
  value,
  onChange,
  onSearch,
  options = [],
  placeholder = "Select option...",
  searchPlaceholder = "Search options...",
  emptyMessage = "No items found.",
  required = false,
  disabled = false,
  error,
  className,
  wrapperClassName = "col-span-1",
  errorClassName,
}: SearchableDropdownProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [searchResults, setSearchResults] = React.useState<DropdownOption<T>[]>(
    []
  );
  const [loading, setLoading] = React.useState(false);

  // Load all options when dropdown opens
  React.useEffect(() => {
    if (open && onSearch) {
      setLoading(true);
      onSearch("") // Always call with empty string to get all data
        .then((results) => {
          setSearchResults(results);
        })
        .catch((err) => {
          console.error("Failed to load options:", err);
          setSearchResults([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, onSearch]);

  // Load options when component mounts with a value (for edit mode)
  React.useEffect(() => {
    if (value && onSearch && searchResults.length === 0) {
      onSearch("")
        .then((results) => {
          setSearchResults(results);
        })
        .catch((err) => {
          console.error("Failed to load initial options:", err);
        });
    }
  }, [value, onSearch, searchResults.length]);

  // Search API call when user types
  React.useEffect(() => {
    if (debouncedSearch && onSearch && open) {
      setLoading(true);
      onSearch(debouncedSearch)
        .then((results) => {
          setSearchResults(results);
        })
        .catch((err) => {
          console.error("Search failed:", err);
          setSearchResults([]);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [debouncedSearch, onSearch, open]);

  // Display options:
  // - If using API search: show search results (all data by default, filtered when searching)
  // - If using static options: filter static options by search query
  const displayOptions = React.useMemo(() => {
    if (onSearch) {
      // Using API search - show all loaded results
      return searchResults;
    }

    // Using static options - filter by search query
    if (searchQuery) {
      return options.filter((option) =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return options;
  }, [onSearch, searchResults, searchQuery, options]);

  const getDisplayValue = React.useCallback(() => {
    if (!value) return placeholder;

    // Look in both static options and search results
    const allOptions = [...options, ...searchResults];
    const selectedOption = allOptions.find((option) => option.value == value); // Use == for loose comparison

    return selectedOption ? selectedOption.label : placeholder; // Return placeholder if not found instead of value
  }, [value, placeholder, options, searchResults]);

  const handleSelect = React.useCallback(
    (selectedValue: T) => {
      onChange?.(selectedValue === value ? ("" as T) : selectedValue);
      setOpen(false);
      setSearchQuery("");
    },
    [value, onChange]
  );

  const effectiveSearchPlaceholder = searchPlaceholder || placeholder;

  return (
    <div className={wrapperClassName}>
      {label && (
        <Label className="font-medium text-sm">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </Label>
      )}

      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className={cn(
              "mt-1 w-full justify-between",
              !value && "text-muted-foreground",
              error && "border-red-500 focus:border-red-500",
              className
            )}
            disabled={disabled}
            role="combobox"
            variant="outline"
          >
            {getDisplayValue()}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent align="start" className="w-full p-0">
          <Command shouldFilter={false}>
            <CommandInput
              onValueChange={setSearchQuery}
              placeholder={effectiveSearchPlaceholder}
              value={searchQuery}
            />
            <CommandList>
              {loading && (
                <div className="p-2 text-muted-foreground text-sm">
                  Loading...
                </div>
              )}

              <CommandEmpty>{emptyMessage}</CommandEmpty>

              <CommandGroup>
                {displayOptions.map((option) => (
                  <CommandItem
                    className="cursor-pointer"
                    key={option.value + ""}
                    onSelect={() => handleSelect(option.value)}
                    value={option.value + ""}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.value ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.icon && (
                      <span className="mr-2 flex-shrink-0">{option.icon}</span>
                    )}
                    <span className="flex-1">{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <InputError className={errorClassName} message={error} />
    </div>
  );
}
