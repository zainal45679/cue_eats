import { Check, ChevronsUpDown } from "lucide-react";
import * as React from "react";
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

interface CustomPhoneProps {
  label?: string;
  wrapperClassName?: string;
  inputClassName1?: string;
  inputClassName2?: string;
  errorClassName?: string;
  phoneCodeError?: string;
  phoneNumberError?: string;
  phoneCodeValue?: string;
  phoneNumberValue?: string;
  onPhoneCodeChange?: (value: string) => void;
  onPhoneNumberChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  phoneCodeId?: string;
  phoneNumberId?: string;
  phoneNumberPlaceholder?: string;
  phoneNumberRef?: React.Ref<HTMLInputElement>;
  required?: boolean;
}

const phoneCodes = [
  { code: "+1", country: "US/CA" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "IN" },
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

export function XPhone({
  label,
  wrapperClassName,
  inputClassName1 = "col-span-1 w-full",
  inputClassName2 = "w-full",
  errorClassName,
  phoneCodeError,
  phoneNumberError,
  phoneCodeValue,
  phoneNumberValue,
  onPhoneCodeChange,
  onPhoneNumberChange,
  phoneCodeId,
  phoneNumberId,
  phoneNumberPlaceholder = "Enter phone number...",
  phoneNumberRef,
  required = false,
}: CustomPhoneProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={wrapperClassName}>
      {label && (
        <Label>
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </Label>
      )}
      <div className="mt-2 grid grid-cols-4 gap-2">
        <div className="col-span-1">
          <Popover onOpenChange={setOpen} open={open}>
            <PopoverTrigger asChild>
              <Button
                aria-expanded={open}
                className={cn("w-full justify-between", inputClassName1)}
                id={phoneCodeId}
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
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search phone codes..." />
                <CommandEmpty>No phone code found.</CommandEmpty>
                <CommandGroup>
                  <CommandList>
                    {phoneCodes.map((item) => (
                      <CommandItem
                        key={item.code}
                        onSelect={() => {
                          onPhoneCodeChange?.(item.code);
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
            className={inputClassName2}
            id={phoneNumberId}
            onChange={onPhoneNumberChange}
            placeholder={phoneNumberPlaceholder}
            ref={phoneNumberRef}
            type="tel"
            value={phoneNumberValue}
          />
        </div>
      </div>
      <InputError
        className={errorClassName}
        message={phoneCodeError || phoneNumberError}
      />
    </div>
  );
}
