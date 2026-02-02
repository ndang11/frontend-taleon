import ArticleCard from "../cards/ArticleCard";

interface Article {
  id: string;
  image: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  time: string;
  slug: string;
  tenantSlug: string;
}

interface ArticleGridProps {
  articles: Article[];
}

export default function ArticleGrid({ articles }: ArticleGridProps) {
  return (
    <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          image={article.image}
          category={article.category}
          title={article.title}
          excerpt={article.excerpt}
          author={article.author}
          time={article.time}
          href={`/${article.tenantSlug}/${article.slug}`}
        />
      ))}
    </section>
  );
}
