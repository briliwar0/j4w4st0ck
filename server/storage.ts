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
    
    // Add sample contributor user
    const contributor = this.createUser({
      username: "contributor",
      email: "contributor@jawastock.com",
      password: "password",
      role: "contributor",
      firstName: "Sample",
      lastName: "Contributor",
    });
    
    // Add sample assets
    this.createAsset({
      title: "Beautiful Mountain Landscape",
      description: "A stunning view of mountains at sunset",
      type: "photo",
      url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3",
      thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&w=400",
      originalUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3",
      price: 1500,
      authorId: contributor.id,
      publicId: "jawastock/mountains",
      originalPublicId: "jawastock/originals/mountains",
      status: "approved",
      width: 1920,
      height: 1080,
      fileSize: 2540000,
      format: "jpg",
      categories: ["nature", "landscape"],
      keywords: ["mountain", "sunset", "landscape", "nature"],
      licenseType: "standard"
    });
    
    this.createAsset({
      title: "Business Team Meeting",
      description: "Professional team having a discussion in modern office",
      type: "photo",
      url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3",
      thumbnailUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&w=400",
      originalUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3",
      price: 2000,
      authorId: contributor.id,
      publicId: "jawastock/business-meeting",
      originalPublicId: "jawastock/originals/business-meeting",
      status: "approved",
      width: 1920, 
      height: 1080,
      fileSize: 3240000,
      format: "jpg",
      categories: ["business", "people"],
      keywords: ["business", "meeting", "office", "team", "professional"],
      licenseType: "standard"
    });
    
    this.createAsset({
      title: "Digital Marketing Icons",
      description: "Vector set of digital marketing and SEO icons",
      type: "vector",
      url: "https://img.freepik.com/free-vector/gradient-ui-ux-elements-collection_23-2149057910.jpg",
      thumbnailUrl: "https://img.freepik.com/free-vector/gradient-ui-ux-elements-collection_23-2149057910.jpg?w=400",
      originalUrl: "https://img.freepik.com/free-vector/gradient-ui-ux-elements-collection_23-2149057910.jpg",
      price: 1800,
      authorId: contributor.id,
      publicId: "jawastock/marketing-icons",
      originalPublicId: "jawastock/originals/marketing-icons",
      status: "approved",
      width: 1600,
      height: 1600,
      fileSize: 1450000,
      format: "svg",
      categories: ["business", "icons"],
      keywords: ["digital", "marketing", "icons", "vector", "SEO"],
      licenseType: "standard"
    });
    
    this.createAsset({
      title: "Abstract Background",
      description: "Colorful abstract background with geometric shapes",
      type: "illustration",
      url: "https://img.freepik.com/free-vector/abstract-watercolor-pastel-background_87374-139.jpg",
      thumbnailUrl: "https://img.freepik.com/free-vector/abstract-watercolor-pastel-background_87374-139.jpg?w=400",
      originalUrl: "https://img.freepik.com/free-vector/abstract-watercolor-pastel-background_87374-139.jpg",
      price: 1200,
      authorId: contributor.id,
      publicId: "jawastock/abstract-bg",
      originalPublicId: "jawastock/originals/abstract-bg",
      status: "approved",
      width: 2000,
      height: 2000,
      fileSize: 2120000,
      format: "jpg",
      categories: ["backgrounds"],
      keywords: ["abstract", "background", "colorful", "geometric"],
      licenseType: "standard"
    });
    
    this.createAsset({
      title: "Corporate Introduction Video",
      description: "Professional corporate introduction animation",
      type: "video",
      url: "https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0fd273d2c6d9a064f3ae35579b2bbdf&profile_id=139&oauth2_token_id=57447761",
      thumbnailUrl: "https://images.pexels.com/videos/3045163/free-video-3045163.jpg?auto=compress&cs=tinysrgb&dpr=1&w=400",
      originalUrl: "https://player.vimeo.com/external/371433846.hd.mp4?s=236da2f3c0fd273d2c6d9a064f3ae35579b2bbdf&profile_id=175&oauth2_token_id=57447761",
      price: 5000,
      authorId: contributor.id,
      publicId: "jawastock/corporate-video",
      originalPublicId: "jawastock/originals/corporate-video",
      status: "approved",
      width: 1920,
      height: 1080,
      fileSize: 15240000,
      format: "mp4",
      categories: ["business", "video"],
      keywords: ["corporate", "introduction", "animation", "business"],
      licenseType: "premium"
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
    
    // Get all approved assets first
    const baseQuery = db
      .select()
      .from(assets)
      .where(eq(assets.status, 'approved'));
    
    // Execute the basic query
    const approvedAssets = await baseQuery;
    
    // Apply filters in memory
    return approvedAssets.filter(asset => {
      // Type filter
      if (type && asset.type !== type) {
        return false;
      }
      
      // Text search in title and description
      const matchesText = 
        asset.title.toLowerCase().includes(lowerCaseQuery) ||
        (asset.description && asset.description.toLowerCase().includes(lowerCaseQuery));
      
      // Search in tags array
      const matchesTags = asset.tags && 
        asset.tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery));
      
      // Category filter
      const matchesCategories = !categories?.length || 
        (asset.categories && asset.categories.some(cat => 
          typeof cat === 'string' && categories.includes(cat)
        ));
      
      return (matchesText || matchesTags) && matchesCategories;
    });
  }

  async getApprovedAssets(type?: string, limit?: number): Promise<Asset[]> {
    let baseQuery = db
      .select()
      .from(assets)
      .where(eq(assets.status, 'approved'));
    
    // Execute the base query first to get all approved assets
    let results = await baseQuery;
    
    // If type is specified, filter the results in memory
    if (type) {
      results = results.filter(asset => asset.type === type);
    }
    
    // Sort by created date (newest first)
    results.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Apply limit if specified
    if (limit && limit > 0) {
      results = results.slice(0, limit);
    }
    
    return results;
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

// Initialize database with admin user, contributor, and sample assets
const initializeDatabase = async () => {
  const storage = new DatabaseStorage();
  
  // Check if admin exists
  const admin = await storage.getUserByEmail("admin@jawastock.com");
  
  let adminId = 0;
  let contributorId = 0;
  
  if (!admin) {
    const adminUser = await storage.createUser({
      username: "admin",
      email: "admin@jawastock.com",
      password: "adminpassword", // In a real app, this would be hashed
      role: "admin",
      firstName: "Admin",
      lastName: "User",
    });
    console.log("Admin user created in database");
    adminId = adminUser.id;
    
    // Create a contributor user
    const contributor = await storage.createUser({
      username: "contributor",
      email: "contributor@jawastock.com",
      password: "password", // In a real app, this would be hashed
      role: "contributor",
      firstName: "Sample",
      lastName: "Contributor",
    });
    console.log("Contributor user created in database");
    contributorId = contributor.id;
    
    // Add sample assets
    const sampleAssets = [
      {
        title: "Beautiful Mountain Landscape",
        description: "A stunning view of mountains at sunset",
        type: "photo",
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3",
        thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&w=400",
        originalUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3",
        price: 1500,
        authorId: contributorId,
        publicId: "jawastock/mountains",
        originalPublicId: "jawastock/originals/mountains",
        status: "approved",
        width: 1920,
        height: 1080,
        fileSize: 2540000,
        format: "jpg",
        categories: ["nature", "landscape"],
        keywords: ["mountain", "sunset", "landscape", "nature"],
        licenseType: "standard"
      },
      {
        title: "Modern workspace with notebook",
        description: "A clean, minimalist workspace featuring a notebook and coffee",
        type: "photo",
        url: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017",
        thumbnailUrl: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=600",
        price: 999,
        authorId: contributorId,
        publicId: "jawastock/workspace",
        originalPublicId: "jawastock/originals/workspace",
        status: "approved",
        width: 1920,
        height: 1080,
        fileSize: 2000000,
        format: "jpg",
        categories: ["business", "lifestyle"],
        keywords: ["workspace", "notebook", "minimal", "desk"],
        licenseType: "standard"
      },
      {
        title: "Business people shaking hands",
        description: "Professional business meeting with handshake, partnership concept",
        type: "photo",
        url: "https://images.unsplash.com/photo-1521791136064-7986c2920216",
        thumbnailUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600",
        price: 1299,
        authorId: contributorId,
        publicId: "jawastock/handshake",
        originalPublicId: "jawastock/originals/handshake",
        status: "approved",
        width: 1920,
        height: 1080,
        fileSize: 2200000,
        format: "jpg",
        categories: ["business", "people"],
        keywords: ["business", "handshake", "meeting", "professional"],
        licenseType: "standard"
      },
      {
        title: "Abstract pattern background",
        description: "Colorful abstract pattern for backgrounds and designs",
        type: "vector",
        url: "https://images.unsplash.com/photo-1493612276216-ee3925520721",
        thumbnailUrl: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=800&h=600",
        price: 799,
        authorId: contributorId,
        publicId: "jawastock/abstract",
        originalPublicId: "jawastock/originals/abstract",
        status: "approved",
        width: 5000,
        height: 5000,
        fileSize: 1500000,
        format: "svg",
        categories: ["backgrounds", "patterns"],
        keywords: ["abstract", "pattern", "colorful", "background"],
        licenseType: "standard"
      }
    ];
    
    for (const asset of sampleAssets) {
      await storage.createAsset(asset);
    }
    
    console.log("Sample assets created in database");
  } else {
    adminId = admin.id;
    
    // Check if contributor exists
    const contributor = await storage.getUserByEmail("contributor@jawastock.com");
    if (contributor) {
      contributorId = contributor.id;
    }
    
    // Check if assets exists
    const assets = await storage.getApprovedAssets();
    if (assets.length === 0) {
      console.log("No assets found. Creating sample assets.");
      // Add sample assets if none exist
      const sampleAssets = [
        {
          title: "Beautiful Mountain Landscape",
          description: "A stunning view of mountains at sunset",
          type: "photo",
          url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3",
          thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&w=400",
          originalUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3",
          price: 1500,
          authorId: contributorId || adminId,
          publicId: "jawastock/mountains",
          originalPublicId: "jawastock/originals/mountains",
          status: "approved",
          width: 1920,
          height: 1080,
          fileSize: 2540000,
          format: "jpg",
          categories: ["nature", "landscape"],
          keywords: ["mountain", "sunset", "landscape", "nature"],
          licenseType: "standard"
        },
        {
          title: "Modern workspace with notebook",
          description: "A clean, minimalist workspace featuring a notebook and coffee",
          type: "photo",
          url: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017",
          thumbnailUrl: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=600",
          price: 999,
          authorId: contributorId || adminId,
          publicId: "jawastock/workspace",
          originalPublicId: "jawastock/originals/workspace",
          status: "approved",
          width: 1920,
          height: 1080,
          fileSize: 2000000,
          format: "jpg",
          categories: ["business", "lifestyle"],
          keywords: ["workspace", "notebook", "minimal", "desk"],
          licenseType: "standard"
        }
      ];
      
      for (const asset of sampleAssets) {
        await storage.createAsset(asset);
      }
      
      console.log("Sample assets created in database");
    }
  }
  
  return storage;
};

// Export the storage instance
// Use MemStorage for development with sample data
// Gunakan DatabaseStorage jika DATABASE_URL tersedia, jika tidak gunakan MemStorage
export const storage = process.env.DATABASE_URL 
  ? new DatabaseStorage()
  : new MemStorage();

// Initialize database (but don't block startup)
initializeDatabase().catch(err => {
  console.error("Error initializing database:", err);
});
