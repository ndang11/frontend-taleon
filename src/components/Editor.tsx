"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Image as ImageIcon, Heading1, Heading2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

interface EditorProps {
  content: string;
  onChange: (content: any) => void;
  onImageUpload: (file: File) => Promise<string>;
}

function BubbleMenu({ editor, children }: { editor: any; children: React.ReactNode }) {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    const { from, to } = editor.state.selection;
    if (from === to) {
      setIsVisible(false);
      return;
    }

    const coords = editor.view.coordsAtPos(from);
    setPosition({
      top: coords.top - 10,
      left: coords.left,
    });
    setIsVisible(true);
  };

  useEffect(() => {
    editor.on('selectionUpdate', updatePosition);
    editor.on('scrollIntoView', updatePosition);
    return () => {
      editor.off('selectionUpdate', updatePosition);
      editor.off('scrollIntoView', updatePosition);
    };
  }, [editor]);

  if (!isVisible) return null;

  return (
    <div
      ref={menuRef}
      className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl flex items-center gap-2 absolute z-50 pointer-events-auto"
      style={{ top: position.top, left: position.left }}
    >
      {children}
    </div>
  );
}

export default function Editor({ content, onChange, onImageUpload }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Placeholder.configure({
        placeholder: 'Tell your story...',
      }),
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[50vh]',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
  });

  // Update content if it changes externally (e.g. loading draft)
  useEffect(() => {
    if (editor && content && editor.isEmpty) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      if (input.files?.length) {
        const file = input.files[0];
        const url = await onImageUpload(file);
        if (url && editor) {
          editor.chain().focus().setImage({ src: url }).run();
        }
      }
    };
    input.click();
  };

  if (!editor) return null;

  return (
    <div className="relative">
      {editor && (
        <BubbleMenu editor={editor}>
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1 hover:bg-gray-700 rounded ${editor.isActive('bold') ? 'text-blue-400' : ''}`}
          >
            <Bold size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1 hover:bg-gray-700 rounded ${editor.isActive('italic') ? 'text-blue-400' : ''}`}
          >
            <Italic size={18} />
          </button>
          <div className="w-px h-4 bg-gray-700 mx-1" />
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-1 hover:bg-gray-700 rounded ${editor.isActive('heading', { level: 1 }) ? 'text-blue-400' : ''}`}
          >
            <Heading1 size={18} />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1 hover:bg-gray-700 rounded ${editor.isActive('heading', { level: 2 }) ? 'text-blue-400' : ''}`}
          >
            <Heading2 size={18} />
          </button>
          <div className="w-px h-4 bg-gray-700 mx-1" />
          <button
            onClick={handleImageUpload}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <ImageIcon size={18} />
          </button>
        </BubbleMenu>
      )}
      
      <EditorContent editor={editor} />
      
      {/* Floating Action Button for Image (Medium style side button) */}
      <div className="fixed bottom-10 right-10 md:hidden">
        <button onClick={handleImageUpload} className="bg-green-600 text-white p-4 rounded-full shadow-lg">
          <ImageIcon size={24} />
        </button>
      </div>
    </div>
  );
}