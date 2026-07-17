import {
  format,
  startOfMonth,
  startOfToday,
  startOfWeek,
  startOfYesterday,
  subDays,
} from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useId } from "react";
import { type Path, useController, useFormContext } from "react-hook-form";
import InputError from "@/components/dashboard/input-error";
import { Button } from "@/components/shadcn/ui/button";
import { Calendar } from "@/components/shadcn/ui/calendar";
import { Label } from "@/components/shadcn/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/ui/popover";
import { cn } from "@/lib/utils";
import { useZodSchema } from "@/provider/ZodSchemaProvider";
import { getFormError, getFormRequired } from "../utils";

type TXFormDatePicker<T> = {
  label?: string;
  name: keyof T;
  wrapperClassName?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  mode?: "single" | "range";
};

export function XFormDatePicker<T extends Record<string, unknown>>({
  label,
  name,
  wrapperClassName,
  placeholder,
  className,
  disabled = false,
  mode = "single",
}: TXFormDatePicker<T>) {
  const defaultPlaceholder =
    mode === "range" ? "Pick a date range" : "Pick a date";
  const finalPlaceholder = placeholder || defaultPlaceholder;
  const {
    formState: { errors },
  } = useFormContext<T>();

  const { field } = useController({
    name: name as Path<T>,
  });

  const id = useId();
  const schema = useZodSchema();

  const errorMessage = getFormError(errors, name);
  const isRequired = getFormRequired(schema, name);

  const formatDateDisplay = (
    value: Date | { from: Date; to: Date } | undefined
  ) => {
    if (mode === "range") {
      if (
        value &&
        typeof value === "object" &&
        "from" in value &&
        "to" in value
      ) {
        return `${format(value.from, "LLL dd, y")} - ${format(value.to, "LLL dd, y")}`;
      }
      if (value && typeof value === "object" && "from" in value) {
        return `${format(value.from as Date, "LLL dd, y")} - Select end date`;
      }
      return finalPlaceholder;
    }
    return value ? format(value as Date, "PPP") : finalPlaceholder;
  };

  const handleQuickSelect = (date: Date | { from: Date; to: Date }) => {
    field.onChange(date);
  };

  return (
    <div className={cn("col-span-full md:col-span-1", wrapperClassName)}>
      {label && (
        <Label className="mb-2">
          {label}
          {isRequired ? (
            <span className="text-red-500">*</span>
          ) : (
            <span className="text-muted-foreground/50">(Optional)</span>
          )}
        </Label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              "mt-1 w-full min-w-[230px] justify-start text-left font-normal",
              !field.value && "text-muted-foreground",
              errorMessage && "border-red-500 focus:border-red-500",
              className
            )}
            disabled={disabled}
            id={id}
            variant="outline"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateDisplay(field.value)}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <div className="flex">
            <div className="flex flex-col gap-1 border-r p-3">
              {mode === "single" ? (
                <>
                  <Button
                    className="h-8 justify-start px-2 text-xs"
                    onClick={() => handleQuickSelect(startOfToday())}
                    size="sm"
                    variant="ghost"
                  >
                    Today
                  </Button>
                  <Button
                    className="h-8 justify-start px-2 text-xs"
                    onClick={() => handleQuickSelect(startOfYesterday())}
                    size="sm"
                    variant="ghost"
                  >
                    Yesterday
                  </Button>
                  <Button
                    className="h-8 justify-start px-2 text-xs"
                    onClick={() => handleQuickSelect(startOfWeek(new Date()))}
                    size="sm"
                    variant="ghost"
                  >
                    This Week
                  </Button>
                  <Button
                    className="h-8 justify-start px-2 text-xs"
                    onClick={() => handleQuickSelect(startOfMonth(new Date()))}
                    size="sm"
                    variant="ghost"
                  >
                    This Month
                  </Button>
                  <Button
                    className="h-8 justify-start px-2 text-xs"
                    onClick={() => handleQuickSelect(subDays(new Date(), 7))}
                    size="sm"
                    variant="ghost"
                  >
                    7 Days Ago
                  </Button>
                  <Button
                    className="h-8 justify-start px-2 text-xs"
                    onClick={() => handleQuickSelect(subDays(new Date(), 30))}
                    size="sm"
                    variant="ghost"
                  >
                    30 Days Ago
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="h-8 justify-start px-2 text-xs"
                    onClick={() =>
                      handleQuickSelect({
                        from: startOfToday(),
                        to: new Date(),
                      })
                    }
                    size="sm"
                    variant="ghost"
                  >
                    Today
                  </Button>
                  <Button
                    className="h-8 justify-start px-2 text-xs"
                    onClick={() =>
                      handleQuickSelect({
                        from: startOfYesterday(),
                        to: startOfToday(),
                      })
                    }
                    size="sm"
                    variant="ghost"
                  >
                    Yesterday
                  </Button>
                  <Button
                    className="h-8 justify-start px-2 text-xs"
                    onClick={() =>
                      handleQuickSelect({
                        from: startOfWeek(new Date()),
                        to: new Date(),
                      })
                    }
                    size="sm"
                    variant="ghost"
                  >
                    This Week
                  </Button>
                  <Button
                    className="h-8 justify-start px-2 text-xs"
                    onClick={() =>
                      handleQuickSelect({
                        from: startOfMonth(new Date()),
                        to: new Date(),
                      })
                    }
                    size="sm"
                    variant="ghost"
                  >
                    This Month
                  </Button>
                  <Button
                    className="h-8 justify-start px-2 text-xs"
                    onClick={() =>
                      handleQuickSelect({
                        from: subDays(new Date(), 7),
                        to: new Date(),
                      })
                    }
                    size="sm"
                    variant="ghost"
                  >
                    Last 7 Days
                  </Button>
                  <Button
                    className="h-8 justify-start px-2 text-xs"
                    onClick={() =>
                      handleQuickSelect({
                        from: subDays(new Date(), 30),
                        to: new Date(),
                      })
                    }
                    size="sm"
                    variant="ghost"
                  >
                    Last 30 Days
                  </Button>
                </>
              )}
            </div>
            {mode === "single" ? (
              <Calendar
                autoFocus
                captionLayout="dropdown"
                disabled={disabled}
                mode="single"
                onSelect={(date) => field.onChange(date)}
                selected={field.value}
              />
            ) : (
              <Calendar
                autoFocus
                captionLayout="dropdown"
                disabled={disabled}
                mode="range"
                numberOfMonths={2}
                onSelect={(date) => field.onChange(date)}
                selected={field.value}
              />
            )}
          </div>
        </PopoverContent>
      </Popover>
      <InputError className="mt-1" message={errorMessage} />
    </div>
  );
}
