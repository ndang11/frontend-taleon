// src/app/new-story/page.tsx
"use client";

import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { AlertDialog } from "@/components/ui/AlertDialog";
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
  const [saveStatus, setSaveStatus] = useState<
    "Saved" | "Saving..." | "Draft" | "Published" | "Archived" | "Error"
  >("Draft");
  const [wordCount, setWordCount] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

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
            const postData = response.post;
            setPostId(postData._id);
            setTitle(postData.title || "");
            // Load content into editor if available
            if (editorRef.current && postData.content) {
              editorRef.current.setContent(postData.content);
            }
            setSaveStatus(
              (postData.status.charAt(0).toUpperCase() +
                postData.status.slice(1)) as any,
            );
          }
        } else {
          // Creating new post
          // Use TipTap JSON format for initial content to ensure compatibility
          const initialContent = { type: "doc", content: [] };
          const res: any = await fetcher.post("/posts", {
            title: "",
            content: JSON.stringify(initialContent),
            category: "General",
          });

          // Handle both wrapped { post: ... } and direct post response
          const newPost = res.post || res;
          setPostId(newPost._id);
          // Update URL to include edit parameter for refresh safety
          window.history.replaceState(
            null,
            "",
            `/new-story?edit=${newPost._id}`,
          );
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

    // Get content as HTML from editor for consistency
    const content = editorRef.current?.getHTML();

    // Validate content is not empty HTML - strip HTML tags and check for actual text
    const stripHtml = (html: string) => {
      return html
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    };

    const textContent = content ? stripHtml(content) : "";
    const isEmptyContent = !content || textContent.length === 0;

    if (isEmptyContent) {
      setSaveStatus("Error");
      alert("Please add some content before publishing!");
      return;
    }

    setIsPublishing(true);
    try {
      console.log(
        "[handlePublish] Saving content to database:",
        content.substring(0, 100),
      );

      // Save as HTML for both autosave and publish to ensure consistency
      await fetcher.patch(`/posts/${postId}/autosave`, {
        content: content, // Always send HTML string
        title,
      });
      console.log("[handlePublish] Content saved successfully");

      // Now publish the post with the same HTML content
      await fetcher.patch(`/posts/${postId}/publish`, {
        title,
        content: content, // Same HTML content
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

  // Medium-style reading time calculation (approx 200 words per minute)
  const readingTime = Math.max(1, Math.ceil(totalWords / 200));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      {/* Medium-style Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
        <div className="max-w-screen-xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left side - Back button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>

          {/* Right side - Status & Actions */}
          <div className="flex items-center gap-3">
            {/* Save Status Indicator */}
            {saveStatus !== "Draft" && (
              <span
                className={`text-xs font-medium px-2 py-1 rounded ${
                  saveStatus === "Published"
                    ? "text-green-700 bg-green-50"
                    : saveStatus === "Saving..."
                      ? "text-amber-700 bg-amber-50"
                      : saveStatus === "Saved"
                        ? "text-gray-600 bg-gray-50"
                        : saveStatus === "Error"
                          ? "text-red-700 bg-red-50"
                          : "text-gray-500"
                }`}
              >
                {saveStatus === "Saving..." ? "Saving..." : saveStatus}
              </span>
            )}

            {/* Reading Time */}
            <span className="text-xs text-gray-400 hidden sm:inline">
              {readingTime} min read
            </span>

            {/* Save Draft Button */}
            <button
              onClick={handleSaveDraft}
              disabled={isPublishing}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
              Save
            </button>

            {/* Publish Button */}
            <button
              onClick={handlePublish}
              disabled={isPublishing || !title.trim()}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium rounded-full transition-all duration-200"
            >
              {isPublishing ? "Publishing..." : "Publish"}
            </button>

            {/* More Options Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                    <button
                      onClick={() => {
                        handleArchive();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Archive story
                    </button>
                    <button
                      onClick={() => {
                        router.push("/me/stories");
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      View all stories
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Medium-style centered layout */}
      <main className="pt-24 pb-20 min-h-screen bg-white">
        <div className="max-w-[680px] mx-auto px-6">
          {/* Title - Medium-style large serif title */}
          <div className="mb-8">
            <textarea
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              rows={1}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${target.scrollHeight}px`;
              }}
              className="w-full text-[42px] md:text-[48px] font-serif font-bold outline-none placeholder:text-gray-200 text-gray-900 leading-tight resize-none border-none bg-transparent"
              style={{ minHeight: "56px" }}
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
        </div>
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
        <div className="flex items-center justify-center h-screen bg-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <NewStoryContent />
    </Suspense>
  );
}
