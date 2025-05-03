import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertUserSchema, 
  insertPostSchema, 
  insertCommentSchema, 
  insertLikeSchema,
  insertMediaLikeSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  const apiRouter = app.route('/api');

  // Users
  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(validatedData.email);
      
      if (existingUser) {
        return res.status(200).json(existingUser);
      }
      
      const user = await storage.createUser(validatedData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Error creating user' });
    }
  });

  // Posts
  app.get('/api/posts', async (req: Request, res: Response) => {
    try {
      const { category, search, sort } = req.query;
      const posts = await storage.getPosts(
        category as string | undefined, 
        search as string | undefined, 
        sort as string | undefined
      );
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving posts' });
    }
  });

  app.get('/api/posts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPostById(id);
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving post' });
    }
  });

  app.post('/api/posts', async (req: Request, res: Response) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Error creating post' });
    }
  });

  app.put('/api/posts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPostSchema.partial().parse(req.body);
      const post = await storage.updatePost(id, validatedData);
      
      if (!post) {
        return res.status(404).json({ message: 'Post not found' });
      }
      
      res.json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Error updating post' });
    }
  });

  app.delete('/api/posts/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePost(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting post' });
    }
  });

  // Comments
  app.get('/api/posts/:postId/comments', async (req: Request, res: Response) => {
    try {
      const postId = parseInt(req.params.postId);
      const comments = await storage.getCommentsByPostId(postId);
      res.json(comments);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving comments' });
    }
  });

  app.post('/api/comments', async (req: Request, res: Response) => {
    try {
      const validatedData = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Error creating comment' });
    }
  });

  app.put('/api/comments/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { content } = req.body;
      
      if (!content) {
        return res.status(400).json({ message: 'Content is required' });
      }
      
      const comment = await storage.updateComment(id, content);
      
      if (!comment) {
        return res.status(404).json({ message: 'Comment not found' });
      }
      
      res.json(comment);
    } catch (error) {
      res.status(500).json({ message: 'Error updating comment' });
    }
  });

  app.delete('/api/comments/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteComment(id);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting comment' });
    }
  });

  // Likes
  app.post('/api/likes', async (req: Request, res: Response) => {
    try {
      const validatedData = insertLikeSchema.parse(req.body);
      
      // Check if the like already exists
      const existingLike = await storage.getLikeByUserAndPost(
        validatedData.user_id, 
        validatedData.post_id
      );
      
      if (existingLike) {
        // Unlike if it exists
        await storage.deleteLike(validatedData.user_id, validatedData.post_id);
        return res.status(200).json({ liked: false });
      }
      
      // Create like if it doesn't exist
      await storage.createLike(validatedData);
      res.status(201).json({ liked: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Error toggling like' });
    }
  });

  // Media Likes (for Media Station)
  app.post('/api/media-likes', async (req: Request, res: Response) => {
    try {
      const validatedData = insertMediaLikeSchema.parse(req.body);
      
      // Check if the media like already exists
      const existingMediaLike = await storage.getMediaLikeByUserAndPost(
        validatedData.user_id, 
        validatedData.post_id
      );
      
      if (existingMediaLike) {
        // Unlike if it exists
        await storage.deleteMediaLike(validatedData.user_id, validatedData.post_id);
        return res.status(200).json({ liked: false });
      }
      
      // Create media like if it doesn't exist
      await storage.createMediaLike(validatedData);
      res.status(201).json({ liked: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Error toggling media like' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
