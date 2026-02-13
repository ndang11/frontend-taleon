// src/app/new-story/page.tsx
"use client";

import {
  Archive,
  Bold,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  List,
  ListOrdered,
  Quote,
  Redo,
  Undo,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { AlertDialog } from "@/components/ui/AlertDialog";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { SuccessDialog } from "@/components/ui/SuccessDialog";
import { useAuth } from "@/context/auth.provider";
import TiptapEditor from "@/core/components/molecule/dashboard/editor/tipTapEditor";
import { fetcher, getPost } from "@/core/lib/api-client";

function NewStoryContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editPostId = searchParams?.get("edit");

  const [showSessionExpired, setShowSessionExpired] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setShowSessionExpired(true);
    }
  }, []);

  const [postId, setPostId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [coverImage, setCoverImage] = useState<string | undefined>(undefined);
  const [saveStatus, setSaveStatus] = useState<
    "Saved" | "Saving..." | "Draft" | "Published" | "Archived" | "Error"
  >("Draft");
  const [wordCount, setWordCount] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Create a ref to the editor controller
  const editorRef = useRef<any>(null);

  // Load existing post if editing
  useEffect(() => {
    const initPost = async () => {
      try {
        if (editPostId) {
          // Editing existing post
          const response = await getPost(editPostId);
          if ("post" in response) {
            setPostId(response.post._id);
            setTitle(response.post.title || "");
            setCoverImage(response.post.image);
            // Load content into editor if available
            if (editorRef.current && response.post.content) {
              editorRef.current.setContent(response.post.content);
            }
            setSaveStatus(
              (response.post.status.charAt(0).toUpperCase() +
                response.post.status.slice(1)) as any,
            );
          }
        } else {
          // Creating new post
          const res: any = await fetcher.post("/posts", {
            title: "Untitled Story",
            content: "<p></p>", // Default empty content
            category: "General",
          });
          setPostId(res._id);
        }
      } catch (err) {
        console.error("Failed to initialize post:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initPost();
  }, [editPostId]);

  const handlePublish = async () => {
    if (!postId || !title.trim()) {
      setSaveStatus("Error");
      alert("Please add a title before publishing!");
      return;
    }

    // Get content as HTML from editor
    const content = editorRef.current?.getHTML();
    const isEmptyContent =
      !content ||
      content === "" ||
      content === "<p></p>" ||
      content === "<p><br></p>";

    if (isEmptyContent) {
      setSaveStatus("Error");
      alert("Please add some content before publishing!");
      return;
    }

    setIsPublishing(true);
    try {
      // CRITICAL: Save content with title FIRST before publishing
      // This ensures the content is saved in HTML format
      console.log(
        "[handlePublish] Saving content to database:",
        content.substring(0, 100),
      );
      await fetcher.patch(`/posts/${postId}/autosave`, {
        content,
        title,
        image: coverImage,
      });
      console.log("[handlePublish] Content saved successfully");

      // Now publish the post
      await fetcher.patch(`/posts/${postId}/publish`, {
        title,
        content,
        image: coverImage,
      });
      console.log("[handlePublish] Post published successfully");

      setSaveStatus("Published");
      setShowSuccess(true);
    } catch (err: any) {
      console.error("Publish failed", err);
      setSaveStatus("Error");
      // Show user-friendly error
      const errorMessage =
        err.message || "Failed to publish. Please try again.";
      alert(errorMessage);
    } finally {
      setIsPublishing(false);
    }
  };

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.push("/dashboard");
  };

  const handleSaveDraft = async () => {
    if (!postId) return;
    setSaveStatus("Saving...");
    try {
      // Get content as HTML
      const content = editorRef.current?.getHTML();
      await fetcher.patch(`/posts/${postId}/autosave`, {
        content,
        title,
        status: "draft",
        image: coverImage,
      });
      setSaveStatus("Draft");
    } catch (err) {
      console.error("Failed to save draft:", err);
      setSaveStatus("Error");
    }
  };

  const handleArchive = async () => {
    if (!postId) return;
    setSaveStatus("Saving...");
    try {
      const content = editorRef.current?.getJSON();
      await fetcher.patch(`/posts/${postId}/archive`, {
        content,
        title,
      });
      setSaveStatus("Archived");
      setShowSuccess(true);
    } catch (err) {
      console.error("Failed to archive:", err);
      setSaveStatus("Error");
    }
  };

  const totalWords =
    title
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length + wordCount;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      {/* Minimal Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Status & Word Count */}
          <div className="flex items-center gap-4">
            <span
              className={`text-xs font-medium ${
                saveStatus === "Published"
                  ? "text-green-600"
                  : saveStatus === "Saving..."
                    ? "text-amber-600"
                    : saveStatus === "Error"
                      ? "text-red-600"
                      : "text-gray-500"
              }`}
            >
              {saveStatus === "Saving..." ? "● Saving..." : saveStatus}
            </span>
            <span className="text-xs text-gray-400">|</span>
            <span className="text-xs text-gray-500">{totalWords} words</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveDraft}
              disabled={isPublishing}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Save Draft
            </button>
            <button
              onClick={handleArchive}
              disabled={isPublishing}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Archive
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing || !title.trim()}
              className="px-5 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            >
              {isPublishing ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Title */}
        <input
          type="text"
          placeholder="Tell your story..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              editorRef.current?.focus();
            }
          }}
          className="w-full text-4xl md:text-5xl font-serif font-bold outline-none mb-8 placeholder:text-gray-200 text-gray-900"
        />

        {/* Cover Image */}
        <div className="mb-8">
          <ImageUpload
            value={coverImage}
            onChange={(value) => setCoverImage(value)}
            onRemove={() => setCoverImage(undefined)}
            disabled={isPublishing}
          />
        </div>

        {/* Editor */}
        {postId ? (
          <div className="relative">
            <TiptapEditor
              postId={postId}
              onStatusChange={setSaveStatus as (status: string) => void}
              onWordCountChange={setWordCount}
              onReady={(controls) => {
                editorRef.current = controls;
              }}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center pt-20 text-gray-400 animate-pulse">
            Preparing your draft...
          </div>
        )}
      </main>

      <AlertDialog
        isOpen={showSessionExpired}
        onClose={() => {
          setShowSessionExpired(false);
          router.push("/login");
        }}
        title="Session Expired"
        message="Your session has expired. Please log in again."
        buttonText="Login"
        type="warning"
        onButtonClick={() => {
          setShowSessionExpired(false);
          router.push("/login");
        }}
      />
      <SuccessDialog
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        title="Published Successfully!"
        message="Your story has been published and is now live."
        buttonText="Go to Dashboard"
        onButtonClick={handleSuccessClose}
      />
    </>
  );
}

export default function NewStoryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <NewStoryContent />
    </Suspense>
  );
}
