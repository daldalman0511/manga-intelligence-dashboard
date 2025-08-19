import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const companies = pgTable("companies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'competitor', 'publisher', 'platform'
  website: text("website"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
});

export const newsSources = pgTable("news_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(), // 'rss', 'scrape', 'api'
  language: text("language").default('ja'),
  isActive: boolean("is_active").default(true),
  lastFetched: timestamp("last_fetched"),
});

export const articles = pgTable("articles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content"),
  summary: text("summary"),
  url: text("url").notNull().unique(),
  imageUrl: text("image_url"),
  publishedAt: timestamp("published_at").notNull(),
  sourceId: varchar("source_id").references(() => newsSources.id),
  companyId: varchar("company_id").references(() => companies.id),
  category: text("category").notNull(), // 'competitor', 'partnership', 'market', 'global'
  sentiment: text("sentiment"), // 'positive', 'negative', 'neutral'
  sentimentScore: integer("sentiment_score"), // -100 to 100
  language: text("language").default('ja'),
  keywords: jsonb("keywords").$type<string[]>(),
  isBreaking: boolean("is_breaking").default(false),
  importance: integer("importance").default(1), // 1-5 scale
});

export const alerts = pgTable("alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'info', 'warning', 'error', 'success'
  priority: integer("priority").default(1), // 1-5 scale
  companyId: varchar("company_id").references(() => companies.id),
  articleId: varchar("article_id").references(() => articles.id),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const trends = pgTable("trends", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  keyword: text("keyword").notNull(),
  mentions: integer("mentions").default(0),
  sentiment: text("sentiment"),
  changePercentage: integer("change_percentage"),
  period: text("period").default('24h'), // '24h', '7d', '30d'
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
});

export const insertNewsSourceSchema = createInsertSchema(newsSources).omit({
  id: true,
  lastFetched: true,
});

export const insertArticleSchema = createInsertSchema(articles).omit({
  id: true,
});

export const insertAlertSchema = createInsertSchema(alerts).omit({
  id: true,
  createdAt: true,
});

export const insertTrendSchema = createInsertSchema(trends).omit({
  id: true,
  updatedAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Company = typeof companies.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;

export type NewsSource = typeof newsSources.$inferSelect;
export type InsertNewsSource = z.infer<typeof insertNewsSourceSchema>;

export type Article = typeof articles.$inferSelect;
export type InsertArticle = z.infer<typeof insertArticleSchema>;

export type Alert = typeof alerts.$inferSelect;
export type InsertAlert = z.infer<typeof insertAlertSchema>;

export type Trend = typeof trends.$inferSelect;
export type InsertTrend = z.infer<typeof insertTrendSchema>;
