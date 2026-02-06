import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getPublishedPostBySlug } from "@/core/lib/api-client";

// Type for content block
type ContentBlock = {
  id?: string;
  type: string;
  data: Record<string, unknown>;
};

// Helper component for dynamic headers
function HeaderBlock({ level, text }: { level: number; text: string }) {
  const classes =
    level === 2
      ? "text-2xl font-bold mt-8 mb-4"
      : level === 3
        ? "text-xl font-semibold mt-6 mb-3"
        : level === 4
          ? "text-lg font-semibold mt-4 mb-2"
          : "text-2xl font-bold mt-8 mb-4";

  switch (level) {
    case 2:
      return <h2 className={classes}>{text}</h2>;
    case 3:
      return <h3 className={classes}>{text}</h3>;
    case 4:
      return <h4 className={classes}>{text}</h4>;
    case 5:
      return <h5 className={classes}>{text}</h5>;
    default:
      return <h2 className={classes}>{text}</h2>;
  }
}

export default async function StoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let post = null;
  let error = null;

  try {
    post = await getPublishedPostBySlug(slug);
  } catch (e) {
    error = (e as Error).message;
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Story not found
          </h1>
          <p className="text-gray-500 mb-4">
            {error ||
              "The story you're looking for doesn't exist or has been removed."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  const authorName =
    typeof post.authorId === "object" ? post.authorId.name : "Unknown Author";

  const authorAvatar =
    typeof post.authorId === "object" ? post.authorId.avatar : null;

  return (
    <article className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to stories
      </Link>

      <header className="mb-10">
        {/* Category/Tag */}
        {post.category && (
          <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full mb-4">
            {post.category}
          </span>
        )}

        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
          {post.title}
        </h1>

        {/* Author and metadata */}
        <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm">
          <div className="flex items-center gap-3">
            {authorAvatar ? (
              <Image
                src={authorAvatar}
                alt={authorName}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 font-medium">
                  {authorName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900">{authorName}</p>
              <p className="text-xs">
                {new Date(
                  post.publishedAt || post.createdAt,
                ).toLocaleDateString(undefined, {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <span className="hidden sm:inline">•</span>

          <span>{post.readingTime || 5} min read</span>

          {post.viewCount !== undefined && (
            <>
              <span className="hidden sm:inline">•</span>
              <span>{post.viewCount} views</span>
            </>
          )}
        </div>

        {/* Cover image */}
        {post.image && (
          <div className="mt-8">
            <Image
              src={post.image}
              alt={post.title}
              width={800}
              height={400}
              className="w-full h-64 sm:h-96 object-cover rounded-xl"
              priority
            />
          </div>
        )}
      </header>

      {/* Content */}
      <div className="prose prose-stone prose-lg max-w-none">
        {post.content?.blocks?.map((block: any, index: number) => {
          const key = block.id || `block-${index}`;

          switch (block.type) {
            case "paragraph":
            case "text":
              return (
                <p key={key} className="mb-4 leading-relaxed">
                  {(block.data as any).text}
                </p>
              );

            case "header": {
              const level = (block.data as any).level || 2;

              return (
                <HeaderBlock
                  key={key}
                  level={level}
                  text={(block.data as any).text}
                />
              );
            }

            case "list": {
              const listType = (block.data as any).style;
              if (listType === "unordered") {
                return (
                  <ul key={key} className="list-disc pl-6 mb-4 space-y-2">
                    {(block.data as any).items?.map((item: any, i: number) => (
                      <li key={`${i}-${item.content || item}`}>
                        {item.content || item}
                      </li>
                    ))}
                  </ul>
                );
              }
              if (listType === "ordered") {
                return (
                  <ol key={key} className="list-decimal pl-6 mb-4 space-y-2">
                    {(block.data as any).items?.map((item: any, i: number) => (
                      <li key={`${i}-${item.content || item}`}>
                        {item.content || item}
                      </li>
                    ))}
                  </ol>
                );
              }
              return null;
            }

            case "quote":
              return (
                <blockquote
                  key={key}
                  className="border-l-4 border-blue-500 pl-4 py-2 my-6 text-gray-700 italic bg-gray-50 rounded-r"
                >
                  {(block.data as any).text}
                  {(block.data as any).caption && (
                    <footer className="text-sm text-gray-500 mt-2">
                      — {(block.data as any).caption}
                    </footer>
                  )}
                </blockquote>
              );

            case "code":
              return (
                <pre
                  key={key}
                  className="bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto my-6"
                >
                  <code>{(block.data as any).code}</code>
                </pre>
              );

            case "image":
              return (
                <figure key={key} className="my-8">
                  <Image
                    src={
                      (block.data as any).file?.url || (block.data as any).url
                    }
                    alt={(block.data as any).caption || "Image"}
                    width={800}
                    height={400}
                    className="w-full rounded-lg"
                  />
                  {(block.data as any).caption && (
                    <figcaption className="text-center text-sm text-gray-500 mt-2">
                      {(block.data as any).caption}
                    </figcaption>
                  )}
                </figure>
              );

            case "delimiter":
              return (
                <div
                  key={key}
                  className="flex items-center justify-center my-8"
                >
                  <span className="text-2xl text-gray-300">***</span>
                </div>
              );

            default:
              // Handle unknown block types gracefully
              return null;
          }
        })}
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
