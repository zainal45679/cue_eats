import { FileText, Image as ImageIcon, Video, X } from "lucide-react";
import type React from "react";
import InputError from "@/components/dashboard/input-error";
import { Button } from "@/components/shadcn/ui/button";
import { Label } from "@/components/shadcn/ui/label";

export enum FileType {
  IMAGE = "image",
  VIDEO = "video",
  PDF = "pdf",
}

const storageUrl = import.meta.env.VITE_STORAGE_URL;

type FileUploaderProps<T = File | string | (File | string)[] | null> = {
  value: T;
  onChange: (value: T) => void;
  fileType?: FileType;
  error?: string;
  label?: string;
  description?: string;
  required?: boolean;
  acceptTypes?: string;
  multiple?: boolean;
  maxFiles?: number;
  wrapperClassName?: string;
  errorClassName?: string;
};

const getFileConfig = (fileType: FileType) => {
  switch (fileType) {
    case FileType.IMAGE:
      return {
        accept: "image/*",
        icon: ImageIcon,
        defaultLabel: "Profile Image",
        defaultDescription: "PNG, JPG, GIF up to 5MB",
        uploadText: "Click to upload image",
      };
    case FileType.VIDEO:
      return {
        accept: "video/*",
        icon: Video,
        defaultLabel: "Profile Video",
        defaultDescription: "MP4, AVI, MOV up to 50MB",
        uploadText: "Click to upload video",
      };
    case FileType.PDF:
      return {
        accept: ".pdf",
        icon: FileText,
        defaultLabel: "PDF Document",
        defaultDescription: "PDF files up to 10MB",
        uploadText: "Click to upload PDF",
      };
    default:
      return {
        accept: "*/*",
        icon: FileText,
        defaultLabel: "File",
        defaultDescription: "Any file type",
        uploadText: "Click to upload file",
      };
  }
};

export function XFileUploader<T = File | string | (File | string)[] | null>({
  value,
  onChange,
  error,
  label,
  description,
  fileType = FileType.IMAGE,
  required = false,
  acceptTypes,
  multiple = false,
  maxFiles = 10,
  wrapperClassName,
  errorClassName,
}: FileUploaderProps<T>) {
  const config = getFileConfig(fileType);
  const Icon = config.icon;

  const finalLabel = label ?? config.defaultLabel;
  const finalDescription = description ?? config.defaultDescription;
  const finalAcceptTypes = acceptTypes ?? config.accept;

  const renderPreview = (file: File | string) => {
    if (typeof file === "string") {
      const fullUrl = file.startsWith("http") ? file : `${storageUrl}${file}`;
      if (fileType === FileType.IMAGE) {
        return (
          <div className="h-32 w-32 overflow-hidden rounded-lg border-2 border-border bg-muted">
            <img
              alt="Preview"
              className="h-full w-full object-cover"
              src={fullUrl}
            />
          </div>
        );
      }

      if (fileType === FileType.VIDEO) {
        return (
          <div className="relative h-32 w-32 overflow-hidden rounded-lg border-2 border-border bg-muted">
            <video
              className="h-full w-full object-cover"
              controls={false}
              src={fullUrl}
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20">
              <Video className="h-6 w-6 text-white" />
            </div>
          </div>
        );
      }

      return (
        <div className="flex h-32 w-32 items-center justify-center rounded-lg border-2 border-border bg-muted">
          <Icon className="h-12 w-12 text-muted-foreground" />
        </div>
      );
    }

    // Handle File objects (newly uploaded files)
    if (
      !file ||
      typeof file === "string" ||
      !(
        (typeof File !== "undefined" && file instanceof File) ||
        (typeof Blob !== "undefined" && file instanceof Blob)
      )
    ) {
      return (
        <div className="flex h-32 w-32 items-center justify-center rounded-lg border-2 border-border bg-muted">
          <Icon className="h-12 w-12 text-muted-foreground" />
        </div>
      );
    }

    if (fileType === FileType.IMAGE) {
      const imageUrl = URL.createObjectURL(file);
      return (
        <div className="h-32 w-32 overflow-hidden rounded-lg border-2 border-border bg-muted">
          <img
            alt="Preview"
            className="h-full w-full object-cover"
            onLoad={() => URL.revokeObjectURL(imageUrl)}
            src={imageUrl}
          />
        </div>
      );
    }

    if (fileType === FileType.VIDEO) {
      const videoUrl = URL.createObjectURL(file);
      return (
        <div className="relative h-32 w-32 overflow-hidden rounded-lg border-2 border-border bg-muted">
          <video
            className="h-full w-full object-cover"
            controls={false}
            onLoadedData={() => URL.revokeObjectURL(videoUrl)}
            src={videoUrl}
          />
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/20">
            <Video className="h-6 w-6 text-white" />
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-32 w-32 items-center justify-center rounded-lg border-2 border-border bg-muted">
        <Icon className="h-12 w-12 text-muted-foreground" />
      </div>
    );
  };

  const renderMultipleFiles = (
    files: (File | string)[],
    onFilesChange: (files: (File | string)[]) => void
  ) => (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {files.map((file, index) => {
        const fileName =
          typeof file === "string"
            ? file.split("/").pop() || "Unknown file"
            : file.name;
        const fileSize = typeof file === "string" ? null : file.size;

        return (
          <div className="group relative w-32" key={`${fileName}-${index}`}>
            {renderPreview(file)}
            <Button
              className="-top-1 -right-1 absolute mt-1 h-6 w-6 rounded-full p-0 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => {
                const newFiles = files.filter((_, i) => i !== index);
                onFilesChange(newFiles);
              }}
              size="sm"
              type="button"
              variant="outline"
            >
              <X className="h-3 w-3" />
            </Button>
            <div className="mt-1">
              <p className="truncate text-center text-foreground text-xs">
                {fileName}
              </p>
              {fileType === FileType.VIDEO && fileSize && (
                <p className="text-center text-muted-foreground text-xs">
                  {(fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (multiple) {
        const fileArray = Array.from(files);
        const currentFiles = Array.isArray(value) ? value : [];
        const newFiles = [...currentFiles, ...fileArray].slice(0, maxFiles);
        onChange(newFiles as unknown as T);
      } else {
        const file = files.item(0);
        if (file) {
          onChange(file as unknown as T);
        }
      }
    }
  };

  const handleMoreFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && Array.isArray(value)) {
      const fileArray = Array.from(files);
      const currentFiles = value || [];
      const newFiles = [...currentFiles, ...fileArray].slice(0, maxFiles);
      onChange(newFiles as unknown as T);
    }
  };

  return (
    <div className={`space-y-2 ${wrapperClassName || ""}`}>
      <Label>
        {finalLabel}
        {required && <span className="ml-1 text-red-500">*</span>}
      </Label>

      <div className="mt-1 space-y-4">
        {/* Upload Area */}
        {!(multiple || value) ||
        (multiple &&
          (!value || (Array.isArray(value) && value.length === 0))) ? (
          <div className="relative">
            <input
              accept={finalAcceptTypes}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              id={`${name}-upload`}
              multiple={multiple}
              onChange={handleFileChange}
              required={required}
              type="file"
            />
            <div className="rounded-lg border-2 border-dashed bg-muted/20 p-6 text-center transition-colors hover:border-foreground hover:bg-muted/40">
              {" "}
              <Icon className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <div className="space-y-1">
                <p className="font-medium text-foreground text-sm">
                  {multiple
                    ? `Click to upload ${fileType}s`
                    : config.uploadText}
                </p>
                <p className="text-muted-foreground text-xs">
                  {finalDescription}
                  {multiple && ` (Max ${maxFiles} files)`}
                </p>
              </div>
            </div>
          </div>
        ) : multiple && Array.isArray(value) ? (
          /* Multiple Files Display */
          <div className="space-y-4">
            {renderMultipleFiles(
              value,
              onChange as (files: (File | string)[]) => void
            )}
            {value.length < maxFiles && (
              <div className="relative">
                <input
                  accept={finalAcceptTypes}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  id={`${name}-upload-more`}
                  multiple
                  onChange={handleMoreFilesChange}
                  type="file"
                />
                <div className="rounded-lg border-2 border-muted-foreground border-dashed bg-muted/20 p-4 text-center transition-colors hover:border-foreground hover:bg-muted/40">
                  <Icon className="mx-auto mb-1 h-6 w-6 text-muted-foreground" />
                  <p className="font-medium text-foreground text-sm">
                    Add more files
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Single File Display */
          <div className="relative inline-block">
            {renderPreview(value as File | string)}
            <Button
              className="-top-2 -right-2 absolute h-6 w-6 rounded-full p-0"
              onClick={() => onChange(null as unknown as T)}
              size="sm"
              type="button"
              variant="destructive"
            >
              <X className="h-3 w-3" />
            </Button>
            <div className="mt-2">
              <p className="max-w-32 truncate text-center text-foreground text-xs">
                {typeof value === "string"
                  ? value.split("/").pop() || "Unknown file"
                  : (value as File)?.name}
              </p>
              {fileType === FileType.VIDEO &&
                typeof value !== "string" &&
                value && (
                  <p className="text-center text-muted-foreground text-xs">
                    {((value as unknown as File).size / 1024 / 1024).toFixed(2)}{" "}
                    MB
                  </p>
                )}
            </div>
          </div>
        )}
      </div>

      {error && <InputError className={errorClassName} message={error} />}
    </div>
  );
}
