import { Asset } from "@shared/schema";

export const trendingAssets: Asset[] = [
  {
    id: 1,
    title: "Modern workspace with notebook",
    description: "A clean, minimalist workspace featuring a notebook and coffee",
    type: "photo",
    url: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017",
    thumbnailUrl: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800&h=600",
    price: 999, // $9.99
    authorId: 2,
    status: "approved",
    tags: ["workspace", "notebook", "minimal", "desk"],
    categories: ["business", "lifestyle"],
    licenseType: "standard",
    width: 1920,
    height: 1080,
    createdAt: new Date("2023-01-15"),
  },
  {
    id: 2,
    title: "Business people shaking hands",
    description: "Professional business meeting with handshake, partnership concept",
    type: "photo",
    url: "https://images.unsplash.com/photo-1521791136064-7986c2920216",
    thumbnailUrl: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&h=600",
    price: 1299, // $12.99
    authorId: 3,
    status: "approved",
    tags: ["business", "handshake", "meeting", "professional"],
    categories: ["business", "people"],
    licenseType: "standard",
    width: 1920,
    height: 1080,
    createdAt: new Date("2023-01-20"),
  },
  {
    id: 3,
    title: "Abstract pattern background",
    description: "Colorful abstract pattern for backgrounds and designs",
    type: "vector",
    url: "https://images.unsplash.com/photo-1493612276216-ee3925520721",
    thumbnailUrl: "https://images.unsplash.com/photo-1493612276216-ee3925520721?w=800&h=600",
    price: 799, // $7.99
    authorId: 2,
    status: "approved",
    tags: ["abstract", "pattern", "colorful", "background"],
    categories: ["backgrounds", "patterns"],
    licenseType: "standard",
    width: 5000,
    height: 5000,
    createdAt: new Date("2023-01-18"),
  },
  {
    id: 4,
    title: "Smartphone mockup on desk",
    description: "Realistic smartphone mockup on a wooden desk",
    type: "photo",
    url: "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7",
    thumbnailUrl: "https://images.unsplash.com/photo-1553356084-58ef4a67b2a7?w=800&h=600",
    price: 1499, // $14.99
    authorId: 3,
    status: "approved",
    tags: ["mockup", "smartphone", "desk", "technology"],
    categories: ["technology", "mockups"],
    licenseType: "standard",
    width: 1920,
    height: 1080,
    createdAt: new Date("2023-01-25"),
  },
];

export const featuredVideos: Asset[] = [
  {
    id: 5,
    title: "Aerial drone footage of beach",
    description: "Beautiful aerial view of a tropical beach with crystal clear water",
    type: "video",
    url: "https://images.unsplash.com/photo-1536240478700-b869070f9279",
    thumbnailUrl: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800&h=450",
    price: 2999, // $29.99
    authorId: 2,
    status: "approved",
    tags: ["aerial", "beach", "drone", "tropical"],
    categories: ["nature", "travel"],
    licenseType: "standard",
    width: 3840,
    height: 2160,
    duration: 32, // 32 seconds
    fileSize: 45000000, // 45MB
    createdAt: new Date("2023-02-01"),
  },
  {
    id: 6,
    title: "Timelapse of city skyline",
    description: "Beautiful timelapse of a modern city skyline from day to night",
    type: "video",
    url: "https://images.unsplash.com/photo-1551818255-e6e10975bc17",
    thumbnailUrl: "https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=800&h=450",
    price: 1999, // $19.99
    authorId: 3,
    status: "approved",
    tags: ["timelapse", "city", "skyline", "urban"],
    categories: ["urban", "cities"],
    licenseType: "standard",
    width: 1920,
    height: 1080,
    duration: 15, // 15 seconds
    fileSize: 25000000, // 25MB
    createdAt: new Date("2023-02-05"),
  },
  {
    id: 7,
    title: "Coffee pour slow motion",
    description: "Slow motion footage of coffee being poured into a cup",
    type: "video",
    url: "https://images.unsplash.com/photo-1532799755889-1247a1b7f014",
    thumbnailUrl: "https://images.unsplash.com/photo-1532799755889-1247a1b7f014?w=800&h=450",
    price: 2499, // $24.99
    authorId: 2,
    status: "approved",
    tags: ["coffee", "slow motion", "pour", "drink"],
    categories: ["food", "drinks"],
    licenseType: "standard",
    width: 3840,
    height: 2160,
    duration: 24, // 24 seconds
    fileSize: 40000000, // 40MB
    createdAt: new Date("2023-02-10"),
  },
  {
    id: 8,
    title: "Abstract motion background",
    description: "Colorful abstract motion background for video projects",
    type: "video",
    url: "https://images.unsplash.com/photo-1610128114197-485d933885c5",
    thumbnailUrl: "https://images.unsplash.com/photo-1610128114197-485d933885c5?w=800&h=450",
    price: 1699, // $16.99
    authorId: 3,
    status: "approved",
    tags: ["abstract", "motion", "background", "colorful"],
    categories: ["backgrounds", "motion graphics"],
    licenseType: "standard",
    width: 1920,
    height: 1080,
    duration: 20, // 20 seconds
    fileSize: 30000000, // 30MB
    createdAt: new Date("2023-02-15"),
  },
];

export const popularIllustrations: Asset[] = [
  {
    id: 9,
    title: "Abstract geometric pattern",
    description: "Modern abstract geometric pattern for backgrounds",
    type: "illustration",
    url: "https://images.unsplash.com/photo-1574169208507-84376144848b",
    thumbnailUrl: "https://images.unsplash.com/photo-1574169208507-84376144848b?w=800&h=800",
    price: 599, // $5.99
    authorId: 2,
    status: "approved",
    tags: ["abstract", "geometric", "pattern"],
    categories: ["patterns", "backgrounds"],
    licenseType: "standard",
    width: 5000,
    height: 5000,
    createdAt: new Date("2023-03-01"),
  },
  {
    id: 10,
    title: "Business illustration",
    description: "Flat design business concept illustration",
    type: "illustration",
    url: "https://images.unsplash.com/photo-1604871000636-074fa5117945",
    thumbnailUrl: "https://images.unsplash.com/photo-1604871000636-074fa5117945?w=800&h=800",
    price: 899, // $8.99
    authorId: 3,
    status: "approved",
    tags: ["business", "illustration", "flat design"],
    categories: ["business", "marketing"],
    licenseType: "standard",
    width: 3000,
    height: 3000,
    createdAt: new Date("2023-03-05"),
  },
  {
    id: 11,
    title: "Floral vector pattern",
    description: "Beautiful floral pattern for fashion and textile design",
    type: "vector",
    url: "https://images.unsplash.com/photo-1572375992501-4b0892d50c69",
    thumbnailUrl: "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=800&h=800",
    price: 699, // $6.99
    authorId: 2,
    status: "approved",
    tags: ["floral", "pattern", "vector", "textile"],
    categories: ["patterns", "fashion"],
    licenseType: "standard",
    width: 4000,
    height: 4000,
    createdAt: new Date("2023-03-10"),
  },
  {
    id: 12,
    title: "Social media icons set",
    description: "Modern social media icons set in vector format",
    type: "vector",
    url: "https://images.unsplash.com/photo-1579547621706-1a9c79d5c9f1",
    thumbnailUrl: "https://images.unsplash.com/photo-1579547621706-1a9c79d5c9f1?w=800&h=800",
    price: 1299, // $12.99
    authorId: 3,
    status: "approved",
    tags: ["social media", "icons", "vector"],
    categories: ["icons", "ui"],
    licenseType: "standard",
    width: 3000,
    height: 3000,
    createdAt: new Date("2023-03-15"),
  },
  {
    id: 13,
    title: "Minimalist landscape illustration",
    description: "Simple and elegant landscape illustration in minimalist style",
    type: "illustration",
    url: "https://images.unsplash.com/photo-1550227720-8033c39af58c",
    thumbnailUrl: "https://images.unsplash.com/photo-1550227720-8033c39af58c?w=800&h=800",
    price: 999, // $9.99
    authorId: 2,
    status: "approved",
    tags: ["landscape", "minimalist", "illustration"],
    categories: ["nature", "illustrations"],
    licenseType: "standard",
    width: 3500,
    height: 3500,
    createdAt: new Date("2023-03-20"),
  },
  {
    id: 14,
    title: "Infographic elements pack",
    description: "Comprehensive pack of infographic elements and charts",
    type: "vector",
    url: "https://images.unsplash.com/photo-1611068813580-b07ef920964b",
    thumbnailUrl: "https://images.unsplash.com/photo-1611068813580-b07ef920964b?w=800&h=800",
    price: 1499, // $14.99
    authorId: 3,
    status: "approved",
    tags: ["infographic", "charts", "business", "data"],
    categories: ["business", "infographics"],
    licenseType: "standard",
    width: 5000,
    height: 5000,
    createdAt: new Date("2023-03-25"),
  },
];

export const allAssets: Asset[] = [...trendingAssets, ...featuredVideos, ...popularIllustrations];
