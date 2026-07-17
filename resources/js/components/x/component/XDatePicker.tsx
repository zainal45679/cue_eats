import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
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

interface CustomDatePickerProps {
  label?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  wrapperClassName?: string;
  error?: string;
  errorClassName?: string;
  required?: boolean;
}

export function XDatePicker({
  label,
  value,
  onChange,
  placeholder = "Pick a date",
  wrapperClassName = "col-span-1",
  error,
  errorClassName = "mt-2",
  required,
}: CustomDatePickerProps) {
  return (
    <div className={wrapperClassName}>
      {label && (
        <Label>
          {label}
          {required && <span className="text-destructive"> *</span>}
        </Label>
      )}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className={cn(
              "mt-1 w-full min-w-[230px] max-w-[400px] justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
            variant="outline"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PPP") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            className="w-[230px]"
            initialFocus
            mode="single"
            onSelect={onChange}
            selected={value}
          />
        </PopoverContent>
      </Popover>
      <InputError className={errorClassName} message={error} />
    </div>
  );
}
