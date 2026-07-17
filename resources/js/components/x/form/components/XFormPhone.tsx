import { Check, ChevronsUpDown } from "lucide-react";
import React, { useId } from "react";
import { type Path, type PathValue, useFormContext } from "react-hook-form";
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
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/shadcn/ui/popover";
import { cn } from "@/lib/utils";
import { useZodSchema } from "@/provider/ZodSchemaProvider";
import { getFormError, getFormRealName, getFormRequired } from "../utils";

type XFormPhoneProps<T> = {
  namePhoneCode: keyof T;
  namePhoneNumber: keyof T;
  label?: string;
  wrapperClassName?: string;
  phoneCodeClassName?: string;
  phoneNumberClassName?: string;
  phoneNumberPlaceholder?: string;
  disabled?: boolean;
};

const phoneCodes = [
  { code: "+91", country: "IN" },
  { code: "+1", country: "US/CA" },
  { code: "+44", country: "UK" },
  { code: "+33", country: "FR" },
  { code: "+49", country: "DE" },
  { code: "+86", country: "CN" },
  { code: "+81", country: "JP" },
  { code: "+61", country: "AU" },
  { code: "+55", country: "BR" },
  { code: "+7", country: "RU" },
  { code: "+971", country: "AE" },
  { code: "+966", country: "SA" },
  { code: "+20", country: "EG" },
  { code: "+27", country: "ZA" },
];

export function XFormPhone<T extends Record<string, unknown>>({
  namePhoneCode,
  namePhoneNumber,
  label,
  wrapperClassName,
  phoneCodeClassName,
  phoneNumberClassName,
  phoneNumberPlaceholder,
  disabled = false,
}: XFormPhoneProps<T>) {
  const [open, setOpen] = React.useState(false);

  const {
    register,
    setValue,
    clearErrors,
    watch,
    formState: { errors },
  } = useFormContext<T>();
  const phoneCodeValue = watch(namePhoneCode as Path<T>);
  const schema = useZodSchema();

  const idPhoneCode = useId();
  const idPhoneNumber = useId();

  const errorMessagePhoneNumber = getFormError(errors, namePhoneNumber);
  const isRequiredPhoneNumber = getFormRequired(schema, namePhoneNumber);

  const errorMessagePhoneCode = getFormError(errors, namePhoneCode);

  return (
    <div className={cn("col-span-full md:col-span-1", wrapperClassName)}>
      {label && (
        <Label className="mb-2" htmlFor={idPhoneNumber}>
          {label}
          {isRequiredPhoneNumber ? (
            <span className="text-red-500">*</span>
          ) : (
            <span className="text-muted-foreground/50">(Optional)</span>
          )}
        </Label>
      )}
      <div className="mt-1 grid grid-cols-4 gap-2">
        <div className="col-span-1">
          <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger asChild>
              <Button
                aria-expanded={open}
                className={cn(
                  "col-span-1 w-full justify-between",
                  phoneCodeClassName,
                  !phoneCodeValue && "text-muted-foreground",
                  errorMessagePhoneCode &&
                    "!focus:border-red-500 border-red-500!"
                )}
                disabled={disabled}
                id={idPhoneCode}
                role="combobox"
                variant="outline"
              >
                {phoneCodeValue
                  ? phoneCodes.find((code) => code.code === phoneCodeValue)
                      ?.code +
                    " (" +
                    phoneCodes.find((code) => code.code === phoneCodeValue)
                      ?.country +
                    ")"
                  : "Code"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search phone codes..." />
                <CommandEmpty>No phone code found.</CommandEmpty>
                <CommandGroup>
                  <CommandList>
                    {phoneCodes.map((item) => (
                      <CommandItem
                        className="cursor-pointer"
                        key={item.code}
                        onSelect={() => {
                          setValue(
                            namePhoneCode as Path<T>,
                            item.code as PathValue<T, Path<T>>
                          );
                          clearErrors(namePhoneCode as Path<T>);
                          setOpen(false);
                        }}
                        value={`${item.code} ${item.country}`}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            phoneCodeValue === item.code
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {item.code} ({item.country})
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        <div className="col-span-3">
          <Input
            className={cn(
              "w-full",
              errorMessagePhoneNumber && "border-red-500 focus:border-red-500",
              phoneNumberClassName
            )}
            disabled={disabled}
            id={idPhoneNumber}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder={
              phoneNumberPlaceholder ??
              "Enter " +
                (label ?? getFormRealName(namePhoneNumber))
                  .toString()
                  .toLowerCase()
            }
            type="number"
            {...register(namePhoneNumber as Path<T>)}
          />
        </div>
      </div>
      <InputError
        className="mt-1"
        message={errorMessagePhoneCode ?? errorMessagePhoneNumber}
      />
    </div>
  );
}
