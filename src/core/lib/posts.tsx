export const posts = Array.from({ length: 12 }).map((_, i) => ({
  id: `${i + 1}`,
  image: "/images/blog-placeholder.jpg",
  category: "Technology",
  title: `AI and the Web Part ${i + 1}`,
  excerpt:
    "Explore how artificial intelligence is changing frontend, backend, and developer workflows.",
  author: "Royalty",
  time: "4 min read",
  slug: `ai-and-the-web-${i + 1}`,
  tenantSlug: "taleon",
}));
