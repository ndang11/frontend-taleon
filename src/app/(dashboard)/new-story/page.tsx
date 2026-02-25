"use client";

import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Loader2, MoreHorizontal } from "lucide-react";
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
  const queryClient = useQueryClient();

  const [showSessionExpired, setShowSessionExpired] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setShowSessionExpired(true);
    }
  }, []);

  const [postId, setPostId] = useState<string | null>(null);
  const [postStatus, setPostStatus] = useState<
    "draft" | "published" | "unpublished" | "archived"
  >("draft");
  const [title, setTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState<
    "Saved" | "Saving..." | "Draft" | "Published" | "Archived" | "Error"
  >("Draft");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const editorRef = useRef<any>(null);

  useEffect(() => {
    const initPost = async () => {
      try {
        if (editPostId) {
          const response = await getPost(editPostId);
          if ("post" in response) {
            const postData = response.post;
            setPostId(postData._id);
            setPostStatus(postData.status || "draft");
            const postTitle =
              postData.title && postData.title !== "Untitled Story"
                ? postData.title
                : "";
            setTitle(postTitle);
            if (editorRef.current && postData.content) {
              editorRef.current.setContent(postData.content);
            }
            setSaveStatus(
              (postData.status.charAt(0).toUpperCase() +
                postData.status.slice(1)) as any,
            );
          }
        } else {
          const initialContent = { type: "doc", content: [] };
          const res: any = await fetcher.post("/posts", {
            title: "",
            content: JSON.stringify(initialContent),
            category: "General",
          });

          const newPost = res.post || res;
          setPostId(newPost._id);
          setPostStatus("draft");
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

  // Format last saved time
  const formatLastSaved = (date: Date | null): string => {
    if (!date) return "";
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return "just now";
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  const handlePublish = async () => {
    if (!postId || !title.trim()) {
      setSaveStatus("Error");
      alert("Please add a title before publishing!");
      return;
    }

    const content = editorRef.current?.getHTML();

    const isEmptyContent =
      !content ||
      content === "" ||
      content === "<p></p>" ||
      content === "<p><br></p>" ||
      content === '<p class="p-"></p>';
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
      if (postStatus === "published") {
        // Republish existing live story by overwriting the same record.
        await fetcher.patch(`/posts/${postId}`, {
          title,
          content,
          status: "published",
        });
      } else {
        // Save draft content first, then publish for first-time publish flow.
        await fetcher.patch(`/posts/${postId}/autosave`, {
          content,
          title,
        });
        await fetcher.patch(`/posts/${postId}/publish`, {
          title,
          content,
        });
      }

      // Update local state
      setSaveStatus("Published");
      setPostStatus("published");
      setLastSaved(new Date());

      // Invalidate queries to refresh the stories list
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["my-posts"] }),
        queryClient.invalidateQueries({ queryKey: ["published-posts"] }),
        queryClient.invalidateQueries({ queryKey: ["tenant-published-posts"] }),
        queryClient.refetchQueries({ queryKey: ["my-posts"], type: "active" }),
        queryClient.refetchQueries({
          queryKey: ["tenant-published-posts"],
          type: "active",
        }),
      ]);

      setShowSuccess(true);
    } catch (err: any) {
      console.error("Publish failed", err);
      setSaveStatus("Error");
      const errorMessage =
        err.message || "Failed to publish. Please try again.";
      alert(errorMessage);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    // Invalidate queries before navigating
    queryClient.invalidateQueries({ queryKey: ["my-posts"] });
    queryClient.invalidateQueries({ queryKey: ["tenant-published-posts"] });
    router.push("/me/stories");
  };

  const handleSaveDraft = async () => {
    if (!postId || isSaving || isPublishing) return;

    setIsSaving(true);
    setSaveStatus("Saving...");
    try {
      const content = editorRef.current?.getHTML();
      await fetcher.patch(`/posts/${postId}/autosave`, {
        content,
        title,
        status: "draft",
      });
      setSaveStatus("Saved");
      setPostStatus("draft");
      setLastSaved(new Date());
    } catch (err) {
      console.error("Failed to save draft:", err);
      setSaveStatus("Error");
    } finally {
      setIsSaving(false);
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
        editorRef.current.focus();
        break;
    }
  };

  const totalWords =
    title
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length + wordCount;

  const readingTime = Math.max(1, Math.ceil(totalWords / 200));

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
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 mb-8 -mx-4 sm:-mx-6 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between max-w-[680px] mx-auto">
          <div className="flex items-center gap-3">
            {/* Back button */}
            <button
              onClick={() => router.push("/me/stories")}
              className="p-2 -ml-2 text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="Go back to stories"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            {/* Last saved indicator */}
            {lastSaved && (
              <span className="text-xs text-gray-400 hidden sm:inline-flex items-center gap-1">
                <Check className="w-3 h-3" />
                Saved {formatLastSaved(lastSaved)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs text-gray-400 hidden md:inline">
              {readingTime} min read
            </span>

            {/* Status Badge */}
            {postStatus === "published" && (
              <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-700">
                Published
              </span>
            )}

            {/* Save as Draft Button - Secondary gray */}
            <button
              onClick={handleSaveDraft}
              disabled={isSaving || isPublishing}
              className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              aria-label="Save as draft"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Save as Draft
            </button>

            {/* Publish Button - Primary green */}
            <button
              onClick={handlePublish}
              disabled={isPublishing || isSaving || !title.trim()}
              className="px-4 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-medium rounded-full transition-all duration-200 flex items-center gap-2"
            >
              {isPublishing && <Loader2 className="w-4 h-4 animate-spin" />}
              {postStatus === "published" ? "Update & Publish" : "Publish"}
            </button>

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

      <div className="flex justify-center">
        <div className="w-full max-w-[680px] px-4 sm:px-6 xl:pl-16">
          <div className="mb-10">
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
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

          {postId ? (
            <div className="relative flex">
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
