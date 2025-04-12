import { 
  users, type User, type InsertUser,
  assets, type Asset, type InsertAsset,
  purchases, type Purchase, type InsertPurchase,
  cartItems, type CartItem, type InsertCartItem
} from "@shared/schema";

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

export const storage = new MemStorage();
