import type { PostsService } from "./post.service";
import type { PostsController } from "./posts.controller";

export class PostsModule {
  constructor(
    private readonly postsController: PostsController,
    private readonly postsService: PostsService,
  ) {}
}
