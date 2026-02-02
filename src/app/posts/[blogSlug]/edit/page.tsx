"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TiptapEditor from "@/core/components/molecule/dashboard/editor/tipTapEditor";
import { getPost, getUserPost } from "@/core/lib/api-client";

export default function EditPage({ params }: { params: { blogSlug: string } }) {
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState<
    "Saved" | "Saving..." | "Draft" | "Published" | "Error"
  >("Draft");
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      alert("Your session has expired. Please log in again.");
      router.push("/login");
    }
  }, [router.push]);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const response = await getUserPost(params.blogSlug);
        if ("post" in response) {
          setPost(response.post);
          setTitle(response.post.title || "");
        } else {
          alert("Post not found");
          router.push("/me/stories");
        }
      } catch (error) {
        console.error("Failed to load post", error);
        alert("Failed to load post");
        router.push("/me/stories");
      } finally {
        setLoading(false);
      }
    };

    if (params.blogSlug) {
      loadPost();
    }
  }, [params.blogSlug, router.push]);

  if (loading) {
    return (
      <div className="flex items-center justify-center pt-20 text-gray-400 animate-pulse">
        Loading post...
      </div>
    );
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div>
      <header className="h-16 flex items-center justify-between border-b">
        <div className="flex items-center space-x-6">
          <span className="text-sm text-gray-500">Editing: {post.title}</span>
        </div>

        <div className="flex items-center space-x-6">
          <span className="text-xs text-gray-400 italic">{saveStatus}</span>
          <span className="text-xs text-gray-500 font-medium">
            {title
              .trim()
              .split(/\s+/)
              .filter((w) => w.length > 0).length + wordCount}{" "}
            words
          </span>
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

        <TiptapEditor
          postId={post._id}
          onStatusChange={setSaveStatus}
          onWordCountChange={setWordCount}
          onReady={() => {}}
        />
      </main>
    </div>
  );
}
