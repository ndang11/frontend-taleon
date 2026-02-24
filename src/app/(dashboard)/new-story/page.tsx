// src/app/(dashboard)/new-story/page.tsx
"use client";

import { Bell, MoreHorizontal } from "lucide-react";
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
  const [showSuccess, setShowSuccess] = useState(false);

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
            // If title is "Untitled Story" or empty, show empty string (placeholder will show "Title")
            const postTitle =
              postData.title && postData.title !== "Untitled Story"
                ? postData.title
                : "";
            setTitle(postTitle);
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

    // Validate content is not empty HTML
    const isEmptyContent =
      !content ||
      content === "" ||
      content === "<p></p>" ||
      content === "<p><br></p>" ||
      content === '<p class="p-"></p>';

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

  const handleAddBlock = (type: string) => {
    if (!editorRef.current) return;

    switch (type) {
      case "paragraph":
        editorRef.current.focus();
        break;
      case "heading":
        editorRef.current.toggleHeading?.(1);
        break;
      case "image":
        editorRef.current.insertImage?.("", "");
        break;
      case "quote":
        editorRef.current.toggleBlockquote?.();
        break;
      case "code":
        editorRef.current.toggleCodeBlock?.();
        break;
      case "divider":
        // Add horizontal rule if available
        editorRef.current.focus();
        break;
    }
  };

  const totalWords =
    title
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length + wordCount;

  // Medium-style reading time calculation (approx 200 words per minute)
  const readingTime = Math.max(1, Math.ceil(totalWords / 200));

  // Get user initials for avatar
  const getUserInitial = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <>
      {/* Editor Header Bar - Fixed within the content area */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 mb-8 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between max-w-[680px] mx-auto">
          {/* Left side - Status */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400 font-normal">
              {saveStatus === "Draft"
                ? "Draft"
                : saveStatus === "Saving..."
                  ? "Saving..."
                  : saveStatus === "Saved"
                    ? "Saved"
                    : saveStatus === "Published"
                      ? "Published"
                      : saveStatus === "Error"
                        ? "Error"
                        : "Draft"}
            </span>
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Reading Time - Hidden on mobile */}
            <span className="text-xs text-gray-400 hidden md:inline">
              {readingTime} min read
            </span>

            {/* Publish Button */}
            <button
              onClick={handlePublish}
              disabled={isPublishing || !title.trim()}
              className="px-4 py-1.5 bg-green-500 hover:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium rounded-full transition-all duration-200"
            >
              {isPublishing ? "Publishing..." : "Publish"}
            </button>

            {/* Three-dot menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="More options"
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
                        handleSaveDraft();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Save as draft
                    </button>
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
      </div>

      {/* Main Editor Content - Medium-style centered column */}
      <div className="flex justify-center">
        <div className="w-full max-w-[680px] px-4 sm:px-6 xl:pl-16">
          {/* Title - Medium-style large serif title */}
          <div className="mb-10">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
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
              }}
              className="w-full text-[48px] sm:text-[52px] font-serif font-bold outline-none placeholder:text-gray-300 placeholder:font-bold text-gray-900 leading-[1.1] resize-none border-none bg-transparent tracking-tight"
              style={{ minHeight: "64px" }}
            />
          </div>

          {/* Editor with Plus Button */}
          {postId ? (
            <div className="relative flex">
              {/* Plus Button - Left of body */}
              <div className="absolute -left-12 top-0 hidden xl:block">
                <div className="relative">
                  <button
                    onClick={() => handleAddBlock("paragraph")}
                    className="w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 transition-colors"
                    aria-label="Add block"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="12" y1="5" x2="12" y2="19"></line>
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Editor Body */}
              <div className="flex-1 min-w-0">
                <TiptapEditor
                  postId={postId}
                  onStatusChange={setSaveStatus as (status: string) => void}
                  onWordCountChange={setWordCount}
                  onReady={(controls) => {
                    editorRef.current = controls;
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center pt-20 text-gray-400 animate-pulse">
              Preparing your draft...
            </div>
          )}
        </div>
      </div>

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
        <div className="flex items-center justify-center h-full bg-white">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <NewStoryContent />
    </Suspense>
  );
}
