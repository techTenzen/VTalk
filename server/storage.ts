import { 
  users, type User, type InsertUser,
  posts, type Post, type InsertPost,
  comments, type Comment, type InsertComment,
  likes, type Like, type InsertLike,
  mediaLikes, type MediaLike, type InsertMediaLike,
  PostWithRelations, CommentWithAuthor
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, asc, like, or, not } from "drizzle-orm";

// Storage interface for CRUD operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Post operations
  getPosts(category?: string, search?: string, sort?: string): Promise<PostWithRelations[]>;
  getPostById(id: number): Promise<PostWithRelations | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;

  // Comment operations
  getCommentsByPostId(postId: number): Promise<CommentWithAuthor[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateComment(id: number, content: string): Promise<Comment | undefined>;
  deleteComment(id: number): Promise<boolean>;

  // Like operations
  getLikeByUserAndPost(userId: number, postId: number): Promise<Like | undefined>;
  createLike(like: InsertLike): Promise<Like>;
  deleteLike(userId: number, postId: number): Promise<boolean>;

  // Media like operations
  getMediaLikeByUserAndPost(userId: number, postId: number): Promise<MediaLike | undefined>;
  createMediaLike(mediaLike: InsertMediaLike): Promise<MediaLike>;
  deleteMediaLike(userId: number, postId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Post operations
  async getPosts(category?: string, search?: string, sort?: string): Promise<PostWithRelations[]> {
    let query = db.select({
      post: posts,
      author: users,
      commentsCount: sql<number>`count(distinct ${comments.id})`,
      likesCount: sql<number>`count(distinct ${likes.id})`,
    })
      .from(posts)
      .leftJoin(users, eq(posts.author_id, users.id))
      .leftJoin(comments, eq(posts.id, comments.post_id))
      .leftJoin(likes, eq(posts.id, likes.post_id))
      .groupBy(posts.id, users.id);

    // Apply category filter
    if (category) {
      if (category === 'all') {
        // All posts except gossips
        query = query.where(not(eq(posts.category, 'gossips')));
      } else {
        query = query.where(eq(posts.category, category));
      }
    }

    // Apply search filter
    if (search && search.trim() !== '') {
      query = query.where(
        or(
          like(posts.title, `%${search}%`),
          like(posts.content, `%${search}%`)
        )
      );
    }

    // Apply sort
    if (sort === 'popular') {
      query = query.orderBy(desc(sql<number>`count(distinct ${likes.id})`), desc(posts.created_at));
    } else {
      // Default sorting by most recent
      query = query.orderBy(desc(posts.created_at));
    }

    const results = await query;

    return results.map(({ post, author, commentsCount, likesCount }) => ({
      ...post,
      author,
      _count: {
        comments: Number(commentsCount),
        likes: Number(likesCount)
      }
    }));
  }

  async getPostById(id: number): Promise<PostWithRelations | undefined> {
    const [result] = await db.select({
      post: posts,
      author: users,
      commentsCount: sql<number>`count(distinct ${comments.id})`,
      likesCount: sql<number>`count(distinct ${likes.id})`,
    })
      .from(posts)
      .leftJoin(users, eq(posts.author_id, users.id))
      .leftJoin(comments, eq(posts.id, comments.post_id))
      .leftJoin(likes, eq(posts.id, likes.post_id))
      .where(eq(posts.id, id))
      .groupBy(posts.id, users.id);

    if (!result) return undefined;

    return {
      ...result.post,
      author: result.author,
      _count: {
        comments: Number(result.commentsCount),
        likes: Number(result.likesCount)
      }
    };
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db.insert(posts).values(insertPost).returning();
    return post;
  }

  async updatePost(id: number, post: Partial<InsertPost>): Promise<Post | undefined> {
    const [updatedPost] = await db
      .update(posts)
      .set({...post, updated_at: new Date()})
      .where(eq(posts.id, id))
      .returning();
    
    return updatedPost;
  }

  async deletePost(id: number): Promise<boolean> {
    const result = await db.delete(posts).where(eq(posts.id, id));
    return true;
  }

  // Comment operations
  async getCommentsByPostId(postId: number): Promise<CommentWithAuthor[]> {
    const results = await db.select({
      comment: comments,
      author: users,
    })
      .from(comments)
      .leftJoin(users, eq(comments.author_id, users.id))
      .where(eq(comments.post_id, postId))
      .orderBy(desc(comments.created_at));

    return results.map(({ comment, author }) => ({
      ...comment,
      author,
    }));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(insertComment).returning();
    return comment;
  }

  async updateComment(id: number, content: string): Promise<Comment | undefined> {
    const [updatedComment] = await db
      .update(comments)
      .set({ content })
      .where(eq(comments.id, id))
      .returning();
    
    return updatedComment;
  }

  async deleteComment(id: number): Promise<boolean> {
    await db.delete(comments).where(eq(comments.id, id));
    return true;
  }

  // Like operations
  async getLikeByUserAndPost(userId: number, postId: number): Promise<Like | undefined> {
    const [like] = await db.select()
      .from(likes)
      .where(and(
        eq(likes.user_id, userId),
        eq(likes.post_id, postId)
      ));
    
    return like;
  }

  async createLike(insertLike: InsertLike): Promise<Like> {
    const [like] = await db.insert(likes).values(insertLike).returning();
    return like;
  }

  async deleteLike(userId: number, postId: number): Promise<boolean> {
    await db.delete(likes)
      .where(and(
        eq(likes.user_id, userId),
        eq(likes.post_id, postId)
      ));
    
    return true;
  }

  // Media like operations
  async getMediaLikeByUserAndPost(userId: number, postId: number): Promise<MediaLike | undefined> {
    const [mediaLike] = await db.select()
      .from(mediaLikes)
      .where(and(
        eq(mediaLikes.user_id, userId),
        eq(mediaLikes.post_id, postId)
      ));
    
    return mediaLike;
  }

  async createMediaLike(insertMediaLike: InsertMediaLike): Promise<MediaLike> {
    const [mediaLike] = await db.insert(mediaLikes).values(insertMediaLike).returning();
    return mediaLike;
  }

  async deleteMediaLike(userId: number, postId: number): Promise<boolean> {
    await db.delete(mediaLikes)
      .where(and(
        eq(mediaLikes.user_id, userId),
        eq(mediaLikes.post_id, postId)
      ));
    
    return true;
  }
}

export const storage = new DatabaseStorage();
