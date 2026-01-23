export interface Post {
  id: string;
  title: string;
  content: string;
  status: "draft" | "published" | "unpublished";
  createdAt: string;
  updatedAt: string;
  slug: string;
  userId: string;
  tenantId: string;
  category: string;
  image?: string;
}
