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
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-xl font-bold text-gray-900 dark:text-white"
              >
                Taleon
              </Link>
              <span className="text-gray-600 dark:text-gray-400">
                {post ? "Editing Post" : "Writing Mode"}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {saved ? "Saved" : "Saving..."}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {editor
                  ?.getText()
                  .split(" ")
                  .filter((word) => word.length > 0).length || 0}{" "}
                words
              </div>
              <button
                type="button"
                onClick={handlePublish}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <input
          type="text"
          placeholder="What's your story about?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-4xl font-bold border-none outline-none mb-8 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
        />

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <EditorContent
            editor={editor}
            className="prose max-w-none text-gray-900 dark:text-white"
          />

          {!editor?.getText() && (
            <div className="mt-8 text-center py-8 text-gray-500 dark:text-gray-400">
              <p>Start writing your story...</p>
            </div>
          )}
        </div>

        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Reading time: ~
          {Math.ceil(
            (editor
              ?.getText()
              .split(" ")
              .filter((word) => word.length > 0).length || 0) / 200,
          )}{" "}
          min
        </div>
      </div>
    </div>
  );
}
