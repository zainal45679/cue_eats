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

export interface DropdownOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
}

interface MultiSearchableDropdownProps {
  label?: string;
  value: Array<string | number>;
  onChange: (value: Array<string | number>) => void;
  onSearch?: (query: string) => Promise<DropdownOption[]>;
  options?: DropdownOption[];
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

export function XMultiSearchableDropdown({
  label,
  value,
  onChange,
  onSearch,
  options = [],
  placeholder = "Select options...",
  searchPlaceholder = "Search options...",
  emptyMessage = "No options found.",
  required = false,
  disabled = false,
  error,
  className,
  wrapperClassName,
  errorClassName,
}: MultiSearchableDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [searchResults, setSearchResults] = React.useState<DropdownOption[]>(
    []
  );
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (open && onSearch) {
      setLoading(true);
      onSearch("")
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

  const displayOptions = React.useMemo(() => {
    if (onSearch) {
      return searchResults;
    }
    if (searchQuery) {
      return options.filter(
        (option) =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          option.value
            .toString()
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }
    return options;
  }, [onSearch, searchResults, searchQuery, options]);

  const getDisplayValue = React.useCallback(() => {
    if (!Array.isArray(value) || value.length === 0) return placeholder;
    const allOptions = [...options, ...searchResults];
    const selectedOptions = allOptions.filter(
      (option) => Array.isArray(value) && value.includes(option.value)
    );
    return selectedOptions.length > 0
      ? selectedOptions.map((option) => option.label).join(", ")
      : placeholder;
  }, [value, placeholder, options, searchResults]);

  const handleSelect = React.useCallback(
    (selectedValue: string | number) => {
      let newValue: Array<string | number> = Array.isArray(value)
        ? [...value]
        : [];
      if (newValue.includes(selectedValue)) {
        newValue = newValue.filter((v) => v !== selectedValue);
      } else {
        newValue.push(selectedValue);
      }
      onChange?.(newValue);
      setSearchQuery("");
    },
    [value, onChange]
  );

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
              (!value || (Array.isArray(value) && value.length === 0)) &&
                "text-muted-foreground",
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
              placeholder={searchPlaceholder}
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
                {displayOptions.map((option) => {
                  const isSelected =
                    Array.isArray(value) && value.includes(option.value);
                  return (
                    <CommandItem
                      className={cn(
                        "cursor-pointer",
                        isSelected && "bg-accent"
                      )}
                      key={option.value}
                      onSelect={() => handleSelect(option.value)}
                      value={option.value.toString()}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {option.icon && (
                        <span className="mr-2 flex-shrink-0">
                          {option.icon}
                        </span>
                      )}
                      <span className="flex-1">{option.label}</span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Show selected options as chips/tags for multiple
      {Array.isArray(value) && value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {displayOptions
            .filter((option) => value.includes(option.value))
            .map((option) => (
              <span
                key={option.value}
                className="inline-flex items-center rounded bg-accent px-2 py-1 text-xs font-medium text-accent-foreground"
              >
                {option.label}
                <button
                  type="button"
                  className="ml-1 text-xs text-muted-foreground hover:text-red-500"
                  onClick={() => handleSelect(option.value)}
                >
                  &times;
                </button>
              </span>
            ))}
        </div>
      )} */}

      <InputError className={errorClassName} message={error} />
    </div>
  );
}
