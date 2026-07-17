"use client";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import { Placeholder } from "@tiptap/extensions";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ColorLib from "color";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Palette,
  Quote,
  Redo,
  RotateCcw,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Table as TableIcon,
  Trash2,
  Type,
  Underline as UnderlineIcon,
  Undo,
} from "lucide-react";
import * as React from "react";
import { Button } from "@/components/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shadcn/ui/dialog";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Separator } from "@/components/shadcn/ui/separator";
import { Toggle } from "@/components/shadcn/ui/toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/shadcn/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  ColorPicker,
  ColorPickerAlpha,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerSelection,
} from "./color-picker";

interface MinimalTiptapProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
}

// Toolbar Button Components
const ToolbarButton = ({
  pressed,
  onPressedChange,
  disabled,
  children,
  tooltip,
}: {
  pressed: boolean;
  onPressedChange: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  tooltip: string;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Toggle
        className={cn(
          pressed && "border border-primary text-primary",
          "hover:bg-muted"
        )}
        disabled={disabled}
        onPressedChange={onPressedChange}
        pressed={pressed}
        size="sm"
      >
        {children}
      </Toggle>
    </TooltipTrigger>
    <TooltipContent>{tooltip}</TooltipContent>
  </Tooltip>
);

const ToolbarAction = ({
  onClick,
  disabled,
  children,
  tooltip,
  className,
  active,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  tooltip: string;
  className?: string;
  active?: boolean;
}) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        className={cn(
          className,
          active && "border border-primary text-primary",
          "px-1.5 hover:bg-muted"
        )}
        disabled={disabled}
        onClick={onClick}
        size="sm"
        type="button"
        variant="ghost"
      >
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent>{tooltip}</TooltipContent>
  </Tooltip>
);

function MinimalTiptap({
  content = "",
  onChange,
  placeholder = "Start typing...",
  editable = true,
  className,
}: MinimalTiptapProps) {
  const [linkUrl, setLinkUrl] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [isLinkDialogOpen, setIsLinkDialogOpen] = React.useState(false);
  const [isImageDialogOpen, setIsImageDialogOpen] = React.useState(false);
  const [isColorDialogOpen, setIsColorDialogOpen] = React.useState(false);
  const [selectedColor, setSelectedColor] = React.useState("#000000");
  const lastColorRef = React.useRef("#000000");

  const handleColorChange = React.useCallback((value: unknown) => {
    let hex: string;
    try {
      if (Array.isArray(value) && value.length >= 3) {
        // Handle RGBA array [r, g, b, a]
        hex = ColorLib.rgb(value.slice(0, 3) as [number, number, number]).hex();
      } else if (typeof value === "string") {
        // Handle string input
        hex = ColorLib(value).hex();
      } else {
        // Try to convert other inputs
        hex = ColorLib(String(value)).hex();
      }

      if (hex !== lastColorRef.current) {
        lastColorRef.current = hex;
        setSelectedColor(hex);
      }
    } catch {
      // Ignore invalid color values
    }
  }, []);

  React.useEffect(() => {
    lastColorRef.current = selectedColor;
  }, [selectedColor]);

  const [, setEditorState] = React.useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Superscript,
      Subscript,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
      setEditorState((prev) => prev + 1);
    },
    onSelectionUpdate: () => {
      setEditorState((prev) => prev + 1);
    },
    onFocus: () => {
      setEditorState((prev) => prev + 1);
    },
    onBlur: () => {
      setEditorState((prev) => prev + 1);
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm mx-auto focus:outline-none",
          "max-w-full prose-table:table-fixed prose-td:border prose-th:border prose-td:border-border prose-th:border-border prose-th:bg-muted prose-td:px-3 prose-th:px-3 prose-td:py-2 prose-th:py-2 prose-th:text-left prose-th:font-semibold",
          "min-h-[200px] border-0 p-4"
        ),
      },
    },
  });

  // Check if current selection has a link
  const isLinkActive = editor?.isActive("link");
  const currentLinkUrl = editor?.getAttributes("link")?.href || "";

  // Check if current selection has color
  const isColorActive = editor?.isActive("textStyle", { color: /.*/ });
  const currentColor = editor?.getAttributes("textStyle")?.color || "#000000";

  const openLinkDialog = () => {
    if (isLinkActive) {
      setLinkUrl(currentLinkUrl);
    } else {
      setLinkUrl("");
    }
    setIsLinkDialogOpen(true);
  };

  const addLink = () => {
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setIsLinkDialogOpen(false);
    }
  };

  const removeLink = () => {
    editor?.chain().focus().unsetLink().run();
    setLinkUrl("");
    setIsLinkDialogOpen(false);
  };

  const addImage = () => {
    if (imageUrl) {
      editor?.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl("");
      setIsImageDialogOpen(false);
    }
  };

  const insertTable = () => {
    editor
      ?.chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  };

  const deleteTable = () => {
    editor?.chain().focus().deleteTable().run();
  };

  if (!editor) {
    return null;
  }
  return (
    <TooltipProvider>
      <div className={cn("overflow-hidden rounded-lg border", className)}>
        <div className="flex flex-wrap items-center gap-1 border-b p-2">
          <ToolbarButton
            disabled={!editor.can().chain().focus().toggleBold().run()}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            pressed={editor.isActive("bold")}
            tooltip="Bold"
          >
            <Bold className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            pressed={editor.isActive("italic")}
            tooltip="Italic"
          >
            <Italic className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            disabled={!editor.can().chain().focus().toggleUnderline().run()}
            onPressedChange={() =>
              editor.chain().focus().toggleUnderline().run()
            }
            pressed={editor.isActive("underline")}
            tooltip="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            disabled={!editor.can().chain().focus().toggleStrike().run()}
            onPressedChange={() => editor.chain().focus().toggleStrike().run()}
            pressed={editor.isActive("strike")}
            tooltip="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            disabled={!editor.can().chain().focus().toggleCode().run()}
            onPressedChange={() => editor.chain().focus().toggleCode().run()}
            pressed={editor.isActive("code")}
            tooltip="Inline Code"
          >
            <Code className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            disabled={!editor.can().chain().focus().toggleHighlight().run()}
            onPressedChange={() =>
              editor.chain().focus().toggleHighlight().run()
            }
            pressed={editor.isActive("highlight")}
            tooltip="Highlight"
          >
            <Palette className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarAction
            active={isColorActive}
            className={cn(isColorActive && "relative")}
            onClick={() => setIsColorDialogOpen(true)}
            tooltip="Text Color"
          >
            <div className="relative">
              <Type className="h-4 w-4" />
              <div
                className="-top-3 -right-3 absolute h-3 w-3 rounded-full border border-white shadow-sm"
                style={{ backgroundColor: currentColor }}
              />
            </div>
          </ToolbarAction>
          <Dialog onOpenChange={setIsColorDialogOpen} open={isColorDialogOpen}>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Choose Text Color</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    "#000000",
                    "#FFFFFF",
                    "#FF0000",
                    "#00FF00",
                    "#0000FF",
                    "#FFFF00",
                    "#FF00FF",
                    "#00FFFF",
                    "#FFA500",
                    "#800080",
                    "#FFC0CB",
                    "#A52A2A",
                    "#808080",
                    "#000080",
                    "#008000",
                  ].map((color) => (
                    <button
                      className="h-8 w-8 rounded border-2 border-gray-300 transition-colors hover:border-gray-500"
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <ColorPicker
                  className="h-fit w-full"
                  onChange={handleColorChange}
                  value={selectedColor}
                >
                  <ColorPickerSelection className="h-48 w-full" />
                  <div className="flex gap-2">
                    <ColorPickerHue className="flex-1" />
                    <ColorPickerAlpha className="flex-1" />
                  </div>
                  <ColorPickerFormat />
                </ColorPicker>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => setIsColorDialogOpen(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      editor?.chain().focus().setColor(selectedColor).run();
                      setIsColorDialogOpen(false);
                    }}
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Separator className="!h-6 mx-2" orientation="vertical" />
          <ToolbarButton
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            pressed={editor.isActive("heading", { level: 1 })}
            tooltip="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            pressed={editor.isActive("heading", { level: 2 })}
            tooltip="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onPressedChange={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            pressed={editor.isActive("heading", { level: 3 })}
            tooltip="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </ToolbarButton>
          <Separator className="!h-6 mx-2" orientation="vertical" />
          <ToolbarButton
            onPressedChange={() =>
              editor.chain().focus().toggleBulletList().run()
            }
            pressed={editor.isActive("bulletList")}
            tooltip="Bullet List"
          >
            <List className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onPressedChange={() =>
              editor.chain().focus().toggleOrderedList().run()
            }
            pressed={editor.isActive("orderedList")}
            tooltip="Ordered List"
          >
            <ListOrdered className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onPressedChange={() =>
              editor.chain().focus().toggleTaskList().run()
            }
            pressed={editor.isActive("taskList")}
            tooltip="Task List"
          >
            <ListTodo className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onPressedChange={() =>
              editor.chain().focus().toggleBlockquote().run()
            }
            pressed={editor.isActive("blockquote")}
            tooltip="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onPressedChange={() =>
              editor.chain().focus().toggleCodeBlock().run()
            }
            pressed={editor.isActive("codeBlock")}
            tooltip="Code Block"
          >
            <Code2 className="h-4 w-4" />
          </ToolbarButton>
          <Separator className="!h-6 mx-2" orientation="vertical" />
          <ToolbarButton
            onPressedChange={() =>
              editor.chain().focus().setTextAlign("left").run()
            }
            pressed={editor.isActive({ textAlign: "left" })}
            tooltip="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onPressedChange={() =>
              editor.chain().focus().setTextAlign("center").run()
            }
            pressed={editor.isActive({ textAlign: "center" })}
            tooltip="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onPressedChange={() =>
              editor.chain().focus().setTextAlign("right").run()
            }
            pressed={editor.isActive({ textAlign: "right" })}
            tooltip="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onPressedChange={() =>
              editor.chain().focus().setTextAlign("justify").run()
            }
            pressed={editor.isActive({ textAlign: "justify" })}
            tooltip="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </ToolbarButton>
          <Separator className="!h-6 mx-2" orientation="vertical" />
          <ToolbarButton
            onPressedChange={() =>
              editor.chain().focus().toggleSuperscript().run()
            }
            pressed={editor.isActive("superscript")}
            tooltip="Superscript"
          >
            <SuperscriptIcon className="h-4 w-4" />
          </ToolbarButton>
          <ToolbarButton
            onPressedChange={() =>
              editor.chain().focus().toggleSubscript().run()
            }
            pressed={editor.isActive("subscript")}
            tooltip="Subscript"
          >
            <SubscriptIcon className="h-4 w-4" />
          </ToolbarButton>
          <Separator className="!h-6 mx-2" orientation="vertical" />
          <ToolbarAction
            active={isLinkActive}
            onClick={openLinkDialog}
            tooltip={isLinkActive ? "Edit Link" : "Add Link"}
          >
            <LinkIcon className="h-4 w-4" />
          </ToolbarAction>
          <Dialog onOpenChange={setIsLinkDialogOpen} open={isLinkDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isLinkActive ? "Edit Link" : "Add Link"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="link-url">URL</Label>
                  <Input
                    id="link-url"
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    value={linkUrl}
                  />
                </div>
                <div className="flex justify-between gap-2">
                  {isLinkActive && (
                    <Button onClick={removeLink} variant="destructive">
                      Remove Link
                    </Button>
                  )}
                  <div className="ml-auto flex gap-2">
                    <Button
                      onClick={() => setIsLinkDialogOpen(false)}
                      variant="outline"
                    >
                      Cancel
                    </Button>
                    <Button disabled={!linkUrl.trim()} onClick={addLink}>
                      {isLinkActive ? "Update Link" : "Add Link"}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <ToolbarAction
            onClick={() => setIsImageDialogOpen(true)}
            tooltip="Add Image"
          >
            <ImageIcon className="h-4 w-4" />
          </ToolbarAction>
          <Dialog onOpenChange={setIsImageDialogOpen} open={isImageDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Image</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image-url">Image URL</Label>
                  <Input
                    id="image-url"
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                  />
                </div>
                <Button onClick={addImage}>Add Image</Button>
              </div>
            </DialogContent>
          </Dialog>
          <ToolbarAction
            active={editor?.isActive("table")}
            onClick={() => {
              if (editor?.isActive("table")) {
                deleteTable();
              } else {
                insertTable();
              }
            }}
            tooltip={
              editor?.isActive("table") ? "Delete Table" : "Insert Table"
            }
          >
            {editor?.isActive("table") ? (
              <Trash2 className="h-4 w-4" />
            ) : (
              <TableIcon className="h-4 w-4" />
            )}
          </ToolbarAction>
          <Separator className="!h-6 mx-2" orientation="vertical" />
          <ToolbarAction
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            tooltip="Horizontal Rule"
          >
            <Minus className="h-4 w-4" />
          </ToolbarAction>
          <ToolbarAction
            onClick={() => editor.chain().focus().unsetAllMarks().run()}
            tooltip="Clear Formatting"
          >
            <RotateCcw className="h-4 w-4" />
          </ToolbarAction>
          <Separator className="!h-6 mx-2" orientation="vertical" />
          <ToolbarAction
            disabled={!editor.can().chain().focus().undo().run()}
            onClick={() => editor.chain().focus().undo().run()}
            tooltip="Undo"
          >
            <Undo className="h-4 w-4" />
          </ToolbarAction>
          <ToolbarAction
            disabled={!editor.can().chain().focus().redo().run()}
            onClick={() => editor.chain().focus().redo().run()}
            tooltip="Redo"
          >
            <Redo className="h-4 w-4" />
          </ToolbarAction>
        </div>
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
    </TooltipProvider>
  );
}
export { MinimalTiptap, type MinimalTiptapProps };
