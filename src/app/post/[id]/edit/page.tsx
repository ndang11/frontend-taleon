"use client";

import { ArrowLeft, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { AlertDialog } from "@/components/ui/AlertDialog";
import TiptapEditor from "@/core/components/molecule/dashboard/editor/tipTapEditor";
import { getPost, publishPost, updatePost } from "@/core/lib/api-client";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string;

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [initialContent, setInitialContent] = useState<any>(null);
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    "Saved" | "Saving..." | "Draft" | "Published" | "Error"
  >("Draft");
  const [wordCount, setWordCount] = useState(0);
  const [showSessionExpired, setShowSessionExpired] = useState(false);
  const [showPostNotFound, setShowPostNotFound] = useState(false);
  const [showLoadFailed, setShowLoadFailed] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const editorRef = useRef<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setShowSessionExpired(true);
    }
  }, []);

  useEffect(() => {
    const loadPost = async () => {
      if (!postId) return;

      try {
        const response = await getPost(postId);

        const postData = response as any;

        if ("post" in response) {
          const loadedPost = (response as any).post;
          setPost(loadedPost);
          setTitle(loadedPost.title || "");
          setCoverImage(loadedPost.image || null);

          if (loadedPost.content) {
            try {
              const content =
                typeof loadedPost.content === "string"
                  ? JSON.parse(loadedPost.content)
                  : loadedPost.content;
              setInitialContent(content);
            } catch (e) {
              // If JSON parsing fails, use the content as-is (it might be HTML)
              console.warn(
                "Failed to parse content as JSON, using as-is:",
                loadedPost.content,
              );
              setInitialContent(loadedPost.content);
            }
          }
        } else if (postData._id) {
          setPost(postData);
          setTitle(postData.title || "");
          setCoverImage(postData.image || null);

          if (postData.content) {
            try {
              const content =
                typeof postData.content === "string"
                  ? JSON.parse(postData.content)
                  : postData.content;
              setInitialContent(content);
            } catch (e) {
              // If JSON parsing fails, use the content as-is (it might be HTML)
              console.warn(
                "Failed to parse content as JSON, using as-is:",
                postData.content,
              );
              setInitialContent(postData.content);
            }
          }
        } else {
          setShowPostNotFound(true);
        }
      } catch (error) {
        console.error("Failed to load post", error);
        setShowLoadFailed(true);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      loadPost();
    }
  }, [postId]);

  const handleSave = useCallback(async () => {
    if (!post) return;

    const content = editorRef.current?.getHTML();
    const jsonContent = editorRef.current?.getJSON();

    setSaveStatus("Saving...");

    try {
      await updatePost(postId, {
        title,
        content: jsonContent,
        image: coverImage || undefined,
      });
      setSaveStatus("Saved");
    } catch (error) {
      console.error("Failed to save:", error);
      setSaveStatus("Error");
    }
  }, [post, postId, title, coverImage]);

  const handlePublish = useCallback(async () => {
    if (!post) return;

    setSaveStatus("Saving...");
    try {
      const jsonContent = editorRef.current?.getJSON();
      await updatePost(postId, {
        title,
        content: jsonContent,
        image: coverImage || undefined,
      });

      await publishPost(postId);
      setSaveStatus("Published");

      // Redirect to the post page
      router.push(`/post/${postId}`);
    } catch (error) {
      console.error("Failed to publish:", error);
      setSaveStatus("Error");
    }
  }, [post, postId, title, coverImage, router]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (post && saveStatus !== "Saving...") {
        handleSave();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [post, handleSave, saveStatus]);

  const totalWords =
    title
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0).length + wordCount;

  // Medium-style reading time calculation (approx 200 words per minute)
  const readingTime = Math.max(1, Math.ceil(totalWords / 200));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex items-center justify-center pt-20">
        <AlertDialog
          isOpen={showPostNotFound}
          onClose={() => {
            setShowPostNotFound(false);
            router.push("/me/stories");
          }}
          title="Post Not Found"
          message="This post could not be found."
          buttonText="Go to Stories"
          type="error"
          onButtonClick={() => {
            setShowPostNotFound(false);
            router.push("/me/stories");
          }}
        />
        <AlertDialog
          isOpen={showLoadFailed}
          onClose={() => {
            setShowLoadFailed(false);
            router.push("/me/stories");
          }}
          title="Failed to Load"
          message="Unable to load the post. Please try again."
          buttonText="Go to Stories"
          type="error"
          onButtonClick={() => {
            setShowLoadFailed(false);
            router.push("/me/stories");
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
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
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Save
            </button>

            {/* Publish Button */}
            <button
              onClick={handlePublish}
              className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-full transition-all duration-200"
            >
              Publish
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

          {coverImage && (
            <div className="relative w-full h-64 mb-6 rounded-xl overflow-hidden">
              <Image
                src={coverImage}
                alt="Cover"
                fill
                className="object-cover"
              />
              <button
                onClick={() => setCoverImage(null)}
                className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
              >
                ×
              </button>
            </div>
          )}

          <TiptapEditor
            postId={postId}
            initialContent={initialContent}
            contentFormat="json"
            onStatusChange={setSaveStatus}
            onWordCountChange={setWordCount}
            onReady={(controls: any) => {
              editorRef.current = controls;
            }}
          />
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
    </div>
  );
}
