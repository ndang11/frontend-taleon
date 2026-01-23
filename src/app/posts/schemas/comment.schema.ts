import type { Types } from "mongoose";

export class Comment {
  content!: string;

  post!: Types.ObjectId;

  author!: Types.ObjectId;
}
