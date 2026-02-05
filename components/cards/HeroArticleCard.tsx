import Image from "next/image";
import Link from "next/link";

interface HeroArticleCardProps {
  image: string;
  category: string;
  title: string;
  excerpt: string;
  author: string;
  time: string;
  href: string;
}

export default function HeroArticleCard({
  image,
  category,
  title,
  excerpt,
  author,
  time,
  href,
}: HeroArticleCardProps) {
  return (
    <article className="group grid gap-6 md:grid-cols-2 items-center">
      <Link
        href={href}
        className="relative h-64 md:h-[420px] w-full overflow-hidden rounded-2xl"
      >
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
        />
      </Link>

      <div className="flex flex-col gap-4">
        <span className="text-sm font-medium uppercase tracking-wide text-primary">
          {category}
        </span>

        <h1 className="text-3xl md:text-4xl font-bold leading-tight group-hover:underline">
          <Link href={href}>{title}</Link>
        </h1>

        <p className="text-muted-foreground text-base md:text-lg line-clamp-3">
          {excerpt}
        </p>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-blue-600 font-medium">{author}</span>
          <span className="h-1 w-1 rounded-full bg-gray-400" />
          <span className="text-gray-500">{time}</span>
        </div>
      </div>
    </article>
  );
}
