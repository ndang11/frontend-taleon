import ArticleGrid from "@/components/sections/ArticleGrid";
import Pagination from "@/components/ui/Pagination";
import { posts } from "../lib/posts";

interface ArticlesPageProps {
  searchParams: { page?: string };
}

export default function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const currentPage = Number(searchParams.page) || 1;
  const pageSize = 6;

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;

  const paginatedPosts = posts.slice(start, end);
  const totalPages = Math.ceil(posts.length / pageSize);

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-8">Latest Articles</h1>

      <ArticleGrid articles={paginatedPosts} />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/articles"
      />
    </main>
  );
}
