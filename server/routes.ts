import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertAssetSchema, 
  insertCartItemSchema, 
  insertPurchaseSchema 
} from "@shared/schema";
import { z } from "zod";
import 'express-session';
import { upload, optimizeImage, generateThumbnail, cleanupTempFiles } from "./upload";
import { uploadImageWithWatermark, uploadVideoWithWatermark, generateSignedUrl } from "./cloudinary";
import path from "path";
import fs from "fs";

// Extend Express Request type to include session
declare module 'express-session' {
  interface SessionData {
    userId?: number;
  }
}

// Setup Stripe
let stripe: Stripe | null = null;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    });
    console.log("Stripe initialized successfully");
  } else {
    console.warn("Stripe secret key not found. Payment functionality will be limited.");
  }
} catch (error) {
  console.error("Error initializing Stripe:", error);
}

// Utility function to validate request against a schema
const validateRequest = <T extends z.ZodTypeAny>(
  schema: T,
  req: Request,
  res: Response
): z.infer<T> | null => {
  try {
    return schema.parse(req.body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ message: "Validation error", errors: error.errors });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
    return null;
  }
};

// Simple authentication middleware
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

// Check if user is a contributor or admin
const isContributorOrAdmin = async (req: Request, res: Response, next: Function) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user || (user.role !== 'contributor' && user.role !== 'admin')) {
    return res.status(403).json({ message: "Forbidden: Requires contributor or admin role" });
  }
  
  next();
};

// Check if user is an admin
const isAdmin = async (req: Request, res: Response, next: Function) => {
  if (!req.session?.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: "Forbidden: Requires admin role" });
  }
  
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();
  
  // Auth routes
  apiRouter.post('/auth/register', async (req, res) => {
    const validatedUser = validateRequest(insertUserSchema, req, res);
    if (!validatedUser) return;
    
    // Check if username or email already exists
    const existingUserByUsername = await storage.getUserByUsername(validatedUser.username);
    if (existingUserByUsername) {
      return res.status(409).json({ message: "Username already exists" });
    }
    
    const existingUserByEmail = await storage.getUserByEmail(validatedUser.email);
    if (existingUserByEmail) {
      return res.status(409).json({ message: "Email already exists" });
    }
    
    // In a real app, we would hash the password here
    const user = await storage.createUser(validatedUser);
    
    // Set user session
    req.session.userId = user.id;
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  });
  
  apiRouter.post('/auth/login', async (req, res) => {
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    });
    
    const validatedLogin = validateRequest(loginSchema, req, res);
    if (!validatedLogin) return;
    
    const user = await storage.getUserByEmail(validatedLogin.email);
    if (!user || user.password !== validatedLogin.password) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    
    // Set user session
    req.session.userId = user.id;
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  
  apiRouter.post('/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });
  
  apiRouter.get('/auth/me', async (req, res) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      return res.status(401).json({ message: "User not found" });
    }
    
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  
  // User routes
  apiRouter.get('/users', isAdmin, async (_req, res) => {
    const users = await storage.getAllUsers();
    // Remove passwords from the response
    const usersWithoutPasswords = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.json(usersWithoutPasswords);
  });
  
  // Asset routes
  apiRouter.post('/assets', isContributorOrAdmin, async (req, res) => {
    const validatedAsset = validateRequest(insertAssetSchema, req, res);
    if (!validatedAsset) return;
    
    // Set authorId from session
    validatedAsset.authorId = req.session.userId!;
    
    const asset = await storage.createAsset(validatedAsset);
    res.status(201).json(asset);
  });
  
  apiRouter.get('/assets', async (req, res) => {
    const { query, type, categories } = req.query;
    const categoryArray = categories ? (Array.isArray(categories) ? categories : [categories as string]) : undefined;
    
    // Validate type parameter - it must be one of the allowed asset types
    let validatedType: string | undefined = undefined;
    if (type) {
      // Skip validation if type is 'all'
      if (type === 'all') {
        validatedType = undefined; // treat 'all' as no type filter
      }
      // If it's a single valid type, use it directly
      else if (['photo', 'video', 'vector', 'illustration', 'music'].includes(type as string)) {
        validatedType = type as string;
      } else {
        // If we get here, the type parameter is not valid
        return res.status(400).json({ 
          message: "Invalid asset type. Must be one of: photo, video, vector, illustration, music, or 'all'" 
        });
      }
    }
    
    try {
      if (query) {
        const assets = await storage.searchAssets(
          query as string,
          validatedType,
          categoryArray
        );
        return res.json(assets);
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const assets = await storage.getApprovedAssets(validatedType, limit);
      res.json(assets);
    } catch (error) {
      console.error("Error fetching assets:", error);
      res.status(500).json({ message: "Error fetching assets" });
    }
  });
  
  apiRouter.get('/assets/:id', async (req, res) => {
    const assetId = parseInt(req.params.id);
    if (isNaN(assetId)) {
      return res.status(400).json({ message: "Invalid asset ID" });
    }
    
    const asset = await storage.getAsset(assetId);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }
    
    res.json(asset);
  });
  
  apiRouter.get('/assets/author/:authorId', async (req, res) => {
    const authorId = parseInt(req.params.authorId);
    if (isNaN(authorId)) {
      return res.status(400).json({ message: "Invalid author ID" });
    }
    
    const assets = await storage.getAssetsByAuthor(authorId);
    res.json(assets);
  });
  
  apiRouter.patch('/assets/:id/status', isAdmin, async (req, res) => {
    const assetId = parseInt(req.params.id);
    if (isNaN(assetId)) {
      return res.status(400).json({ message: "Invalid asset ID" });
    }
    
    const statusSchema = z.object({
      status: z.enum(['pending', 'approved', 'rejected'])
    });
    
    const validatedStatus = validateRequest(statusSchema, req, res);
    if (!validatedStatus) return;
    
    const asset = await storage.updateAssetStatus(assetId, validatedStatus.status);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }
    
    res.json(asset);
  });
  
  apiRouter.get('/admin/pending-assets', isAdmin, async (_req, res) => {
    const pendingAssets = await storage.getAssetsByStatus('pending');
    res.json(pendingAssets);
  });
  
  // Cart routes
  apiRouter.post('/cart', isAuthenticated, async (req, res) => {
    const validatedCartItem = validateRequest(insertCartItemSchema, req, res);
    if (!validatedCartItem) return;
    
    // Set userId from session
    validatedCartItem.userId = req.session.userId!;
    
    const cartItem = await storage.addToCart(validatedCartItem);
    res.status(201).json(cartItem);
  });
  
  apiRouter.get('/cart', isAuthenticated, async (req, res) => {
    const cartItems = await storage.getCartItems(req.session.userId!);
    res.json(cartItems);
  });
  
  apiRouter.delete('/cart/:id', isAuthenticated, async (req, res) => {
    const cartItemId = parseInt(req.params.id);
    if (isNaN(cartItemId)) {
      return res.status(400).json({ message: "Invalid cart item ID" });
    }
    
    const success = await storage.removeFromCart(cartItemId);
    if (!success) {
      return res.status(404).json({ message: "Cart item not found" });
    }
    
    res.json({ message: "Cart item removed successfully" });
  });
  
  apiRouter.delete('/cart', isAuthenticated, async (req, res) => {
    await storage.clearCart(req.session.userId!);
    res.json({ message: "Cart cleared successfully" });
  });
  
  // Purchase routes
  apiRouter.post('/purchases', isAuthenticated, async (req, res) => {
    const validatedPurchase = validateRequest(insertPurchaseSchema, req, res);
    if (!validatedPurchase) return;
    
    // Set userId from session
    validatedPurchase.userId = req.session.userId!;
    
    // In a real app, we would handle payment processing here
    
    const purchase = await storage.createPurchase(validatedPurchase);
    res.status(201).json(purchase);
  });
  
  apiRouter.get('/purchases', isAuthenticated, async (req, res) => {
    const purchases = await storage.getPurchasesByUser(req.session.userId!);
    res.json(purchases);
  });
  
  // File upload routes
  apiRouter.post('/upload', isContributorOrAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Get asset type and metadata from the form
      const { type, title, description, price, categories, keywords, licenseType } = req.body;
      
      if (!type || !title || !price) {
        return res.status(400).json({ 
          message: "Missing required fields: type, title, and price are required" 
        });
      }
      
      // Optimize image or video based on asset type
      let uploadResult;
      let fileSize = fs.statSync(req.file.path).size;
      const filePath = req.file.path;
      
      // Process different media types
      if (['photo', 'illustration', 'vector'].includes(type)) {
        // For images, optimize and add watermark
        const optimizedPath = await optimizeImage(filePath);
        const thumbnailPath = await generateThumbnail(filePath);
        
        uploadResult = await uploadImageWithWatermark(optimizedPath, type as 'photo' | 'illustration' | 'vector');
        
        // Clean up temporary files
        cleanupTempFiles(filePath, optimizedPath, thumbnailPath);
      } else if (type === 'video') {
        // For videos, upload with watermark
        uploadResult = await uploadVideoWithWatermark(filePath);
        
        // Clean up temporary file
        cleanupTempFiles(filePath);
      } else if (type === 'music') {
        // For audio files, simply upload to Cloudinary
        const result = await cloudinary.v2.uploader.upload(filePath, {
          resource_type: 'auto',
          folder: 'jawastock/audio',
          use_filename: true,
          tags: ['music', 'audio']
        });
        
        uploadResult = {
          watermarked: {
            url: result.secure_url,
            publicId: result.public_id,
          },
          original: {
            url: result.secure_url,
            publicId: result.public_id
          },
          format: result.format,
          duration: result.duration,
          resourceType: 'audio'
        };
        
        // Clean up temporary file
        cleanupTempFiles(filePath);
      } else {
        // Unsupported asset type
        cleanupTempFiles(filePath);
        return res.status(400).json({ message: "Unsupported asset type" });
      }
      
      // Create asset record in database
      const newAsset = await storage.createAsset({
        title,
        description: description || null,
        type,
        url: uploadResult.watermarked.url,
        thumbnailUrl: uploadResult.watermarked.url, // We'll use the same URL for now
        originalUrl: uploadResult.original.url,
        price: Number(price),
        authorId: req.session.userId!,
        publicId: uploadResult.watermarked.publicId,
        originalPublicId: uploadResult.original.publicId,
        status: 'pending', // New uploads are pending by default
        width: uploadResult.width,
        height: uploadResult.height,
        fileSize,
        format: uploadResult.format,
        categories: categories ? JSON.parse(categories) : [],
        keywords: keywords ? JSON.parse(keywords) : [],
        licenseType: licenseType || 'standard'
      });
      
      res.status(201).json(newAsset);
    } catch (error: any) {
      console.error("Error uploading file:", error);
      res.status(500).json({ 
        message: "Error uploading file", 
        error: error.message 
      });
    }
  });
  
  // Route to get a signed URL for a purchased asset
  apiRouter.get('/assets/:id/download', isAuthenticated, async (req, res) => {
    const assetId = parseInt(req.params.id);
    if (isNaN(assetId)) {
      return res.status(400).json({ message: "Invalid asset ID" });
    }
    
    // Check if the user has purchased this asset
    const userId = req.session.userId!;
    const purchases = await storage.getPurchasesByUser(userId);
    const hasPurchased = purchases.some(purchase => purchase.assetId === assetId);
    
    if (!hasPurchased) {
      return res.status(403).json({ message: "You need to purchase this asset first" });
    }
    
    // Generate a signed URL that expires in 24 hours
    const asset = await storage.getAsset(assetId);
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }
    
    const expiryDate = new Date();
    expiryDate.setTime(expiryDate.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    
    try {
      const signedUrl = await generateSignedUrl(asset.originalPublicId, expiryDate);
      res.json({ downloadUrl: signedUrl, expiresAt: expiryDate });
    } catch (error: any) {
      console.error("Error generating signed URL:", error);
      res.status(500).json({ 
        message: "Error generating download URL", 
        error: error.message 
      });
    }
  });
  
  // Stripe payment routes
  apiRouter.post('/create-payment-intent', isAuthenticated, async (req, res) => {
    try {
      const { amount } = req.body;
      
      if (!amount || isNaN(Number(amount))) {
        return res.status(400).json({ message: "Valid amount is required" });
      }
      
      // Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        // In a real app, add metadata about the purchase and customer
        metadata: {
          userId: req.session.userId!.toString(),
          integration_check: 'jawastock_payment'
        }
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret 
      });
    } catch (error: any) {
      console.error("Stripe payment intent error:", error);
      res.status(500).json({ 
        message: "Error creating payment intent", 
        error: error.message 
      });
    }
  });
  
  // Route to complete a purchase after payment
  apiRouter.post('/complete-purchase', isAuthenticated, async (req, res) => {
    try {
      const { cartItems, paymentIntentId } = req.body;
      
      if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({ message: "Cart items are required" });
      }
      
      // Verify payment with Stripe
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status !== 'succeeded') {
        return res.status(400).json({ message: "Payment has not been completed" });
      }
      
      // Create purchase records for each cart item
      const purchases = [];
      for (const item of cartItems) {
        const purchase = await storage.createPurchase({
          userId: req.session.userId!,
          assetId: item.assetId,
          price: item.price,
          licenseType: item.licenseType,
          downloadUrl: '', // Will be generated when needed
          expiryDate: null // No expiry for now
        });
        purchases.push(purchase);
      }
      
      // Clear the user's cart
      await storage.clearCart(req.session.userId!);
      
      res.status(201).json({
        success: true,
        message: "Purchase completed successfully",
        purchases
      });
    } catch (error: any) {
      console.error("Error completing purchase:", error);
      res.status(500).json({ 
        message: "Error completing purchase", 
        error: error.message 
      });
    }
  });
  
  // Register the API router
  app.use('/api', apiRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}
