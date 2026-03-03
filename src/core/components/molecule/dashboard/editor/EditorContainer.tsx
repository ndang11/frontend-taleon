"use client";

import { Plus } from "lucide-react";
import { useRef, useState } from "react";

interface EditorContainerProps {
  title: string;
  onTitleChange: (title: string) => void;
  children: React.ReactNode;
  onAddBlock?: (type: string) => void;
}

export function EditorContainer({
  title,
  onTitleChange,
  children,
  onAddBlock,
}: EditorContainerProps) {
  const [showBlockMenu, setShowBlockMenu] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Move focus to the editor body
      const editorElement = document.querySelector(
        ".ProseMirror",
      ) as HTMLElement;
      if (editorElement) {
        editorElement.focus();
      }
    }
  };

  return (
    <div className="editor-container w-full">
      {/* Title Section */}
      <div className="mb-10">
        <input
          ref={titleRef}
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          onKeyDown={handleTitleKeyDown}
          className="w-full text-[48px] sm:text-[52px] font-serif font-bold outline-none placeholder:text-gray-300 placeholder:font-bold text-gray-900 leading-[1.1] resize-none border-none bg-transparent tracking-tight"
          style={{ minHeight: "64px" }}
        />
      </div>

      {/* Body Section with Plus Button */}
      <div className="relative flex">
        {/* Plus Button - Left of body */}
        <div className="absolute -left-12 top-0 hidden xl:block">
          <div className="relative">
            <button
              onClick={() => setShowBlockMenu(!showBlockMenu)}
              className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
              aria-label="Add block"
            >
              <Plus className="w-5 h-5" />
            </button>

            {showBlockMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowBlockMenu(false)}
                />
                <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-20">
                  <button
                    onClick={() => {
                      onAddBlock?.("paragraph");
                      setShowBlockMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Add paragraph
                  </button>
                  <button
                    onClick={() => {
                      onAddBlock?.("heading");
                      setShowBlockMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Add heading
                  </button>
                  <button
                    onClick={() => {
                      onAddBlock?.("image");
                      setShowBlockMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Add image
                  </button>
                  <button
                    onClick={() => {
                      onAddBlock?.("quote");
                      setShowBlockMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Add quote
                  </button>
                  <button
                    onClick={() => {
                      onAddBlock?.("code");
                      setShowBlockMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Add code block
                  </button>
                  <button
                    onClick={() => {
                      onAddBlock?.("divider");
                      setShowBlockMenu(false);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Add divider
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Editor Body */}
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
