import { type Model, Types } from "mongoose";
import { generateSlug } from "../lib/api-client";
import type { CreatePostDto } from "./dto/create-post.dto";
import type { UpdatePostDto } from "./dto/update-post.dto";
import type { Post } from "./schemas/post.schema";

export class PostsService {
  constructor(private readonly postModel: Model<Post>) {}

  // -------------------------
  // CREATE POST
  // -------------------------
  async create(dto: CreatePostDto, userId: string, tenantId: string) {
    try {
      const post = await this.postModel.create({
        title: dto.title,
        content: dto.content,
        status: dto.status,
        category: dto.category,
        slug: generateSlug(dto.title),
        authorId: new Types.ObjectId(userId),
        tenantId: new Types.ObjectId(tenantId),
      });

      return post;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error("A post with this title already exists");
      }

      throw new Error("Failed to create post");
    }
  }

  // -------------------------
  // GET ALL POSTS (TENANT)
  // -------------------------
  async findByTenant(tenantId: string) {
    return this.postModel
      .find({ tenantId: new Types.ObjectId(tenantId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  // -------------------------
  // GET SINGLE POST
  // -------------------------
  async findOne(postId: string, tenantId: string) {
    const post = await this.postModel.findOne({
      _id: postId,
      tenantId: new Types.ObjectId(tenantId),
    });

    if (!post) {
      throw new Error("Post not found");
    }

    return post;
  }

  // -------------------------
  // UPDATE POST
  // -------------------------
  async update(
    postId: string,
    userId: string,
    tenantId: string,
    dto: UpdatePostDto,
  ) {
    const post = await this.findOne(postId, tenantId);

    if (!post.authorId.equals(userId)) {
      throw new Error("You are not allowed to update this post");
    }

    if (dto.title) {
      post.title = dto.title;
      post.slug = generateSlug(dto.title);
    }

    if (dto.content !== undefined) post.content = dto.content;
    if (dto.status !== undefined) post.status = dto.status;
    if (dto.category !== undefined) post.category = dto.category;

    return post.save();
  }

  // -------------------------
  // DELETE POST
  // -------------------------
  async delete(postId: string, userId: string, tenantId: string) {
    const post = await this.findOne(postId, tenantId);

    if (!post.authorId.equals(userId)) {
      throw new Error("You are not allowed to delete this post");
    }

    await post.deleteOne();
    return { message: "Post deleted successfully" };
  }

  // -------------------------
  // LIKE / UNLIKE
  // -------------------------
  async toggleLike(postId: string, userId: string) {
    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new Error("Post not found");
    }

    const userObjectId = new Types.ObjectId(userId);
    const alreadyLiked = post.likes.some((id) => id.equals(userObjectId));

    if (alreadyLiked) {
      post.likes = post.likes.filter((id) => !id.equals(userObjectId));
    } else {
      post.likes.push(userObjectId);
    }

    return post.save();
  }

  // -------------------------
  // COMMENTS
  // -------------------------
  async addComment(postId: string, userId: string, content: string) {
    if (!content?.trim()) {
      throw new Error("Comment cannot be empty");
    }

    const post = await this.postModel.findById(postId);

    if (!post) {
      throw new Error("Post not found");
    }

    post.comments.push({
      userId: new Types.ObjectId(userId),
      content,
      createdAt: new Date(),
    });

    return post.save();
  }
}
