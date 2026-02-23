"use client";

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

  if (loading) {
    return (
      <div className="flex items-center justify-center pt-20 text-gray-400 animate-pulse">
        Loading post...
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
      <header className="h-16 flex items-center justify-between border-b px-6">
        <div className="flex items-center space-x-6">
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700"
          >
            ← Back
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-xs text-gray-400 italic">{saveStatus}</span>
          <span className="text-xs text-gray-500 font-medium">
            {title
              .trim()
              .split(/\s+/)
              .filter((w: string) => w.length > 0).length + wordCount}{" "}
            words
          </span>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200"
          >
            Save Draft
          </button>
          <button
            onClick={handlePublish}
            className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
          >
            Publish
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-5xl font-serif font-bold outline-none mb-6 placeholder:text-gray-200"
        />

        {coverImage && (
          <div className="relative w-full h-64 mb-6 rounded-xl overflow-hidden">
            <Image src={coverImage} alt="Cover" fill className="object-cover" />
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
