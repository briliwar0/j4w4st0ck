import { pgTable, text, serial, integer, boolean, jsonb, timestamp, pgEnum, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'contributor', 'admin']);
export const assetTypeEnum = pgEnum('asset_type', ['photo', 'video', 'vector', 'illustration', 'music']);
export const assetStatusEnum = pgEnum('asset_status', ['pending', 'approved', 'rejected']);
export const licenseTypeEnum = pgEnum('license_type', ['standard', 'extended', 'premium']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default('user'),
  firstName: text("first_name"),
  lastName: text("last_name"),
  bio: text("bio"),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Assets table
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: assetTypeEnum("type").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url").notNull(),
  price: integer("price").notNull(), // Price in cents
  authorId: integer("author_id").notNull().references(() => users.id),
  status: assetStatusEnum("status").notNull().default('pending'),
  tags: text("tags").array(),
  categories: text("categories").array(),
  licenseType: licenseTypeEnum("license_type").notNull().default('standard'),
  width: integer("width"),
  height: integer("height"),
  duration: integer("duration"), // For videos, in seconds
  fileSize: integer("file_size"), // In bytes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertAssetSchema = createInsertSchema(assets).omit({
  id: true,
  createdAt: true,
});

// Purchases table
export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  assetId: integer("asset_id").notNull().references(() => assets.id),
  price: integer("price").notNull(), // Price in cents
  licenseType: licenseTypeEnum("license_type").notNull(),
  downloadUrl: text("download_url").notNull(),
  expiryDate: timestamp("expiry_date"), // When download link expires
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPurchaseSchema = createInsertSchema(purchases).omit({
  id: true,
  createdAt: true,
});

// Cart items table
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  assetId: integer("asset_id").notNull().references(() => assets.id),
  licenseType: licenseTypeEnum("license_type").notNull().default('standard'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = z.infer<typeof insertAssetSchema>;

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
