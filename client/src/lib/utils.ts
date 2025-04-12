import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return `$${(price / 100).toFixed(2)}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function calculateDiscountPercentage(originalPrice: number, salePrice: number): number {
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getAssetTypeIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'photo':
      return 'image';
    case 'video':
      return 'video';
    case 'vector':
      return 'pen-tool';
    case 'illustration':
      return 'palette';
    case 'music':
      return 'music';
    default:
      return 'file';
  }
}

export function generateImagePlaceholder(width: number, height: number, text: string = 'JawaStock'): string {
  return `https://via.placeholder.com/${width}x${height}?text=${encodeURIComponent(text)}`;
}

export function getFileExtensionFromType(type: string): string {
  switch (type.toLowerCase()) {
    case 'photo':
      return 'jpg';
    case 'vector':
      return 'svg';
    case 'illustration':
      return 'png';
    case 'video':
      return 'mp4';
    case 'music':
      return 'mp3';
    default:
      return 'jpg';
  }
}
