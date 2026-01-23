"use client";

import { useMutation } from "@tanstack/react-query";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { Post } from "../lib/api-client";
import { createPost, updatePost } from "../lib/api-client";
import { getToken } from "../lib/auth";

export function EditorComponent({ post }: { post?: Post }) {
  const [title, setTitle] = useState(post?.title || "");
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const token = getToken();

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Tell your story...",
      }),
    ],
    content: post?.content || "",
    immediatelyRender: false,
    onUpdate: () => {
      setSaved(false);
      autoSave();
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: {
      title: string;
      content: string;
      status?: "draft" | "published" | "unpublished";
    }) =>
      createPost(
        {
          title: data.title,
          content: data.content,
          status: data.status || "draft",
        },
        token || "",
      ),
    onSuccess: (_newPost) => {
      setSaved(true);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: {
      title: string;
      content: string;
      status?: "draft" | "published" | "unpublished";
    }) =>
      post
        ? updatePost(
            post.id,
            { title: data.title, content: data.content, status: data.status },
            token || "",
          )
        : Promise.reject(new Error("Post is undefined")),
    onSuccess: () => {
      setSaved(true);
    },
  });

  const autoSave = useCallback(() => {
    const content = editor?.getHTML() || "";
    if (post) {
      updateMutation.mutate({ title, content });
    } else {
      createMutation.mutate({ title, content });
    }
  }, [editor, post, title, updateMutation, createMutation]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (title || editor?.getText()) {
        autoSave();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [autoSave, editor?.getText, title]);

  const handlePublish = () => {
    const content = editor?.getHTML() || "";
    if (post) {
      updateMutation.mutate({ title, content, status: "published" });
    } else {
      createMutation.mutate({ title, content, status: "published" });
    }
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="text-xl font-bold text-black">
              Taleon
            </Link>
            <span className="text-gray-600">Draft in Your Blog</span>
          </div>
          <button
            type="button"
            onClick={handlePublish}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800"
          >
            Publish
          </button>
        </div>
      </header>
      <div className="max-w-2xl mx-auto px-6 py-8 text-xl text-black">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-4xl font-serif border-none outline-none mb-8 text-black"
        />
        <EditorContent
          editor={editor}
          className="prose prose-lg max-w-none text-xl border border-gray-300 text-black"
        />
        {saved && <div className="text-sm text-gray-700 mt-4">Saved</div>}
      </div>
    </div>
  );
}
