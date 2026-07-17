import { DialogDescription } from "@radix-ui/react-dialog";
import {
  Download,
  Eye,
  FileIcon,
  FileText,
  Image as ImageIcon,
  Plus,
  Video,
  X,
} from "lucide-react";
import type React from "react";
import { useEffect, useId, useState } from "react";
import { type Path, useController, useFormContext } from "react-hook-form";
import InputError from "@/components/dashboard/input-error";
import { Button } from "@/components/shadcn/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/shadcn/ui/dialog";
import { Label } from "@/components/shadcn/ui/label";
import { cn } from "@/lib/utils";
import { useZodSchema } from "@/provider/ZodSchemaProvider";
import { getFormError, getFormRequired } from "../utils";

export const FileType = {
  IMAGE: "image",
  VIDEO: "video",
  PDF: "pdf",
} as const;

type FileType = (typeof FileType)[keyof typeof FileType];

const AcceptType = {
  // Images
  IMAGE_ALL: "image/*",
  IMAGE_JPEG: "image/jpeg",
  IMAGE_PNG: "image/png",
  IMAGE_GIF: "image/gif",
  IMAGE_WEBP: "image/webp",
  IMAGE_SVG: "image/svg+xml",

  // Videos
  VIDEO_ALL: "video/*",
  VIDEO_MP4: "video/mp4",
  VIDEO_AVI: "video/avi",
  VIDEO_MOV: "video/quicktime",
  VIDEO_WEBM: "video/webm",

  // Documents
  PDF: ".pdf",
  DOC: ".doc",
  DOCX: ".docx",
  TXT: "text/plain",
  RTF: ".rtf",

  // Spreadsheets
  XLS: ".xls",
  XLSX: ".xlsx",
  CSV: ".csv",

  // Presentations
  PPT: ".ppt",
  PPTX: ".pptx",

  // Archives
  ZIP: ".zip",
  RAR: ".rar",

  // Audio
  AUDIO_ALL: "audio/*",
  AUDIO_MP3: "audio/mpeg",
  AUDIO_WAV: "audio/wav",

  // All files
  ALL: "*/*",
} as const;

type AcceptType = (typeof AcceptType)[keyof typeof AcceptType];

const storageUrl = import.meta.env.VITE_STORAGE_URL;

const defaultFileRenderSize = "size-50";

type TXFormFileInput<T> = {
  name: keyof T;
  label?: string;
  fileType?: FileType[];
  acceptTypes?: AcceptType[];
  description?: string;
  multiple?: boolean;
  maxFiles?: number;
  wrapperClassName?: string;
  className?: string;
  disabled?: boolean;
};

const getFileConfig = (fileTypes: FileType[]) => {
  // If no file types specified, default to IMAGE
  if (fileTypes.length === 0) {
    fileTypes = [FileType.IMAGE];
  }

  // Build accept string from all file types
  const acceptParts: string[] = [];
  if (fileTypes.includes(FileType.IMAGE)) {
    acceptParts.push("image/*");
  }
  if (fileTypes.includes(FileType.VIDEO)) {
    acceptParts.push("video/*");
  }
  if (fileTypes.includes(FileType.PDF)) {
    acceptParts.push(".pdf");
  }

  const accept = acceptParts.join(",") || "*/*";

  // Determine icon based on file types (prioritize in order: IMAGE, VIDEO, PDF)
  let icon = FileText;
  if (fileTypes.includes(FileType.IMAGE)) {
    icon = ImageIcon;
  } else if (fileTypes.includes(FileType.VIDEO)) {
    icon = Video;
  } else if (fileTypes.includes(FileType.PDF)) {
    icon = FileText;
  }

  // Build label and description based on all file types
  const typeLabels: string[] = [];
  const typeDescriptions: string[] = [];

  if (fileTypes.includes(FileType.IMAGE)) {
    typeLabels.push("Images");
    typeDescriptions.push("PNG, JPG, GIF, WEBP up to 5MB");
  }
  if (fileTypes.includes(FileType.VIDEO)) {
    typeLabels.push("Videos");
    typeDescriptions.push("MP4, AVI, MOV up to 50MB");
  }
  if (fileTypes.includes(FileType.PDF)) {
    typeLabels.push("PDFs");
    typeDescriptions.push("PDF files up to 10MB");
  }

  const defaultLabel =
    typeLabels.length > 0 ? `${typeLabels.join(", ")} Upload` : "File Upload";

  const defaultDescription = typeDescriptions.join(", ") || "Any file type";

  const uploadText =
    fileTypes.length === 1
      ? `Click to upload ${typeLabels[0]?.toLowerCase() || "file"}`
      : "Click to upload files";

  return {
    accept,
    icon,
    defaultLabel,
    defaultDescription,
    uploadText,
  };
};

// Function to get file size for a single file or URL
const getFileSize = async (file: File | string): Promise<number> => {
  if (typeof file === "string") {
    // Handle URL strings
    try {
      const fullUrl = file.startsWith("http") ? file : `${storageUrl}${file}`;
      const response = await fetch(fullUrl, { method: "HEAD" });
      const contentLength = response.headers.get("content-length");
      if (contentLength) {
        return Number.parseInt(contentLength, 10);
      }
      // If no content-length header, try to fetch the full resource
      const fullResponse = await fetch(fullUrl);
      const blob = await fullResponse.blob();
      return blob.size;
    } catch (error) {
      console.warn(`Failed to get size for URL: ${file}`, error);
      return 0;
    }
  } else if (file instanceof File) {
    // Handle File objects
    return file.size;
  }
  return 0;
};

// Function to calculate the total size of uploaded files or URLs
const calculateTotalFileSize = async (
  files: (File | string)[]
): Promise<number> => {
  let totalSize = 0;

  for (const file of files) {
    const size = await getFileSize(file);
    totalSize += size;
  }

  return totalSize;
};

// Function to get readable file type string from array
const getFileTypeString = (fileTypes: FileType[]): string => {
  if (fileTypes.length === 0) {
    return "files";
  }

  if (fileTypes.length === 1) {
    return fileTypes[0];
  }

  // For multiple types, join with "and" for the last one
  const allButLast = fileTypes.slice(0, -1).join(", ");
  const last = fileTypes.at(-1);
  return `${allButLast} and ${last}`;
};

// Function to get the file name from File object or URL string
const getFileName = (file: File | string): string => {
  if (typeof file === "string") {
    // Handle URL strings - extract filename from path
    try {
      const url = new URL(
        file.startsWith("http") ? file : `${storageUrl}${file}`
      );
      const pathname = url.pathname;
      const filename = pathname.split("/").pop();
      return filename || "Unknown file";
    } catch {
      // If URL parsing fails, try to extract from path directly
      const parts = file.split("/");
      return parts.at(-1) || "Unknown file";
    }
  } else if (file instanceof File) {
    // Handle File objects
    return file.name;
  }

  return "Unknown file";
};

// Function to get file extension from File object or URL string
const getFileExtension = (file: File | string): string => {
  const fileName = getFileName(file);
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex === -1) {
    return "";
  }
  return fileName.substring(lastDotIndex + 1).toUpperCase();
};

// Function to check if file can be viewed in browser
const canViewFile = (file: File | string): boolean => {
  const extension = getFileExtension(file).toLowerCase();
  const viewableExtensions = [
    "jpg",
    "jpeg",
    "png",
    "gif",
    "webp",
    "svg",
    "mp4",
    "avi",
    "mov",
    "webm",
    "pdf",
  ];
  return viewableExtensions.includes(extension);
};

// File Viewer Dialog Component
const FileViewerDialog = ({
  file,
  fileExtension,
  fileSize,
  children,
}: {
  file: File | string;
  fileExtension: string;
  fileSize: string;
  children: React.ReactNode;
}) => {
  const fileName = getFileName(file);
  const isViewable = canViewFile(file);
  const [isOpen, setIsOpen] = useState(false);

  const getFileUrl = (file: File | string): string => {
    if (typeof file === "string") {
      return file.startsWith("http") ? file : `${storageUrl}${file}`;
    }
    return URL.createObjectURL(file);
  };

  const handleDownload = () => {
    const url = getFileUrl(file);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up object URL if it's a File object
    if (file instanceof File) {
      URL.revokeObjectURL(url);
    }
  };

  const renderFileContent = () => {
    if (!isViewable) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <FileIcon className="mb-4 h-16 w-16 text-muted-foreground" />
          <p className="text-center text-muted-foreground">
            This file type cannot be previewed in the browser.
          </p>
          <p className="mt-2 text-muted-foreground text-sm">
            Use the download button to save the file.
          </p>
        </div>
      );
    }

    const url = getFileUrl(file);
    const isImage = fileExtension
      .toLowerCase()
      .match(/(jpg|jpeg|png|gif|webp|svg)/);
    const isVideo = fileExtension.toLowerCase().match(/(mp4|avi|mov|webm)/);
    const isPdf = fileExtension.toLowerCase() === "pdf";

    if (isImage) {
      return (
        <div className="flex justify-center">
          <img
            alt={fileName}
            className="max-h-[50vh] max-w-full rounded-lg object-contain"
            height="auto"
            onLoad={() => {
              if (file instanceof File) {
                URL.revokeObjectURL(url);
              }
            }}
            src={url}
            width="auto"
          />
        </div>
      );
    }

    if (isVideo) {
      return (
        <div className="flex justify-center">
          <video
            className="max-h-[50vh] max-w-full rounded-lg"
            controls
            onLoadedData={() => {
              if (file instanceof File) URL.revokeObjectURL(url);
            }}
            src={url}
          />
        </div>
      );
    }

    if (isPdf) {
      return (
        <div className="h-[50vh] w-full">
          <iframe
            className="h-full w-full rounded-lg border"
            src={url}
            title={fileName}
          />
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileIcon className="mb-4 h-16 w-16 text-muted-foreground" />
        <p className="text-center text-muted-foreground">
          Preview not available for this file type.
        </p>
      </div>
    );
  };

  return (
    <Dialog onOpenChange={setIsOpen} open={isOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-4xl overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="truncate pr-4">{fileName}</span>
          </DialogTitle>
          <div className="flex items-center gap-4 text-muted-foreground text-sm">
            <span>Size: {fileSize}</span>
            <span>Extension: {fileExtension || "Unknown"}</span>
          </div>
        </DialogHeader>
        <DialogDescription>
          <div className="flex-1 overflow-auto">{renderFileContent()}</div>
        </DialogDescription>
        <DialogFooter className="flex gap-2">
          <Button
            className="flex items-center gap-2"
            onClick={handleDownload}
            size="sm"
            variant="outline"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
          <DialogClose asChild>
            <Button size="sm" variant="outline">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Reusable FileItem component for multiple files
const FileItem = ({
  file,
  onRemove,
  index,
}: {
  file: File | string;
  onRemove: (index: number) => void;
  index: number;
}) => {
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [isLoadingSize, setIsLoadingSize] = useState(false);

  const fileName = getFileName(file);
  const isImage = file instanceof File && file.type.startsWith("image/");
  const isVideo = file instanceof File && file.type.startsWith("video/");

  // For string URLs, check file extension to determine type
  const isVideoUrl =
    typeof file === "string" &&
    (file.toLowerCase().includes(".mp4") ||
      file.toLowerCase().includes(".avi") ||
      file.toLowerCase().includes(".mov") ||
      file.toLowerCase().includes(".webm"));

  // Calculate file size when file changes
  useEffect(() => {
    const calculateSize = async () => {
      if (file instanceof File) {
        setFileSize(file.size);
      } else if (typeof file === "string") {
        setIsLoadingSize(true);
        try {
          const size = await getFileSize(file);
          setFileSize(size);
        } catch (error) {
          console.warn(`Failed to get file size for ${file}:`, error);
          setFileSize(null);
        } finally {
          setIsLoadingSize(false);
        }
      }
    };

    calculateSize();
  }, [file]);

  const renderFilePreview = () => {
    // Handle string URLs (existing files)
    if (typeof file === "string") {
      const fullUrl = file.startsWith("http") ? file : `${storageUrl}${file}`;

      if (isImage) {
        return (
          <img
            alt={fileName}
            className="h-10 w-10 rounded object-cover"
            height={"2.5rem"}
            src={fullUrl}
            width={"2.5rem"}
          />
        );
      }

      if (isVideoUrl) {
        return (
          <div className="relative h-10 w-10 overflow-hidden rounded bg-muted">
            <video
              className="h-full w-full object-cover"
              muted
              preload="metadata"
              src={fullUrl}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <Video className="h-4 w-4 text-white" />
            </div>
          </div>
        );
      }

      return (
        <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
          <FileIcon className="h-5 w-5 text-muted-foreground" />
        </div>
      );
    }

    // Handle File objects (newly uploaded files)
    if (isImage) {
      return (
        <img
          alt={fileName}
          className="h-10 w-10 rounded object-cover"
          height={"2.5rem"}
          src={URL.createObjectURL(file)}
          width={"2.5rem"}
        />
      );
    }

    if (isVideo) {
      return (
        <div className="relative h-10 w-10 overflow-hidden rounded bg-muted">
          <video
            className="h-full w-full object-cover"
            muted
            preload="metadata"
            src={URL.createObjectURL(file)}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <Video className="h-4 w-4 text-white" />
          </div>
        </div>
      );
    }

    // Default icon for other file types
    return (
      <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
        <FileIcon className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  };

  return (
    <div className="flex items-center justify-between rounded-md border bg-background p-3">
      <div className="flex items-center space-x-3">
        {renderFilePreview()}
        <div>
          <p className="max-w-[200px] truncate font-medium text-sm">
            {fileName}
          </p>
          <p className="text-muted-foreground text-xs">
            {isLoadingSize
              ? "Calculating size..."
              : fileSize !== null
                ? `${formatFileSize(fileSize)} • ${getFileExtension(file)}`
                : "Size unknown"}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <FileViewerDialog
          file={file}
          fileExtension={getFileExtension(file)}
          fileSize={fileSize !== null ? formatFileSize(fileSize) : "Unknown"}
        >
          <Button
            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
            size="sm"
            type="button"
            variant="ghost"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </FileViewerDialog>
        <Button
          className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground"
          onClick={() => onRemove(index)}
          size="sm"
          type="button"
          variant="ghost"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

// Function to format file size in human readable format
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) {
    return "0 Bytes";
  }

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${Number.parseFloat((bytes / k ** i).toFixed(2))} ${sizes[i]}`;
};

export function XFormFileInput<T extends Record<string, unknown>>({
  name,
  label,
  fileType = [FileType.IMAGE],
  description,
  acceptTypes,
  multiple = false,
  maxFiles = 10,
  wrapperClassName,
  // className,
  // disabled = false,
}: TXFormFileInput<T>) {
  const {
    formState: { errors },
  } = useFormContext<T>();

  const { field } = useController({
    name: name as Path<T>,
  });

  const id = useId();

  const schema = useZodSchema();

  const isRequired = getFormRequired(schema, name);
  const errorMessage = getFormError(errors, name);

  const [totalFileSize, setTotalFileSize] = useState<number>(0);

  // Update total file size when files change
  useEffect(() => {
    const updateTotalSize = async () => {
      if (Array.isArray(field.value) && field.value.length > 0) {
        const size = await calculateTotalFileSize(field.value);
        setTotalFileSize(size);
      } else if (field.value) {
        const size = await getFileSize(field.value as File | string);
        setTotalFileSize(size);
      } else {
        setTotalFileSize(0);
      }
    };

    updateTotalSize();
  }, [field.value]);

  const config = getFileConfig(fileType);
  const Icon = config.icon;

  const finalLabel = label ?? config.defaultLabel;
  const finalDescription = description ?? config.defaultDescription;
  const finalAcceptTypes = acceptTypes ? acceptTypes.join(",") : config.accept;

  const renderPreview = (file: File | string) => {
    if (typeof file === "string") {
      const fullUrl = file.startsWith("http") ? file : `${storageUrl}${file}`;
      if (fileType.includes(FileType.IMAGE)) {
        return (
          <div
            className={cn(
              "overflow-hidden rounded-lg border-2 border-border bg-muted",
              defaultFileRenderSize
            )}
          >
            <img
              alt="Preview"
              className="h-full w-full object-cover"
              src={fullUrl}
            />
          </div>
        );
      }

      if (fileType.includes(FileType.VIDEO)) {
        return (
          <div
            className={cn(
              "relative overflow-hidden rounded-lg border-2 border-border bg-muted",
              defaultFileRenderSize
            )}
          >
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
        <div
          className={cn(
            "flex items-center justify-center rounded-lg border-2 border-border bg-muted",
            defaultFileRenderSize
          )}
        >
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
        <div
          className={cn(
            "flex items-center justify-center rounded-lg border-2 border-border bg-muted",
            defaultFileRenderSize
          )}
        >
          <Icon className="h-12 w-12 text-muted-foreground" />
        </div>
      );
    }

    if (fileType.includes(FileType.IMAGE)) {
      const imageUrl = URL.createObjectURL(file);
      return (
        <div
          className={cn(
            "overflow-hidden rounded-lg border-2 border-border bg-muted",
            defaultFileRenderSize
          )}
        >
          <img
            alt="Preview"
            className="h-full w-full object-cover"
            onLoad={() => URL.revokeObjectURL(imageUrl)}
            src={imageUrl}
          />
        </div>
      );
    }

    if (fileType.includes(FileType.VIDEO)) {
      const videoUrl = URL.createObjectURL(file);
      return (
        <div
          className={cn(
            "relative overflow-hidden rounded-lg border-2 border-border bg-muted",
            defaultFileRenderSize
          )}
        >
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
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border-2 border-border bg-muted",
          defaultFileRenderSize
        )}
      >
        <Icon className="h-12 w-12 text-muted-foreground" />
      </div>
    );
  };

  const renderMultipleFiles = (
    files: (File | string)[],
    onFilesChange: (newFiles: (File | string)[]) => void
  ) => (
    <div className="space-y-2">
      {files.map((file, index) => (
        <FileItem
          file={file}
          index={index}
          key={`${getFileName(file)}-${index}`}
          onRemove={(fileIndex) => {
            const newFiles = files.filter((_, i) => i !== fileIndex);
            onFilesChange(newFiles);
          }}
        />
      ))}
    </div>
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (multiple) {
        const fileArray = Array.from(files);
        const currentFiles = Array.isArray(field.value) ? field.value : [];
        const newFiles = [...currentFiles, ...fileArray].slice(0, maxFiles);
        field.onChange(newFiles);
      } else {
        const file = files.item(0);
        if (file) {
          field.onChange(file);
        }
      }
    }
  };

  const handleMoreFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && Array.isArray(field.value)) {
      const fileArray = Array.from(files);
      const currentFiles = field.value || [];
      const newFiles = [...currentFiles, ...fileArray].slice(0, maxFiles);
      field.onChange(newFiles);
    }
  };

  return (
    <div
      className={cn("col-span-full space-y-2 md:col-span-1", wrapperClassName)}
    >
      {finalLabel && (
        <Label className="mb-2" htmlFor={id}>
          {finalLabel}
          {isRequired ? (
            <span className="text-red-500">*</span>
          ) : (
            <span className="text-muted-foreground/50">(Optional)</span>
          )}
        </Label>
      )}

      <div className="space-y-4">
        {/* Upload Area */}
        {!(multiple || field.value) ||
        (multiple &&
          (!field.value ||
            (Array.isArray(field.value) && field.value.length === 0))) ? (
          <div className="relative">
            <input
              accept={finalAcceptTypes}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              id={`${String(name)}-upload`}
              multiple={multiple}
              onChange={handleFileChange}
              required={isRequired}
              type="file"
            />
            <div
              className={cn(
                "flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/20 p-6 text-center transition-colors hover:border-foreground hover:bg-muted/40",
                defaultFileRenderSize
              )}
            >
              <Icon className="mb-2 h-8 w-8 text-muted-foreground" />
              <div className="space-y-1">
                <p className="font-medium text-foreground text-sm">
                  {multiple
                    ? `Click to upload ${getFileTypeString(fileType)}`
                    : config.uploadText}
                </p>
                <p className="text-muted-foreground text-xs">
                  {finalDescription}
                </p>
                <p className="text-muted-foreground text-xs">
                  {multiple && ` (Max ${maxFiles} files)`}
                </p>
              </div>
            </div>
          </div>
        ) : multiple && Array.isArray(field.value) ? (
          /* Multiple Files Display */
          <div className="space-y-4">
            {renderMultipleFiles(field.value, field.onChange)}

            <div className="flex flex-row items-center justify-between">
              {totalFileSize > 0 && (
                <p className="text-center text-muted-foreground text-xs">
                  Total size: {formatFileSize(totalFileSize)}
                </p>
              )}
              {field.value.length < maxFiles && (
                <div className="relative">
                  <input
                    accept={finalAcceptTypes}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    id={`${String(name)}-upload-more`}
                    multiple
                    onChange={handleMoreFilesChange}
                    type="file"
                  />
                  <Button
                    className="flex items-center gap-2"
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                    Add more files
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Single File Display */
          <div className="relative w-50">
            {renderPreview(field.value as File | string)}
            <div className="-top-2 -right-2 absolute flex gap-1">
              <Button
                className="h-6 w-6 rounded-full bg-accent p-0 text-danger"
                onClick={() => field.onChange(null)}
                size="sm"
                type="button"
                variant="ghost"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>

            <div className="mt-2 flex shrink-0 grow-0 items-center justify-between space-x-2">
              <div className="flex flex-1 grow flex-col gap-1">
                <p className="truncate whitespace-break-spaces text-foreground text-xs">
                  {getFileName(field.value as File | string)}
                </p>
                {totalFileSize > 0 && (
                  <p className="text-muted-foreground text-xs">
                    {formatFileSize(totalFileSize)} •{" "}
                    {getFileExtension(field.value as File | string)}
                  </p>
                )}
              </div>
              <div className="">
                <FileViewerDialog
                  file={field.value as File | string}
                  fileExtension={getFileExtension(field.value as File | string)}
                  fileSize={
                    totalFileSize > 0
                      ? formatFileSize(totalFileSize)
                      : "Unknown"
                  }
                >
                  <Button
                    className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </FileViewerDialog>
              </div>
            </div>
          </div>
        )}
      </div>

      <InputError className="mt-1" message={errorMessage} />
    </div>
  );
}
