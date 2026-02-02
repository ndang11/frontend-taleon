import Image from "next/image";
import { getPost } from "@/core/lib/api-client";

export default async function PublicPostPage({
  params,
}: {
  params: { blogSlug: string; postSlug: string };
}) {
  const response = await getPost(params.postSlug);

  const post = "post" in response ? response.post : null;

  if (!post) return <div className="p-20 text-center">Post not found</div>;

  const authorName =
    typeof post.authorId === "object" ? post.authorId.name : "Unknown Author";

  return (
    <article className="max-w-2xl mx-auto py-20 px-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

        <div className="flex items-center gap-4 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            {typeof post.authorId === "object" && post.authorId.avatar && (
              <Image
                src={post.authorId.avatar}
                alt={authorName}
                width={24}
                height={24}
                className="w-6 h-6 rounded-full"
              />
            )}
            <span className="font-medium text-gray-900">{authorName}</span>
          </div>
          <span>•</span>
          <span>
            {new Date(post.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span>•</span>
          <span>{post.readingTime || 0} min read</span>
        </div>
      </header>

      <div className="prose prose-stone lg:prose-xl max-w-none">
        {post.content?.blocks?.map((block: any, i: number) => {
          if (block.type === "paragraph" || block.type === "text") {
            return <p key={block.id || i}>{block.data.text}</p>;
          }
          if (block.type === "header") {
            return <h2 key={block.id || i}>{block.data.text}</h2>;
          }
          return null;
        })}
      </div>
    </article>
  );
}
