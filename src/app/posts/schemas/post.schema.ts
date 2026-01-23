import type { Types } from "mongoose";

export enum PostStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  UNPUBLISHED = "unpublished",
}

export class Post {
  title!: string;

  content!: string;

  status!: PostStatus;

  category!: string;

  slug!: string;

  imageUrl!: string;

  authorId!: Types.ObjectId;

  tenantId!: Types.ObjectId;

  likes!: Types.ObjectId[];

  comments!: Array<{
    userId: Types.ObjectId;
    content: string;
    createdAt: Date;
  }>;
}
