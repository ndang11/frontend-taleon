import type { PostStatus } from "../schemas/post.schema";

export class CreatePostDto {
  title!: string;

  content!: string;

  status!: PostStatus;

  category!: string;
}
