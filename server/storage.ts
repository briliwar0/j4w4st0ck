import { 
  users, type User, type InsertUser,
  assets, type Asset, type InsertAsset,
  purchases, type Purchase, type InsertPurchase,
  cartItems, type CartItem, type InsertCartItem
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, like } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Asset methods
  getAsset(id: number): Promise<Asset | undefined>;
  getAssetsByAuthor(authorId: number): Promise<Asset[]>;
  getAssetsByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<Asset[]>;
  createAsset(asset: InsertAsset): Promise<Asset>;
  updateAssetStatus(id: number, status: 'pending' | 'approved' | 'rejected'): Promise<Asset | undefined>;
  searchAssets(query: string, type?: string, categories?: string[]): Promise<Asset[]>;
  getApprovedAssets(type?: string, limit?: number): Promise<Asset[]>;
  
  // Purchase methods
  createPurchase(purchase: InsertPurchase): Promise<Purchase>;
  getPurchasesByUser(userId: number): Promise<Purchase[]>;
  
  // Cart methods
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  getCartItems(userId: number): Promise<CartItem[]>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private assets: Map<number, Asset>;
  private purchases: Map<number, Purchase>;
  private cartItems: Map<number, CartItem>;
  
  private userIdCounter: number;
  private assetIdCounter: number;
  private purchaseIdCounter: number;
  private cartItemIdCounter: number;

  constructor() {
    this.users = new Map();
    this.assets = new Map();
    this.purchases = new Map();
    this.cartItems = new Map();
    
    this.userIdCounter = 1;
    this.assetIdCounter = 1;
    this.purchaseIdCounter = 1;
    this.cartItemIdCounter = 1;
    
    // Initialize with admin user
    this.createUser({
      username: "admin",
      email: "admin@jawastock.com",
      password: "adminpassword", // In a real app, this would be hashed
      role: "admin",
      firstName: "Admin",
      lastName: "User",
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Asset methods
  async getAsset(id: number): Promise<Asset | undefined> {
    return this.assets.get(id);
  }
  
  async getAssetsByAuthor(authorId: number): Promise<Asset[]> {
    return Array.from(this.assets.values()).filter(
      (asset) => asset.authorId === authorId
    );
  }
  
  async getAssetsByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<Asset[]> {
    return Array.from(this.assets.values()).filter(
      (asset) => asset.status === status
    );
  }
  
  async createAsset(insertAsset: InsertAsset): Promise<Asset> {
    const id = this.assetIdCounter++;
    const createdAt = new Date();
    const asset: Asset = { ...insertAsset, id, createdAt };
    this.assets.set(id, asset);
    return asset;
  }
  
  async updateAssetStatus(id: number, status: 'pending' | 'approved' | 'rejected'): Promise<Asset | undefined> {
    const asset = this.assets.get(id);
    if (!asset) return undefined;
    
    const updatedAsset = { ...asset, status };
    this.assets.set(id, updatedAsset);
    return updatedAsset;
  }
  
  async searchAssets(query: string, type?: string, categories?: string[]): Promise<Asset[]> {
    const lowerCaseQuery = query.toLowerCase();
    
    return Array.from(this.assets.values()).filter(asset => {
      // Only return approved assets
      if (asset.status !== 'approved') return false;
      
      // Filter by type if specified
      if (type && asset.type !== type) return false;
      
      // Filter by categories if specified
      if (categories && categories.length > 0) {
        if (!asset.categories || !asset.categories.some(cat => categories.includes(cat))) {
          return false;
        }
      }
      
      // Search by title, description or tags
      return (
        asset.title.toLowerCase().includes(lowerCaseQuery) ||
        (asset.description && asset.description.toLowerCase().includes(lowerCaseQuery)) ||
        (asset.tags && asset.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery)))
      );
    });
  }
  
  async getApprovedAssets(type?: string, limit?: number): Promise<Asset[]> {
    let assets = Array.from(this.assets.values()).filter(
      (asset) => asset.status === 'approved'
    );
    
    if (type) {
      assets = assets.filter(asset => asset.type === type);
    }
    
    // Sort by createdAt (newest first)
    assets.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (limit) {
      assets = assets.slice(0, limit);
    }
    
    return assets;
  }

  // Purchase methods
  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const id = this.purchaseIdCounter++;
    const createdAt = new Date();
    const purchase: Purchase = { ...insertPurchase, id, createdAt };
    this.purchases.set(id, purchase);
    return purchase;
  }
  
  async getPurchasesByUser(userId: number): Promise<Purchase[]> {
    return Array.from(this.purchases.values()).filter(
      (purchase) => purchase.userId === userId
    );
  }

  // Cart methods
  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    const id = this.cartItemIdCounter++;
    const createdAt = new Date();
    const cartItem: CartItem = { ...insertCartItem, id, createdAt };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }
  
  async getCartItems(userId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(
      (item) => item.userId === userId
    );
  }
  
  async removeFromCart(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }
  
  async clearCart(userId: number): Promise<boolean> {
    const userCartItems = await this.getCartItems(userId);
    userCartItems.forEach(item => this.cartItems.delete(item.id));
    return true;
  }
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  // Asset methods
  async getAsset(id: number): Promise<Asset | undefined> {
    const [asset] = await db.select().from(assets).where(eq(assets.id, id));
    return asset;
  }

  async getAssetsByAuthor(authorId: number): Promise<Asset[]> {
    return await db.select().from(assets).where(eq(assets.authorId, authorId));
  }

  async getAssetsByStatus(status: 'pending' | 'approved' | 'rejected'): Promise<Asset[]> {
    return await db.select().from(assets).where(eq(assets.status, status));
  }

  async createAsset(insertAsset: InsertAsset): Promise<Asset> {
    const [asset] = await db
      .insert(assets)
      .values(insertAsset)
      .returning();
    return asset;
  }

  async updateAssetStatus(id: number, status: 'pending' | 'approved' | 'rejected'): Promise<Asset | undefined> {
    const [updatedAsset] = await db
      .update(assets)
      .set({ status })
      .where(eq(assets.id, id))
      .returning();
    return updatedAsset;
  }

  async searchAssets(query: string, type?: string, categories?: string[]): Promise<Asset[]> {
    const lowerCaseQuery = query.toLowerCase();
    
    let baseQuery = db
      .select()
      .from(assets)
      .where(eq(assets.status, 'approved'));
      
    if (type) {
      baseQuery = baseQuery.where(eq(assets.type, type));
    }
    
    const results = await baseQuery;
    
    // Filter client-side for complex conditions like searching in arrays
    return results.filter(asset => {
      // Text search in title and description
      const matchesText = 
        asset.title.toLowerCase().includes(lowerCaseQuery) ||
        (asset.description && asset.description.toLowerCase().includes(lowerCaseQuery));
      
      // Search in tags array
      const matchesTags = asset.tags && 
        asset.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery));
      
      // Category filter
      const matchesCategories = !categories?.length || 
        (asset.categories && asset.categories.some(cat => categories.includes(cat)));
      
      return (matchesText || matchesTags) && matchesCategories;
    });
  }

  async getApprovedAssets(type?: string, limit?: number): Promise<Asset[]> {
    let query = db
      .select()
      .from(assets)
      .where(eq(assets.status, 'approved'))
      .orderBy(assets.createdAt);
    
    if (type) {
      query = query.where(eq(assets.type, type));
    }
    
    if (limit) {
      query = query.limit(limit);
    }
    
    return await query;
  }

  // Purchase methods
  async createPurchase(insertPurchase: InsertPurchase): Promise<Purchase> {
    const [purchase] = await db
      .insert(purchases)
      .values(insertPurchase)
      .returning();
    return purchase;
  }

  async getPurchasesByUser(userId: number): Promise<Purchase[]> {
    return await db
      .select()
      .from(purchases)
      .where(eq(purchases.userId, userId));
  }

  // Cart methods
  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    const [cartItem] = await db
      .insert(cartItems)
      .values(insertCartItem)
      .returning();
    return cartItem;
  }

  async getCartItems(userId: number): Promise<CartItem[]> {
    return await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.userId, userId));
  }

  async removeFromCart(id: number): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(eq(cartItems.id, id));
    return true; // Assuming success if no error is thrown
  }

  async clearCart(userId: number): Promise<boolean> {
    await db
      .delete(cartItems)
      .where(eq(cartItems.userId, userId));
    return true; // Assuming success if no error is thrown
  }
}

// Initialize database with admin user
const initializeDatabase = async () => {
  const storage = new DatabaseStorage();
  
  // Check if admin exists
  const admin = await storage.getUserByEmail("admin@jawastock.com");
  
  if (!admin) {
    await storage.createUser({
      username: "admin",
      email: "admin@jawastock.com",
      password: "adminpassword", // In a real app, this would be hashed
      role: "admin",
      firstName: "Admin",
      lastName: "User",
    });
    console.log("Admin user created in database");
  }
  
  return storage;
};

// Export the storage instance
export const storage = new DatabaseStorage();

// Initialize database (but don't block startup)
initializeDatabase().catch(err => {
  console.error("Error initializing database:", err);
});
