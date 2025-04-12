import { v2 as cloudinary } from 'cloudinary';

// Configuration 
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Check if configuration is valid
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('Cloudinary credentials not fully configured. File upload features may not work correctly.');
}

// Upload image with watermark
export async function uploadImageWithWatermark(imagePath: string, assetType: 'photo' | 'illustration' | 'vector') {
  try {
    // Add a watermark overlay with Jawastock text
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'jawastock',
      resource_type: 'image',
      tags: [assetType, 'watermarked'],
      transformation: [
        { width: 1200, crop: 'limit' },
        { overlay: { font_family: 'Arial', font_size: 40, text: 'JawaStock' }, 
          gravity: 'center', 
          opacity: 30,
          angle: 45,
          color: '#FFFFFF'
        }
      ]
    });
    
    // Also upload original without watermark (accessible only after purchase)
    const originalResult = await cloudinary.uploader.upload(imagePath, {
      folder: 'jawastock/originals',
      resource_type: 'image',
      tags: [assetType, 'original'],
      access_mode: 'authenticated'
    });
    
    return {
      watermarked: {
        url: result.secure_url,
        publicId: result.public_id,
      },
      original: {
        url: originalResult.secure_url,
        publicId: originalResult.public_id
      },
      width: result.width,
      height: result.height,
      format: result.format,
      resourceType: result.resource_type
    };
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw error;
  }
}

// Upload video with watermark
export async function uploadVideoWithWatermark(videoPath: string) {
  try {
    // Add a watermark overlay with Jawastock text
    const result = await cloudinary.uploader.upload(videoPath, {
      folder: 'jawastock',
      resource_type: 'video',
      tags: ['video', 'watermarked'],
      transformation: [
        { width: 1200, crop: 'limit' },
        { overlay: { font_family: 'Arial', font_size: 40, text: 'JawaStock' }, 
          gravity: 'center', 
          opacity: 30
        }
      ]
    });
    
    // Also upload original without watermark (accessible only after purchase)
    const originalResult = await cloudinary.uploader.upload(videoPath, {
      folder: 'jawastock/originals',
      resource_type: 'video',
      tags: ['video', 'original'],
      access_mode: 'authenticated'
    });
    
    return {
      watermarked: {
        url: result.secure_url,
        publicId: result.public_id,
      },
      original: {
        url: originalResult.secure_url,
        publicId: originalResult.public_id
      },
      width: result.width,
      height: result.height,
      format: result.format,
      duration: result.duration,
      resourceType: result.resource_type
    };
  } catch (error) {
    console.error('Error uploading video to Cloudinary:', error);
    throw error;
  }
}

// Generate a signed URL for accessing private resources
export async function generateSignedUrl(publicId: string, expiresAt: Date): Promise<string> {
  const timestamp = Math.floor(expiresAt.getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request(
    { public_id: publicId, timestamp },
    process.env.CLOUDINARY_API_SECRET!
  );
  
  return cloudinary.url(publicId, {
    secure: true,
    type: 'authenticated',
    sign_url: true,
    signature,
    timestamp
  });
}

export default cloudinary;