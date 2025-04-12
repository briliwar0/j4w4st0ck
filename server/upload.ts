import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import sharp from 'sharp';

// Ensure the temp upload directory exists
const uploadDir = path.join(process.cwd(), 'temp-uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extname = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extname);
  }
});

// File filter function to validate uploads
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Get asset type from request body
  const assetType = req.body.type;
  
  if (!assetType) {
    return cb(new Error('Asset type is required'));
  }
  
  // Define allowed mime types by asset type
  const allowedMimeTypes: Record<string, string[]> = {
    photo: ['image/jpeg', 'image/png', 'image/webp'],
    illustration: ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'],
    vector: ['image/svg+xml', 'application/pdf', 'application/postscript'],
    video: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'],
    music: ['audio/mpeg', 'audio/wav', 'audio/ogg']
  };
  
  // Check if the file mime type is allowed for the given asset type
  if (!allowedMimeTypes[assetType]?.includes(file.mimetype)) {
    return cb(new Error(`Invalid file type for ${assetType}. Allowed types: ${allowedMimeTypes[assetType].join(', ')}`));
  }
  
  // File is valid
  cb(null, true);
};

// Configure multer upload
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

// Function to resize and optimize images using Sharp
export async function optimizeImage(filePath: string, outputWidth = 1200): Promise<string> {
  const fileExt = path.extname(filePath).toLowerCase();
  const optimizedPath = filePath.replace(fileExt, `-optimized${fileExt}`);
  
  try {
    // Skip SVG optimization
    if (fileExt === '.svg') {
      return filePath;
    }
    
    // Process image with Sharp
    await sharp(filePath)
      .resize(outputWidth, null, { 
        withoutEnlargement: true, 
        fit: 'inside' 
      })
      .toFile(optimizedPath);
    
    return optimizedPath;
  } catch (error) {
    console.error('Error optimizing image:', error);
    return filePath; // Return original path if optimization fails
  }
}

// Function to generate thumbnail
export async function generateThumbnail(filePath: string, width = 400, height = 400): Promise<string> {
  const fileExt = path.extname(filePath).toLowerCase();
  const thumbnailPath = filePath.replace(fileExt, `-thumbnail${fileExt}`);
  
  try {
    // Skip SVG thumbnail generation
    if (fileExt === '.svg') {
      return filePath;
    }
    
    // Create thumbnail with Sharp
    await sharp(filePath)
      .resize(width, height, { 
        fit: 'cover', 
        position: 'attention' 
      })
      .toFile(thumbnailPath);
    
    return thumbnailPath;
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return filePath; // Return original path if thumbnail generation fails
  }
}

// Function to clean up temporary files
export function cleanupTempFiles(...filePaths: string[]) {
  filePaths.forEach(filePath => {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
}

export default { upload, optimizeImage, generateThumbnail, cleanupTempFiles };