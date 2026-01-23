import type { CreateCommentDto } from "./dto/create-comment.dto";
import type { CreatePostDto } from "./dto/create-post.dto";
import type { UpdatePostDto } from "./dto/update-post.dto";
import type { PostsService } from "./post.service";

export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // CREATE POST
  create(dto: CreatePostDto, user: any) {
    return this.postsService.create(dto, user.sub, user.tenantId);
  }

  // GET ALL POSTS FOR TENANT
  findAll(user: any) {
    return this.postsService.findByTenant(user.tenantId);
  }

  // GET SINGLE POST
  findOne(id: string, user: any) {
    return this.postsService.findOne(id, user.tenantId);
  }

  // UPDATE POST
  update(id: string, dto: UpdatePostDto, user: any) {
    return this.postsService.update(id, user.sub, user.tenantId, dto);
  }

  // DELETE POST
  remove(id: string, user: any) {
    return this.postsService.delete(id, user.sub, user.tenantId);
  }

  // LIKE POST
  like(id: string, user: any) {
    return this.postsService.toggleLike(id, user.sub);
  }

  // COMMENT ON POST
  comment(id: string, dto: CreateCommentDto, user: any) {
    return this.postsService.addComment(id, user.sub, dto.content);
  }
}
