import { Check, ChevronsUpDown } from "lucide-react";
import React, { useId } from "react";
import {
  type Path,
  type PathValue,
  useFormContext,
  useController,
} from "react-hook-form";
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
import { useZodSchema } from "@/provider/ZodSchemaProvider";
import { getFormError, getFormRealName, getFormRequired } from "../utils";

export type DropdownOption = {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  [key: string]: unknown;
};

type XFormSelectProps<T> = {
  name: keyof T;
  label?: string;
  onSearch?: {
    url?: string;
    // biome-ignore lint/suspicious/noExplicitAny: Will be addressed later
    transform?: (data: Record<string, any>) => DropdownOption;
  };
  options?: DropdownOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  wrapperClassName?: string;
  renderItem?: (option: DropdownOption) => React.ReactNode;
  onSelect?: (value: DropdownOption) => void;
  multiselect?: boolean;
};

function fetchOptions({
  url,
  query,
  transform,
}: {
  url: string;
  query: string;
  transform?: (data: Record<string, unknown>) => DropdownOption[];
}): Promise<DropdownOption[]> {
  try {
    const responseData = fetch(`${url}?query=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return responseData
      .then((response) => response.json())
      .then((data) => {
        if (transform) {
          return transform(data);
        }
        if (Array.isArray(data)) {
          return data as DropdownOption[];
        }
        return [];
      });
  } catch (error) {
    console.error("Error fetching options:", error);
    return Promise.resolve([]);
  }
}

export function XFormSelect<T extends Record<string, unknown>>({
  label,
  name,
  onSearch,
  options = [],
  placeholder,
  searchPlaceholder,
  emptyMessage = "No items found.",
  disabled = false,
  className,
  wrapperClassName,
  renderItem,
  onSelect,
  multiselect = false,
}: XFormSelectProps<T>) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [debouncedSearch] = useDebounce(searchQuery, 500);
  const [searchResults, setSearchResults] = React.useState<DropdownOption[]>(
    []
  );
  const [loading, setLoading] = React.useState(false);

  const {
    clearErrors,
    formState: { errors },
  } = useFormContext<T>();
  const { field } = useController({
    name: name as Path<T>,
  });
  const value = field.value;
  const setValue = field.onChange;

  const schema = useZodSchema();
  const id = useId();

  const errorMessage = getFormError(errors, name);
  const isRequired = getFormRequired(schema, name);

  placeholder =
    placeholder ??
    `Select ${(label ?? getFormRealName(name)).toString().toLowerCase()}`;

  // Load all options when dropdown opens
  React.useEffect(() => {
    if (open && onSearch) {
      setLoading(true);
      fetchOptions({
        query: "",
        url: onSearch.url || "",
        transform: onSearch.transform,
      })
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

  // // Load options when component mounts with a value (for edit mode)
  // React.useEffect(() => {
  //   if (onSearch && searchResults.length === 0) {
  //     onSearch("")
  //       .then((results) => {
  //         setSearchResults(results);
  //       })
  //       .catch((err) => {
  //         console.error("Failed to load initial options:", err);
  //       });
  //   }
  // }, [onSearch, searchResults.length]);

  // Search API call when user types
  React.useEffect(() => {
    if (debouncedSearch && onSearch && open) {
      setLoading(true);
      fetchOptions({
        query: debouncedSearch,
        url: onSearch.url || "",
        transform: onSearch.transform,
      })
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
    if (multiselect) {
      const current = Array.isArray(value) ? value : [];
      if (current.length === 0) {
        return placeholder;
      }
      const allOptions = [...options, ...searchResults];
      const selectedLabels = current
        .map((v) => {
          const opt = allOptions.find((o) => o.value == v);
          return opt?.label;
        })
        .filter(Boolean);
      return selectedLabels.length > 0
        ? selectedLabels.join(", ")
        : placeholder;
    }
    if (!value) {
      return placeholder;
    }
    // Look in both static options and search results
    const allOptions = [...options, ...searchResults];
    const selectedOption = allOptions.find((option) => option.value == value); // Use == for loose comparison
    return selectedOption ? selectedOption.label : placeholder; // Return placeholder if not found instead of value
  }, [multiselect, value, placeholder, options, searchResults]);

  const handleSelect = React.useCallback(
    (selectedValue: string | number) => {
      if (multiselect) {
        const current = Array.isArray(value) ? value : [];
        const newValue = (current as (string | number)[]).includes(
          selectedValue
        )
          ? current.filter((v) => v !== selectedValue)
          : [...current, selectedValue];
        setValue(newValue as PathValue<T, Path<T>>);
        clearErrors(name as Path<T>);
      } else {
        setValue(selectedValue as PathValue<T, Path<T>>);
        clearErrors(name as Path<T>);
        if (onSelect) {
          const selectedOption = displayOptions.find(
            (option) => option.value === selectedValue
          );
          if (selectedOption) {
            onSelect(selectedOption);
          }
        }
        setOpen(false);
        setSearchQuery("");
      }
    },
    [multiselect, value, setValue, name, clearErrors, onSelect, displayOptions]
  );

  const effectiveSearchPlaceholder = searchPlaceholder || placeholder;

  return (
    <div className={cn("col-span-full md:col-span-1", wrapperClassName)}>
      {label && (
        <Label className="mb-2 block" htmlFor={id}>
          {label}
          {isRequired ? (
            <span className="text-red-500">*</span>
          ) : (
            <span className="text-muted-foreground/50">(Optional)</span>
          )}
        </Label>
      )}

      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-expanded={open}
            className={cn(
              "w-full justify-between",
              !value && "text-muted-foreground",
              errorMessage && "!focus:border-red-500 border-red-500!",
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
                    key={`${option.value}`}
                    onSelect={() => handleSelect(option.value)}
                    value={`${option.value}`}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        (
                          multiselect
                            ? Array.isArray(value) &&
                              (value as (string | number)[]).includes(
                                option.value
                              )
                            : value === option.value
                        )
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {renderItem ? (
                      renderItem(option)
                    ) : (
                      <>
                        {option.icon && (
                          <span className="mr-2 shrink-0">{option.icon}</span>
                        )}
                        <span className="flex-1">{option.label}</span>
                      </>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <InputError className="mt-1" message={errorMessage} />
    </div>
  );
}
