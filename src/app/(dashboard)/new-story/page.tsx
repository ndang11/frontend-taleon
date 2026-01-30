// src/app/new-story/page.tsx
"use client";

import { Bold, Code, ImageIcon, Italic, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/auth.provider";
import TiptapEditor from "@/core/components/molecule/dashboard/editor/tipTapEditor";
import { fetcher } from "@/core/lib/api-client";

export default function NewStoryPage() {
  const { user } = useAuth();
  const [postId, setPostId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState<
    "Saved" | "Saving..." | "Draft" | "Published" | "Error"
  >("Draft");
  const [wordCount, setWordCount] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);

  // Create a ref to the editor controller
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const initPost = async () => {
      try {
        const res: any = await fetcher.post("/posts", {
          title: "Untitled Story",
          content: "content",
          category: "General",
        });
        setPostId(res._id);
      } catch (err) {
        console.error(err);
      }
    };
    initPost();
  }, []);

  const handlePublish = async () => {
    if (!postId || !title.trim()) {
      setSaveStatus("Error");
      return;
    }
    setIsPublishing(true);
    try {
      const content = editorRef.current?.getJSON();
      await fetcher.patch(`/posts/${postId}/autosave`, {
        content,
        title,
        status: "published",
      });
      setSaveStatus("Published");
    } catch (err) {
      console.error("Publish failed", err);
      setSaveStatus("Error");
    } finally {
      setIsPublishing(false);
    }
  };

  const totalWords =
    title
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length + wordCount;

  return (
    <>
      <header className="h-16 flex items-center justify-between border-b">
        <div className="flex items-center space-x-6">
          <div className="flex items-center border-l  space-x-1">
            <button
              onClick={() => editorRef.current?.toggleBold()}
              className="p-2 hover:bg-gray-100 rounded text-gray-600"
            >
              <Bold size={18} />
            </button>
            <button
              onClick={() => editorRef.current?.toggleItalic()}
              className="p-2 hover:bg-gray-100 rounded text-gray-600"
            >
              <Italic size={18} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded text-green-600">
              <ImageIcon size={18} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded text-blue-600">
              <Video size={18} />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded text-gray-400">
              <Code size={18} />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <span className="text-xs text-gray-400 italic">{saveStatus}</span>
          <span className="text-xs text-gray-500 font-medium">
            {totalWords} words
          </span>
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="bg-blue-600 hover:bg-blue-700 cursor-pointer disabled:bg-gray-400 text-white px-6 py-2 rounded-full text-sm font-medium transition-all"
          >
            {isPublishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </header>

      <main className="mx-auto">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              editorRef.current?.focus();
            }
          }}
          className="w-full text-5xl font-serif font-bold outline-none mb-6 placeholder:text-gray-200"
        />

        {postId ? (
          <TiptapEditor
            postId={postId}
            onStatusChange={setSaveStatus}
            onWordCountChange={setWordCount}
            onReady={(controls) => {
              editorRef.current = controls;
            }}
          />
        ) : (
          <div className="flex items-center justify-center pt-20 text-gray-400 animate-pulse">
            Preparing your draft...
          </div>
        )}
      </main>
    </>
  );
}
