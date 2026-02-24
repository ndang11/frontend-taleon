"use client";

import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@tiptap/extension-table";
import Underline from "@tiptap/extension-underline";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlertCircle,
  Bold,
  Code,
  Copy,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List as ListIcon,
  ListOrdered,
  Quote,
  Redo,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo,
  Upload,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { uploadPostImage } from "@/core/lib/api-client";
import { useEditorAutosave } from "@/hook/useAutoSave";

// Storage format type
export type ContentFormat = "html" | "json";

interface EditorControls {
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleUnderline: () => void;
  toggleStrike: () => void;
  toggleHeading: (level: 1 | 2 | 3) => void;
  toggleBulletList: () => void;
  toggleOrderedList: () => void;
  toggleCodeBlock: () => void;
  toggleBlockquote: () => void;
  setLink: (url: string) => void;
  unsetLink: () => void;
  insertImage: (url: string, alt?: string) => void;
  insertTable: (rows: number, cols: number) => void;
  focus: () => void;
  getContent: (format?: ContentFormat) => string | object;
  getJSON: () => object;
  getHTML: () => string;
  setContent: (content: object) => void;
}

interface TiptapEditorProps {
  postId: string | null;
  onStatusChange: (
    status: "Error" | "Published" | "Saving..." | "Saved" | "Draft",
  ) => void;
  onWordCountChange: (count: number) => void;
  onReady?: (controls: EditorControls) => void;
  initialContent?: object;
  contentFormat?: ContentFormat;
}

// URL validation regex
const URL_REGEX = /^https?:\/\/[^\s]+$/;

export default function TiptapEditor({
  postId,
  onStatusChange,
  onWordCountChange,
  onReady,
  initialContent: _initialContent,
  contentFormat = "html",
}: TiptapEditorProps) {
  const { debouncedSave, saveStatus } = useEditorAutosave(
    postId,
    contentFormat as "html" | "json",
  );
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);

  // Image upload state
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [activeImageTab, setActiveImageTab] = useState<"upload" | "link">(
    "upload",
  );
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateUrl = useCallback((url: string): boolean => {
    if (!url) return true;
    return URL_REGEX.test(url);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        // Exclude link and underline from StarterKit since we add them separately
        // to avoid duplicate extension warnings
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 underline cursor-pointer",
        },
        validate: (href: string) => {
          return href.startsWith("http://") || href.startsWith("https://");
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "w-full rounded-xl my-6 shadow-sm",
        },
      }),
      Table.configure({
        HTMLAttributes: {
          class:
            "border-collapse table-auto w-full my-6 rounded-lg overflow-hidden",
        },
        resizable: true,
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-200 p-3",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-gray-200 p-3 bg-gray-50 font-semibold",
        },
      }),
      Placeholder.configure({ placeholder: "Tell your story..." }),
    ],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none focus:outline-none min-h-[60vh] text-gray-800 leading-relaxed font-serif text-lg",
      },
    },
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      const wordCount = text
        .trim()
        .split(/\s+/)
        .filter((w) => w.length > 0).length;

      onWordCountChange(wordCount);

      const currentTitle =
        (
          document.querySelector(
            'input[placeholder="Title"]',
          ) as HTMLInputElement
        )?.value || "";

      if (contentFormat === "json") {
        debouncedSave(editor.getJSON(), currentTitle);
      } else {
        debouncedSave(editor.getHTML(), currentTitle);
      }
    },
  });

  useEffect(() => {
    if (editor && _initialContent) {
      editor.commands.setContent(_initialContent);
    }
  }, [editor, _initialContent]);

  useEffect(() => {
    if (editor) {
      onReady?.({
        toggleBold: () => editor.chain().focus().toggleBold().run(),
        toggleItalic: () => editor.chain().focus().toggleItalic().run(),
        toggleUnderline: () => editor.chain().focus().toggleUnderline().run(),
        toggleStrike: () => editor.chain().focus().toggleStrike().run(),
        toggleHeading: (level: 1 | 2 | 3) =>
          editor
            .chain()
            .focus()
            .toggleHeading({ level: level as 1 | 2 })
            .run(),
        toggleBulletList: () => editor.chain().focus().toggleBulletList().run(),
        toggleOrderedList: () =>
          editor.chain().focus().toggleOrderedList().run(),
        toggleCodeBlock: () => editor.chain().focus().toggleCodeBlock().run(),
        toggleBlockquote: () => editor.chain().focus().toggleBlockquote().run(),
        setLink: (url: string) => {
          if (validateUrl(url)) {
            editor
              .chain()
              .focus()
              .extendMarkRange("link")
              .setLink({ href: url })
              .run();
            setShowLinkInput(false);
            setLinkUrl("");
          }
        },
        unsetLink: () => editor.chain().focus().unsetLink().run(),
        insertImage: (url: string, alt?: string) => {
          if (validateUrl(url)) {
            editor
              .chain()
              .focus()
              .setImage({ src: url, alt: alt || "" })
              .run();
          }
        },
        insertTable: (rows: number, cols: number) => {
          editor
            .chain()
            .focus()
            .insertTable({ rows, cols, withHeaderRow: true })
            .run();
        },
        focus: () => editor.commands.focus(),
        getContent: (format?: ContentFormat) => {
          const outputFormat = format || contentFormat;
          if (outputFormat === "html") {
            return editor.getHTML();
          }
          return editor.getJSON();
        },
        getJSON: () => editor.getJSON(),
        getHTML: () => editor.getHTML(),
        setContent: (content: object) => {
          editor.commands.setContent(content);
        },
      });
    }
  }, [editor, onReady, contentFormat, validateUrl]);

  useEffect(() => {
    onStatusChange(
      saveStatus === "saving"
        ? "Saving..."
        : saveStatus === "saved"
          ? "Saved"
          : "Draft",
    );
  }, [saveStatus, onStatusChange]);

  const handleSetLink = () => {
    if (validateUrl(linkUrl) && editor) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: linkUrl })
        .run();
      setShowLinkInput(false);
      setLinkUrl("");
    }
  };

  const handleCopyContent = async () => {
    if (!editor) return;

    const text = editor.getText();
    const html = editor.getHTML();

    try {
      // Try to copy as rich text first (HTML)
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([text], { type: "text/plain" }),
        }),
      ]);
    } catch {
      // Fallback to plain text
      await navigator.clipboard.writeText(text);
    }
  };

  const handleImageUrlSubmit = () => {
    if (validateUrl(imageUrl) && editor) {
      editor
        .chain()
        .focus()
        .setImage({ src: imageUrl, alt: imageAlt || "" })
        .run();
      setShowImageModal(false);
      setImageUrl("");
      setImageAlt("");
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;

    setImageUploadError(null);
    setIsUploadingImage(true);

    try {
      const result = await uploadPostImage(file);
      editor
        .chain()
        .focus()
        .setImage({ src: result.url, alt: file.name })
        .run();
      setShowImageModal(false);
      setImageUrl("");
      setImageAlt("");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload image";
      setImageUploadError(errorMessage);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setImageUrl("");
    setImageAlt("");
    setImageUploadError(null);
    setActiveImageTab("upload");
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="editor-wrapper">
      {/* Medium-style Floating Toolbar */}
      <div className="flex justify-center mb-6">
        <div className="flex items-center gap-1 bg-white rounded-full shadow-sm border border-gray-100 px-2 py-1.5 inline-flex">
          {/* Text Formatting */}
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
              editor.isActive("bold")
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500"
            }`}
            title="Bold"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
              editor.isActive("italic")
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500"
            }`}
            title="Italic"
          >
            <Italic className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Headings */}
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
              editor.isActive("heading", { level: 1 })
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500"
            }`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
              editor.isActive("heading", { level: 2 })
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500"
            }`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Lists & Blocks */}
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
              editor.isActive("bulletList")
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500"
            }`}
            title="Bullet List"
          >
            <ListIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
              editor.isActive("orderedList")
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500"
            }`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
              editor.isActive("blockquote")
                ? "bg-gray-100 text-gray-900"
                : "text-gray-500"
            }`}
            title="Quote"
          >
            <Quote className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Link */}
          <div className="relative">
            <button
              onClick={() => setShowLinkInput(!showLinkInput)}
              className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
                editor.isActive("link")
                  ? "bg-gray-100 text-gray-900"
                  : "text-gray-500"
              }`}
              title="Add Link"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            {showLinkInput && (
              <div className="absolute top-full left-0 mt-2 p-2 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
                <input
                  type="url"
                  placeholder="https://..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-48 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 mb-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSetLink();
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSetLink}
                    className="flex-1 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg hover:bg-gray-800"
                  >
                    Add
                  </button>
                  {editor.isActive("link") && (
                    <button
                      onClick={() => {
                        editor.chain().focus().unsetLink().run();
                        setShowLinkInput(false);
                      }}
                      className="px-3 py-1.5 bg-red-500 text-white text-xs rounded-lg hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Image */}
          <button
            onClick={() => setShowImageModal(!showImageModal)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            title="Add Image"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
          onClick={closeImageModal}
        >
          <div
            className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Add Image</h3>
              <button
                onClick={closeImageModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveImageTab("upload")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeImageTab === "upload"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Upload from Device
              </button>
              <button
                onClick={() => setActiveImageTab("link")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  activeImageTab === "link"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Add Image Link
              </button>
            </div>

            {/* Upload Tab */}
            {activeImageTab === "upload" && (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={isUploadingImage}
                  />
                  {isUploadingImage ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm text-gray-600">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <Upload className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium text-gray-900">
                          Click to upload
                        </span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-400">
                        JPEG, PNG, GIF, or WebP up to 10MB
                      </p>
                    </div>
                  )}
                </div>
                {imageUploadError && (
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    {imageUploadError}
                  </div>
                )}
              </div>
            )}

            {/* Link Tab */}
            {activeImageTab === "link" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alt Text (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Image description"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
                <button
                  onClick={handleImageUrlSubmit}
                  disabled={!validateUrl(imageUrl) || isUploadingImage}
                  className="w-full py-3 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Image
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div className="min-h-[60vh]">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
