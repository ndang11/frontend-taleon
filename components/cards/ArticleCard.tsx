import Image from "next/image";
import Link from "next/link";

interface ArticleCardProps {
  image: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  time: string;
  href: string;
}

export default function ArticleCard({
  image,
  category,
  title,
  excerpt,
  author,
  time,
  href,
}: ArticleCardProps) {
  return (
    <article className="group rounded-2xl border overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all duration-300">
      <Link href={href} className="relative block h-52">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      <div className="p-5 flex flex-col gap-3">
        <span className="text-xs font-semibold uppercase text-primary">
          {category}
        </span>

        <h2 className="text-lg font-bold leading-snug group-hover:underline">
          <Link href={href}>{title}</Link>
        </h2>

        <p className="text-sm text-muted-foreground line-clamp-2">{excerpt}</p>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-blue-600 font-medium">{author}</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-500">{time}</span>
        </div>
      </div>
    </article>
  );
}
