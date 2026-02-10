"use client";

import {
  Bookmark,
  Eye,
  Heart,
  MessageCircle,
  MinusCircle,
  MoreHorizontal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Author {
  name: string;
  avatar?: string;
}

export interface PostCardData {
  _id: string;
  title: string;
  content?: string | null;
  contentObject?: TiptapContent | null;
  image?: string;
  author?: Author;
  createdAt: string;
  updatedAt?: string;
  readTime?: string;
  tags?: string[];
  slug: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
}

// Types for Tiptap/ProseMirror JSON content
interface TiptapNode {
  type?: string;
  text?: string;
  content?: TiptapNode[];
  attrs?: Record<string, unknown>;
}

interface TiptapContent {
  type?: string;
  content?: TiptapNode[];
  time?: number;
  version?: string;
}

// Recursively extract text from Tiptap/ProseMirror JSON nodes
function extractTextFromTiptap(node: TiptapNode | undefined): string {
  if (!node) return "";

  // If node has text content, return it
  if (node.text) return node.text;

  // If node has nested content, recursively extract text from all children
  if (node.content && Array.isArray(node.content)) {
    return node.content
      .map((child) => extractTextFromTiptap(child))
      .filter(Boolean)
      .join(" ");
  }

  return "";
}

// Helper function to extract text from content (handles both string and Tiptap/ProseMirror JSON)
function getPostExcerpt(
  content: string | TiptapContent | null | undefined,
): string {
  if (!content) return "";

  // If content is a string, strip HTML tags
  if (typeof content === "string") {
    return `${content.replace(/<[^>]*>?/gm, "").slice(0, 150)}...`;
  }

  // If content is a Tiptap/ProseMirror JSON object
  if (typeof content === "object" && content !== null) {
    // Handle Tiptap JSON format: { type: "doc", content: [...] }
    if (Array.isArray(content.content)) {
      const text = content.content
        .map((node: TiptapNode) => extractTextFromTiptap(node))
        .filter(Boolean)
        .join(" ");

      if (text) return `${text.slice(0, 150)}...`;
    }

    // Handle simple blocks format: { blocks: [...] }
    if (Array.isArray((content as Record<string, unknown>).blocks)) {
      const blocks = (content as Record<string, TiptapNode[]>).blocks;
      const text = blocks
        .map((block: TiptapNode) => extractTextFromTiptap(block))
        .filter(Boolean)
        .join(" ");

      if (text) return `${text.slice(0, 150)}...`;
    }
  }

  return "";
}

interface PostCardProps {
  post: PostCardData;
}

export function PostCard({ post }: PostCardProps) {
  // Strip HTML tags for the excerpt
  const excerpt = getPostExcerpt(post.content ?? post.contentObject ?? null);

  const date = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/post/${post._id}`}
      className="flex justify-between items-start py-8 border-b border-gray-100 group hover:bg-gray-50 transition-colors -mx-4 px-4 rounded-lg block"
    >
      <div className="flex-1 pr-8">
        {/* Author Info */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden relative">
            {post.author?.avatar ? (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500">
                {post.author?.name?.[0] || "U"}
              </div>
            )}
          </div>
          <span className="text-sm font-medium text-gray-900">
            {post.author?.name || "Anonymous"}
          </span>
          <span className="text-gray-400 text-xs">•</span>
          <span className="text-sm text-gray-500">{date}</span>
        </div>

        {/* Content */}
        <div className="block group-hover:opacity-90 transition-opacity">
          <h2 className="text-xl font-bold text-gray-900 mb-2 font-serif leading-tight">
            {post.title}
          </h2>
          <p className="text-gray-600 font-serif text-base mb-4 line-clamp-2 md:line-clamp-3">
            {excerpt}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-3">
            {post.tags && post.tags.length > 0 && (
              <span className="inline-block bg-gray-100 rounded-full px-2 py-1 text-xs font-medium text-gray-600">
                {post.tags[0]}
              </span>
            )}
            <span className="text-xs text-gray-500">
              {post.readTime || "3 min read"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Views */}
            <div
              className="flex items-center gap-1 text-gray-400"
              title="Views"
            >
              <Eye className="w-4 h-4" />
              <span className="text-xs font-medium">{post.viewCount || 0}</span>
            </div>
            {/* Likes */}
            <div
              className="flex items-center gap-1 text-gray-400"
              title="Likes"
            >
              <Heart className="w-4 h-4" />
              <span className="text-xs font-medium">{post.likeCount || 0}</span>
            </div>
            {/* Comments */}
            <div
              className="flex items-center gap-1 text-gray-400"
              title="Comments"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs font-medium">
                {post.commentCount || 0}
              </span>
            </div>
            <button
              className="text-gray-400 hover:text-gray-900 transition-colors"
              title="Bookmark"
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              className="text-gray-400 hover:text-gray-900 transition-colors"
              title="More options"
            >
              <MinusCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Thumbnail Image */}
      {post.image && (
        <div className="flex-shrink-0 w-28 h-28 md:w-40 md:h-32 relative bg-gray-100 rounded-md overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}
    </Link>
  );
}
