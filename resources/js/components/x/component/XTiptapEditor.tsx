import { MinimalTiptap } from "@/components/shadcn/ui/shadcn-io/minimal-tiptap";

type CustomisedTiptapEditorProps = {
  label?: string;
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
};

export function XTiptapEditor({
  label,
  id,
  value,
  onChange,
  placeholder,
  required,
  error,
  className,
}: CustomisedTiptapEditorProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block font-medium text-sm" htmlFor={id}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <MinimalTiptap
        className="mt-1"
        content={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {error && <div className="mt-2 text-red-500 text-xs">{error}</div>}
    </div>
  );
}
