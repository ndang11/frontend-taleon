"use client";

import { ArrowLeft, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Editor from "@/components/Editor";
import {
  fetcher,
  getPost,
  type Post,
  uploadPostImage,
} from "@/core/lib/api-client";

export default function NewStoryPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [postId, setPostId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Draft");
  const [isSaving, setIsSaving] = useState(false);

  // Initialize: Fetch existing post OR create a new draft immediately
  useEffect(() => {
    const initPost = async () => {
      try {
        if (editId) {
          const data = await getPost(editId);
          if ("post" in data && data.post) {
            const post: Post = data.post;
            setPostId(post._id);
            setTitle(post.title || "");
            setContent(JSON.stringify(post.content) || "");
            setStatus(post.status === "published" ? "Published" : "Draft");
          }
        } else {
          // Create a new draft immediately (Medium logic)
          // Use TipTap JSON format for initial content to ensure compatibility
          const initialContent = { type: "doc", content: [] };
          const newPost = await fetcher.post<Post>("/posts", {
            title: "Untitled Story",
            content: JSON.stringify(initialContent),
            category: "General",
          });
          setPostId(newPost._id);
          // Update URL without reload
          window.history.replaceState(
            null,
            "",
            `/new-story?edit=${newPost._id}`,
          );
        }
      } catch (error) {
        console.error("Failed to initialize story:", error);
      }
    };

    initPost();
  }, [editId]);

  // Auto-save logic
  const handleSave = useCallback(
    async (newContent?: any, newTitle?: string) => {
      if (!postId) return;

      setIsSaving(true);
      try {
        await fetcher.patch(`/posts/${postId}/autosave`, {
          content: newContent || content,
          title: newTitle || title,
        });
        setStatus("Saved");
      } catch (error) {
        setStatus("Error saving");
      } finally {
        setTimeout(() => setIsSaving(false), 1000);
      }
    },
    [postId, content, title],
  );

  const handlePublish = async () => {
    if (!postId) return;
    try {
      setIsSaving(true);
      await fetcher.patch(`/posts/${postId}`, { status: "published" });
      router.push(`/me`); // Redirect to dashboard/my stories
    } catch (error) {
      alert("Failed to publish story");
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const data = await uploadPostImage(file);
      return data.url; // Assuming API returns { url: "..." }
    } catch (error) {
      console.error("Image upload failed:", error);
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur z-50">
        <div className="flex items-center gap-4">
          <Link href="/me" className="text-gray-500 hover:text-gray-900">
            <ArrowLeft size={20} />
          </Link>
          <span className="text-sm text-gray-500">
            {isSaving ? "Saving..." : status}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handlePublish}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
          >
            Publish
          </button>
          <button className="text-gray-500 hover:text-gray-900">
            <MoreHorizontal size={20} />
          </button>
        </div>
      </nav>

      {/* Editor Area */}
      <main className="max-w-3xl mx-auto px-6 py-12">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            handleSave(undefined, e.target.value);
          }}
          className="w-full text-4xl md:text-5xl font-serif font-bold placeholder:text-gray-300 border-none focus:ring-0 p-0 mb-6 text-gray-900"
        />

        {postId && (
          <Editor
            content={content}
            onChange={(json) => {
              setContent(json);
              handleSave(json);
            }}
            onImageUpload={handleImageUpload}
          />
        )}
      </main>
    </div>
  );
}
