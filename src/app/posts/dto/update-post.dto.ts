import type { PostStatus } from "../schemas/post.schema";

export class UpdatePostDto {
  title?: string;

  content?: string;

  category?: string;

  status?: PostStatus;
}
