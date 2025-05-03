import { pgTable, text, serial, integer, boolean, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enum for gender types
export const genderEnum = pgEnum('gender', ['male', 'female', 'other']);

// Enum for post categories
export const categoryEnum = pgEnum('category', [
  'technology',
  'gaming',
  'movies',
  'music',
  'media_station',
  'gossips',
  'campus_tour'
]);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  gender: genderEnum("gender").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Posts table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  media: text("media"),
  category: categoryEnum("category").notNull(),
  is_idea: boolean("is_idea").default(false),
  genre: text("genre"),
  language: text("language"),
  author_id: integer("author_id").notNull().references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

// Comments table
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  post_id: integer("post_id").notNull().references(() => posts.id, { onDelete: 'cascade' }),
  author_id: integer("author_id").notNull().references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Likes table
export const likes = pgTable("likes", {
  id: serial("id").primaryKey(),
  post_id: integer("post_id").notNull().references(() => posts.id, { onDelete: 'cascade' }),
  user_id: integer("user_id").notNull().references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Media likes table (specific for media station)
export const mediaLikes = pgTable("media_likes", {
  id: serial("id").primaryKey(),
  post_id: integer("post_id").notNull().references(() => posts.id, { onDelete: 'cascade' }),
  user_id: integer("user_id").notNull().references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Polls table
export const polls = pgTable("polls", {
  id: serial("id").primaryKey(),
  question: text("question").notNull(),
  post_id: integer("post_id").notNull().references(() => posts.id, { onDelete: 'cascade' }),
  end_date: timestamp("end_date"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Poll options table
export const pollOptions = pgTable("poll_options", {
  id: serial("id").primaryKey(),
  poll_id: integer("poll_id").notNull().references(() => polls.id, { onDelete: 'cascade' }),
  text: text("text").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Poll votes table
export const pollVotes = pgTable("poll_votes", {
  id: serial("id").primaryKey(),
  poll_id: integer("poll_id").notNull().references(() => polls.id, { onDelete: 'cascade' }),
  option_id: integer("option_id").notNull().references(() => pollOptions.id, { onDelete: 'cascade' }),
  user_id: integer("user_id").notNull().references(() => users.id),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  likes: many(likes),
  mediaLikes: many(mediaLikes),
  pollVotes: many(pollVotes),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.author_id],
    references: [users.id],
  }),
  comments: many(comments),
  likes: many(likes),
  mediaLikes: many(mediaLikes),
  poll: many(polls),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  author: one(users, {
    fields: [comments.author_id],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [comments.post_id],
    references: [posts.id],
  }),
}));

export const likesRelations = relations(likes, ({ one }) => ({
  user: one(users, {
    fields: [likes.user_id],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [likes.post_id],
    references: [posts.id],
  }),
}));

export const mediaLikesRelations = relations(mediaLikes, ({ one }) => ({
  user: one(users, {
    fields: [mediaLikes.user_id],
    references: [users.id],
  }),
  post: one(posts, {
    fields: [mediaLikes.post_id],
    references: [posts.id],
  }),
}));

// Poll relations
export const pollsRelations = relations(polls, ({ one, many }) => ({
  post: one(posts, {
    fields: [polls.post_id],
    references: [posts.id],
  }),
  options: many(pollOptions),
  votes: many(pollVotes),
}));

export const pollOptionsRelations = relations(pollOptions, ({ one, many }) => ({
  poll: one(polls, {
    fields: [pollOptions.poll_id],
    references: [polls.id],
  }),
  votes: many(pollVotes),
}));

export const pollVotesRelations = relations(pollVotes, ({ one }) => ({
  poll: one(polls, {
    fields: [pollVotes.poll_id],
    references: [polls.id],
  }),
  option: one(pollOptions, {
    fields: [pollVotes.option_id],
    references: [pollOptions.id],
  }),
  user: one(users, {
    fields: [pollVotes.user_id],
    references: [users.id],
  }),
}));

// Schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ id: true, created_at: true });
export const insertPostSchema = createInsertSchema(posts).omit({ id: true, created_at: true, updated_at: true });
export const insertCommentSchema = createInsertSchema(comments).omit({ id: true, created_at: true });
export const insertLikeSchema = createInsertSchema(likes).omit({ id: true, created_at: true });
export const insertMediaLikeSchema = createInsertSchema(mediaLikes).omit({ id: true, created_at: true });
export const insertPollSchema = createInsertSchema(polls).omit({ id: true, created_at: true });
export const insertPollOptionSchema = createInsertSchema(pollOptions).omit({ id: true, created_at: true });
export const insertPollVoteSchema = createInsertSchema(pollVotes).omit({ id: true, created_at: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Like = typeof likes.$inferSelect;
export type InsertLike = z.infer<typeof insertLikeSchema>;
export type MediaLike = typeof mediaLikes.$inferSelect;
export type InsertMediaLike = z.infer<typeof insertMediaLikeSchema>;
export type Poll = typeof polls.$inferSelect;
export type InsertPoll = z.infer<typeof insertPollSchema>;
export type PollOption = typeof pollOptions.$inferSelect;
export type InsertPollOption = z.infer<typeof insertPollOptionSchema>;
export type PollVote = typeof pollVotes.$inferSelect;
export type InsertPollVote = z.infer<typeof insertPollVoteSchema>;

// Extended types with relations
export type PostWithRelations = Post & { 
  author: User, 
  comments: Comment[], 
  likes: Like[],
  _count?: { 
    likes: number,
    comments: number 
  }
};

export type CommentWithAuthor = Comment & { author: User };
