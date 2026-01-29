"use client";

import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";
import { useEditorAutosave } from "@/hook/useAutoSave";

export default function TiptapEditor({
  postId,
  onStatusChange,
  onWordCountChange,
  onReady,
}: {
  postId: string;
  onStatusChange: (s: any) => void;
  onWordCountChange: (n: number) => void;
  onReady: (ctrl: any) => void;
}) {
  const { debouncedSave, saveStatus } = useEditorAutosave(postId);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Tell your story..." }),
    ],
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      const text = editor.getText();

      onWordCountChange(
        text
          .trim()
          .split(/\s+/)
          .filter((w) => w.length > 0).length,
      );

      const currentTitle =
        (
          document.querySelector(
            'input[placeholder="Title"]',
          ) as HTMLInputElement
        )?.value || "";

      debouncedSave(json, currentTitle);
    },
  });

  // Expose controls to the parent
  useEffect(() => {
    if (editor) {
      onReady({
        toggleBold: () => editor.chain().focus().toggleBold().run(),
        toggleItalic: () => editor.chain().focus().toggleItalic().run(),
        focus: () => editor.commands.focus(),
      });
    }
  }, [editor, onReady]);

  useEffect(() => {
    onStatusChange(
      saveStatus === "saving"
        ? "Saving..."
        : saveStatus === "saved"
          ? "Saved"
          : "Draft",
    );
  }, [saveStatus, onStatusChange]);

  return (
    <EditorContent
      editor={editor}
      className="prose prose-lg max-w-none focus:outline-none min-h-[400px]"
    />
  );
}
