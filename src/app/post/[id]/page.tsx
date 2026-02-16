"use client";
import { useQueryClient } from "@tanstack/react-query";
import {
  Bookmark,
  Calendar,
  ChevronLeft,
  Eye,
  Heart,
  HeartOff,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Send,
  Share2,
  Tag,
  ThumbsUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/context/auth.provider";
import { LikeButton } from "@/core/components/atom/LikeButton";
import { ShareButton } from "@/core/components/atom/ShareButton";
import { FollowButton } from "@/core/components/molecule/FollowButton";
import {
  createComment,
<<<<<<< HEAD
  getAuthHeaders,
=======
>>>>>>> 963ed32 (fixed comment function and notification)
  getComments,
  incrementView,
  mapPostData,
} from "@/core/lib/api-client";
import { useToggleLike } from "@/hook/usePostInteractions";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://taleon-7rwt.onrender.com/api";

interface AuthorInfo {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  followersCount?: number;
  followingCount?: number;
}

interface Comment {
  _id: string;
  content: string;
  authorId: AuthorInfo;
  createdAt: string;
  likeCount?: number;
  replyCount?: number;
}

interface Post {
  _id: string;
  id?: string;
  title: string;
  slug: string;
  content: any;
  status: string;
  authorId: AuthorInfo | string;
  image?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  tags?: string[];
  category?: string;
  bookmarksCount?: number;
  isBookmarked?: boolean;
  isLiked?: boolean;
}

interface PostResponse {
  post?: Post;
  comments?: Comment[];
}

type SortOption = "newest" | "oldest" | "popular";

function renderTipTapContent(content: any) {
  if (!content) return null;

  let parsedContent = content;
  if (typeof content === "string") {
    try {
      const json = JSON.parse(content);
      // Check if it's a valid TipTap JSON structure
      if (json && typeof json === "object" && json.type === "doc") {
        parsedContent = json;
      }
    } catch (e) {
      // Not a JSON string, so we'll treat it as an HTML string.
      parsedContent = content;
    }
  }

  // Handle plain HTML string - render as HTML
  if (typeof parsedContent === "string") {
    const isHtml = /<[^>]+>/.test(parsedContent);

    if (isHtml) {
      // Render as HTML
      return (
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: parsedContent }}
        />
      );
    }

    // For plain text, strip HTML entities and render
    const stripped = parsedContent
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .trim();

    if (!stripped) return null;

    // Split by double newlines (paragraphs) and render as paragraphs
    const paragraphs = stripped.split(/\n\n+/);
    return (
      <div className="prose prose-lg max-w-none">
        {paragraphs.map((para: string, index: number) => (
          <p
            key={`${para.slice(0, 20)}-${index}`}
            className="mb-4 text-gray-700 leading-relaxed text-lg"
          >
            {para.replace(/\n/g, " ")}
          </p>
        ))}
      </div>
    );
  }

  if (parsedContent.type === "doc" && Array.isArray(parsedContent.content)) {
    const renderNode = (node: any, key: React.Key): React.ReactNode => {
      if (!node) return null;

      switch (node.type) {
        case "heading": {
          const headingLevel = node.attrs?.level || 2;
          const headingClass =
            headingLevel === 1
              ? "text-4xl font-bold mt-8 mb-4"
              : headingLevel === 2
                ? "text-3xl font-bold mt-6 mb-3"
                : "text-2xl font-bold mt-5 mb-2";

          if (headingLevel === 1) {
            return (
              <h1 key={key} className={headingClass}>
                {node.content?.map((child: any, i: number) =>
                  renderNode(child, `${i}-${child.type || ""}`),
                )}
              </h1>
            );
          } else if (headingLevel === 2) {
            return (
              <h2 key={key} className={headingClass}>
                {node.content?.map((child: any, i: number) =>
                  renderNode(child, i),
                )}
              </h2>
            );
          } else {
            return (
              <h3 key={key} className={headingClass}>
                {node.content?.map((child: any, i: number) =>
                  renderNode(child, `${i}-${child.type || ""}`),
                )}
              </h3>
            );
          }
        }

        case "paragraph":
          return (
            <p key={key} className="mb-4 text-gray-700 leading-relaxed text-lg">
              {node.content?.map((child: any, i: number) =>
                renderNode(child, `${i}-${child.type || ""}`),
              )}
            </p>
          );

        case "text": {
          const text = node.text || "";
          let textContent: React.ReactNode = text;

          if (node.marks) {
            node.marks.forEach((mark: any) => {
              switch (mark.type) {
                case "bold":
                  textContent = <strong>{textContent}</strong>;
                  break;
                case "italic":
                  textContent = <em>{textContent}</em>;
                  break;
                case "underline":
                  textContent = <u>{textContent}</u>;
                  break;
                case "strike":
                  textContent = <s>{textContent}</s>;
                  break;
                case "code":
                  textContent = (
                    <code className="bg-gray-100 px-2 py-0.5 rounded text-sm font-mono text-red-600">
                      {textContent}
                    </code>
                  );
                  break;
                case "link":
                  textContent = (
                    <a
                      key={`${key}-${mark.attrs?.href}`}
                      href={mark.attrs?.href}
                      className="text-blue-600 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {textContent}
                    </a>
                  );
                  break;
              }
            });
          }

          return <span key={key}>{textContent}</span>;
        }

        case "bulletList":
          return (
            <ul key={key} className="list-disc list-inside mb-4 ml-4 space-y-1">
              {node.content?.map((child: any, i: number) =>
                renderNode(child, `${i}-${child.type || ""}`),
              )}
            </ul>
          );

        case "orderedList":
          return (
            <ol
              key={key}
              className="list-decimal list-inside mb-4 ml-4 space-y-1"
            >
              {node.content?.map((child: any, i: number) =>
                renderNode(child, `${i}-${child.type || ""}`),
              )}
            </ol>
          );

        case "listItem":
          return (
            <li key={key} className="text-gray-700">
              {node.content?.map((child: any, i: number) =>
                renderNode(child, `${i}-${child.type || ""}`),
              )}
            </li>
          );

        case "blockquote":
          return (
            <blockquote
              key={key}
              className="border-l-4 border-blue-500 pl-6 py-2 my-6 bg-gray-50 rounded-r-lg"
            >
              <p className="text-gray-700 italic text-lg">
                {node.content?.map((child: any, i: number) =>
                  renderNode(child, `${i}-${child.type || ""}`),
                )}
              </p>
            </blockquote>
          );

        case "codeBlock":
          return (
            <pre
              key={key}
              className="bg-gray-900 text-gray-100 p-6 rounded-xl my-6 overflow-x-auto"
            >
              <code className="text-sm font-mono">
                {node.content?.map((child: any, i: number) =>
                  renderNode(child, `${i}-${child.type || ""}`),
                )}
              </code>
            </pre>
          );

        case "image":
          return (
            <figure key={key} className="my-8">
              <div className="relative w-full aspect-video rounded-xl overflow-hidden">
                <Image
                  src={node.attrs?.src || node.attrs?.url || ""}
                  alt={node.attrs?.alt || "Post image"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                />
              </div>
              {node.attrs?.title && (
                <figcaption className="text-center text-sm text-gray-500 mt-3">
                  {node.attrs.title}
                </figcaption>
              )}
            </figure>
          );

        case "table":
          return (
            <figure key={key} className="my-8 overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                  {node.content?.map((row: any, i: number) =>
                    renderNode(row, i),
                  )}
                </tbody>
              </table>
            </figure>
          );

        case "tableRow":
          return (
            <tr key={key}>
              {node.content?.map((cell: any, i: number) => {
                const CellTag = cell.type === "tableHeader" ? "th" : "td";
                const cellKey = `${i}-${cell.type}-${cell.content || ""}`;
                return (
                  <CellTag
                    key={cellKey}
                    className={`border border-gray-200 p-4 ${cell.type === "tableHeader" ? "bg-gray-100 font-semibold" : ""}`}
                  >
                    {cell.content?.map((child: any, j: number) =>
                      renderNode(child, `${j}-${child.type || ""}`),
                    )}
                  </CellTag>
                );
              })}
            </tr>
          );

        default:
          return (
            <div key={key}>
              {node.content?.map((child: any, i: number) =>
                renderNode(child, `${i}-${child.type || ""}`),
              )}
            </div>
          );
      }
    };

    return (
      <div className="prose prose-lg max-w-none">
        {parsedContent.content.map((node: any, index: number) =>
          renderNode(node, index),
        )}
      </div>
    );
  }

  return null;
}

function formatCommentDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
}

export default function PostDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [showAllComments, setShowAllComments] = useState(false);
  const COMMENTS_PER_PAGE = 5;

  const sortComments = useCallback(
    (commentsToSort: Comment[], sortOption: SortOption) => {
      const sorted = [...commentsToSort];
      switch (sortOption) {
        case "newest":
          sorted.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );
          break;
        case "oldest":
          sorted.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          );
          break;
        case "popular":
          sorted.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
          break;
      }
      setFilteredComments(sorted);
    },
    [],
  );

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { id } = await params;

        // Check if id looks like a slug (contains hyphens) or an ObjectId
        const isSlug = id.includes("-");
        const endpoint = isSlug ? `/posts/slug/public/${id}` : `/posts/${id}`;

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Post not found");
        }

        const data = await response.json();

        let fetchedPost = null;
<<<<<<< HEAD
        // Handle both { post: ... } and direct post response
        const postData = data.post || data;

        if (postData && (postData._id || postData.id)) {
          fetchedPost = mapPostData(postData);
        } else if (data._id || data.id) {
          fetchedPost = mapPostData(data);
        }

        if (!fetchedPost) {
          throw new Error("Invalid post data received");
=======
        if (data.post) {
          fetchedPost = mapPostData(data.post) as Post;
        } else if (data._id) {
          fetchedPost = mapPostData(data) as Post;
>>>>>>> 963ed32 (fixed comment function and notification)
        }

        if (fetchedPost) {
          setPost(fetchedPost);
          // Fetch comments separately to ensure we get them even if not included in post response
          try {
<<<<<<< HEAD
            // Cast to any to avoid 'never' type issues if getComments return type is not inferred correctly
            const commentsData: any = await getComments(fetchedPost._id);
=======
            const commentsData = await getComments(fetchedPost._id);
>>>>>>> 963ed32 (fixed comment function and notification)
            const commentsList = Array.isArray(commentsData)
              ? commentsData
              : commentsData.comments || [];
            setComments(commentsList);
            sortComments(commentsList, sortBy);
          } catch (e) {
            const allComments = data.comments || [];
            setComments(allComments);
            sortComments(allComments, sortBy);
          }
        }

        // Increment view count
        try {
          await incrementView(id);
        } catch (viewErr) {
          console.error("Failed to increment view count:", viewErr);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load post");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params, sortBy, sortComments]);

  useEffect(() => {
    sortComments(comments, sortBy);
  }, [sortBy, comments, sortComments]);

  const displayedComments = showAllComments
    ? filteredComments
    : filteredComments.slice(0, COMMENTS_PER_PAGE);
  const hasMoreComments = filteredComments.length > COMMENTS_PER_PAGE;

  const handleSubmitComment = async () => {
    if (!post || !newComment.trim()) return;

    // Check if user is authenticated
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    if (!token) {
      window.location.href = `/login?redirect=/post/${post._id}`;
      return;
    }

    setIsSubmitting(true);
    try {
      // Validate comment is not empty
      const trimmedComment = newComment.trim();
      if (!trimmedComment) {
        setCommentError("Please write a comment before submitting.");
        return;
      }

      // Call actual API to create comment
      const newCommentData = await createComment(post._id, trimmedComment);

      // Cast to local Comment type
      const newCommentTyped: Comment = {
        ...newCommentData,
        authorId: {
          _id: user?.id || "unknown",
          name: user?.name || "Unknown",
          email: user?.email || "",
          avatar: user?.avatar,
        } as AuthorInfo,
      };

      const updatedComments = [newCommentTyped, ...comments];
      setComments(updatedComments);
      sortComments(updatedComments, sortBy);
      setNewComment("");
      setCommentError(null);
    } catch (err: any) {
      console.error("Failed to post comment:", err);
      // Show error message to user
      const errorMessage =
        err?.message || "Failed to post comment. Please try again.";
      setCommentError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Post Not Found
          </h1>
          <p className="text-gray-500">
            {error || "The post you're looking for doesn't exist."}
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  const authorName =
    typeof post.authorId === "object" && post.authorId !== null
      ? (post.authorId as AuthorInfo).name
      : "Unknown Author";

  const authorAvatar =
    typeof post.authorId === "object" && post.authorId !== null
      ? (post.authorId as AuthorInfo).avatar
      : undefined;

  const authorBio =
    typeof post.authorId === "object" && post.authorId !== null
      ? (post.authorId as AuthorInfo).bio
      : undefined;

  const authorId =
    typeof post.authorId === "object" && post.authorId !== null
      ? (post.authorId as AuthorInfo)._id
      : post.authorId;

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : new Date(post.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

  const readingTime = post.content
    ? Math.max(1, Math.ceil(JSON.stringify(post.content).length / 1000))
    : 1;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {/* Post Header */}
        <header className="mb-10">
          {/* Category & Reading Time */}
          <div className="flex items-center gap-4 mb-6">
            {post.category && (
              <Link
                href={`/category/${post.category.toLowerCase()}`}
                className="px-3 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-full hover:bg-blue-100 transition-colors"
              >
                {post.category}
              </Link>
            )}
            <span className="text-gray-400">•</span>
            <span className="text-gray-500 text-sm">
              {readingTime} min read
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Author Info */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              {authorAvatar ? (
                <Image
                  src={authorAvatar}
                  alt={authorName}
                  width={56}
                  height={56}
                  className="rounded-full object-cover ring-2 ring-gray-100"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl font-medium text-white ring-2 ring-gray-100">
                  {authorName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900 text-lg">
                  {authorName}
                </p>
                {authorBio && (
                  <p className="text-gray-500 text-sm mt-0.5 line-clamp-1">
                    {authorBio}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Calendar size={14} />
                    {formattedDate}
                  </p>
                </div>
              </div>
            </div>
            <FollowButton authorId={authorId as string} />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tag/${tag.toLowerCase()}`}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-600 text-sm rounded-full hover:bg-gray-200 transition-colors"
                >
                  <Tag size={14} />
                  {tag}
                </Link>
              ))}
            </div>
          )}

          {/* Cover Image */}
          {post.image && (
            <div className="relative w-full h-[500px] rounded-2xl overflow-hidden mb-10">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
              />
            </div>
          )}

          {/* Stats Bar */}
          <div className="flex items-center justify-between py-4 border-y border-gray-100">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-gray-600">
                <Eye size={20} />
                <span className="font-medium">{post.viewCount || 0}</span>
                <span className="text-gray-400">views</span>
              </div>
              <LikeButton postId={post._id} showCount={true} />
              <div className="flex items-center gap-2 text-gray-600">
                <MessageSquare size={20} />
                <span className="font-medium">{filteredComments.length}</span>
                <span className="text-gray-400">comments</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Share2 size={20} />
                <span className="font-medium">{post.shareCount || 0}</span>
                <span className="text-gray-400">shares</span>
              </div>
            </div>
          </div>
        </header>

        {/* Post Content */}
        <article className="mb-12">{renderTipTapContent(post.content)}</article>

        {/* Engagement Actions */}
        <div className="flex items-center gap-4 py-6 border-t border-b border-gray-100 mb-12">
          <LikeButton postId={post._id} className="px-6 py-3" />
          <button
            onClick={() =>
              document
                .getElementById("comments")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
          >
            <MessageCircle size={20} className="text-gray-600" />
            <span className="font-medium text-gray-700">Comment</span>
          </button>
          <ShareButton
            postId={post._id}
            postTitle={post.title}
            postSlug={post.slug}
            className="px-6 py-3"
          />
          <FollowButton
            authorId={
              typeof post.authorId === "string"
                ? post.authorId
                : post.authorId._id
            }
          />
        </div>

        {/* Comments Section */}
        <section id="comments" className="bg-gray-50 rounded-2xl p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Comments ({filteredComments.length})
            </h2>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>

          {/* Add Comment */}
          <div className="mb-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium flex-shrink-0">
                Y
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => {
                    setNewComment(e.target.value);
                    if (commentError) setCommentError(null);
                  }}
                  placeholder="Share your thoughts..."
                  className={`w-full px-4 py-3 bg-white border rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none ${
                    commentError ? "border-red-500" : "border-gray-300"
                  }`}
                  rows={3}
                />
                {commentError && (
                  <p className="mt-1 text-sm text-red-600">{commentError}</p>
                )}
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || isSubmitting}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4"
                          viewBox="0 0 24 24"
                          role="img"
                          aria-label="Submitting"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Posting...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Post Comment
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments List */}
          {displayedComments.length > 0 ? (
            <div className="space-y-6">
              {displayedComments.map((comment) => (
                <div
                  key={comment._id}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <div className="flex gap-4">
                    {comment.authorId &&
                    typeof comment.authorId === "object" &&
                    comment.authorId.avatar ? (
                      <Image
                        src={comment.authorId.avatar}
                        alt={comment.authorId.name}
                        width={44}
                        height={44}
                        className="rounded-full object-cover ring-2 ring-gray-100 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium flex-shrink-0">
                        {typeof comment.authorId === "object"
                          ? comment.authorId.name.charAt(0).toUpperCase()
                          : "U"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-900">
                          {typeof comment.authorId === "object"
                            ? comment.authorId.name
                            : "Unknown"}
                        </span>
                        <span className="text-gray-400 text-sm">
                          {formatCommentDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4 mt-4">
                        <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors">
                          <ThumbsUp size={16} />
                          <span className="text-sm">
                            {comment.likeCount || 0}
                          </span>
                        </button>
                        <button className="text-gray-500 hover:text-gray-700 transition-colors text-sm font-medium">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl">
              <MessageCircle size={56} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                No comments yet
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Be the first to start the conversation
              </p>
            </div>
          )}

          {/* Show More / Show Less */}
          {hasMoreComments && (
            <div className="text-center mt-8">
              <button
                onClick={() => setShowAllComments(!showAllComments)}
                className="px-8 py-3 bg-white border border-gray-300 rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                {showAllComments
                  ? "Show Less Comments"
                  : `Show More Comments (${filteredComments.length - COMMENTS_PER_PAGE} more)`}
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 mt-12">
        <div className="max-w-5xl mx-auto px-6 text-center text-gray-500 text-sm">
          <p>© 2024 Taleon. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
